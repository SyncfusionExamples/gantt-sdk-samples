import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  KanbanComponent,
  ColumnsDirective,
  ColumnDirective
} from '@syncfusion/ej2-react-kanban';
import {
  salesCards as initialSalesCards,
  salesOwners,
  salesProjects,
  stageOrder,
  stageLabel,
  isTerminalStage,
  showForecastBadge,
  terminalDateLabel,
  terminalDateValue,
  priorityClass as makePriorityClass
} from '../data/pipelineData.js';
import { formatDate, formatUsd, formatPercent } from '../components/kanban/formatters.js';
import DashboardStats from '../components/kanban/DashboardStats.jsx';
import FilterBar from '../components/kanban/FilterBar.jsx';
import CardDialog from '../components/kanban/CardDialog.jsx';
import DeleteConfirmDialog from '../components/kanban/DeleteConfirmDialog.jsx';
import ErrorBoundary from '../components/layout/ErrorBoundary.jsx';

/**
 * SalesPipelinePage — Page 1.
 *
 * Visual & behavioural parity with the Syncfusion Sales CRM Pipeline
 * showcase (https://showcase.syncfusion.com/sales-crm/react/pipeline):
 *  - Page header: "Pipeline Kanban" + subtitle
 *  - 6 stages with column item counts (Qualification 9 ... Closed Lost 10)
 *  - Card template: title, forecast chip, account, USD amount, meta grid
 *  - "Edit Card Details" dialog with ID/Stage/Content fields
 *  - Save | Cancel | Delete buttons (Save styled as primary)
 *  - Drag-and-drop stage changes update the model
 *  - New Card via "+" button on each column AND a "New Card" CTA
 */
export default function SalesPipelinePage() {
  const [cards, setCards] = useState(initialSalesCards);
  const [filters, setFilters] = useState({ search: '', assignee: null, project: null, range: null });
  const [dialogState, setDialogState] = useState({ open: false, mode: 'edit', value: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, card: null });
  const kanbanRef = useRef(null);
  const idCounterRef = useRef(initialSalesCards.length + 1000);
  // Always-fresh reference to the cards list, used by the delegated
  // DOM click handler so it can resolve which card id was clicked
  // inside a `mousedown` listener (no React tree to traverse).
  const cardsRef = useRef(cards);
  useEffect(() => { cardsRef.current = cards; }, [cards]);

  // ------------------------------------------------------------------
  // 1. Filtering
  // ------------------------------------------------------------------
  const filtered = useMemo(() => {
    const q = (filters.search || '').trim().toLowerCase();
    const { assignee, project, range } = filters;
    // Normalise the picker endpoints to local-midnight once per
    // filter change. `expectedCloseDate` is a date-only string
    // ("YYYY-MM-DD") which `new Date(...)` parses as UTC midnight
    // — comparing that against a local-midnight `Date` from the
    // picker gives off-by-a-few-hours false negatives at the
    // upper boundary in any non-UTC timezone. We collapse both
    // sides to a local day number (yyyy-mm-dd in local TZ) so the
    // comparison is timezone-safe and inclusive of the end day.
    const inRange = (iso) => {
      if (!range || !range.startDate || !range.endDate) return true;
      if (!iso) return false;
      const d = new Date(iso);
      if (isNaN(d.getTime())) return false;
      const t = d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();
      const s = range.startDate;
      const e = range.endDate;
      const lo = s.getFullYear() * 10000 + s.getMonth() * 100 + s.getDate();
      const hi = e.getFullYear() * 10000 + e.getMonth() * 100 + e.getDate();
      return t >= lo && t <= hi;
    };
    return cards.filter((c) => {
      if (q) {
        const hay = `${c.id} ${c.title} ${c.content} ${c.account} ${c.owner} ${(c.tags || []).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (assignee && c.owner !== assignee) return false;
      if (project && project !== 'All Accounts' && c.account !== project) return false;
      if (!inRange(c.expectedCloseDate)) return false;
      return true;
    });
  }, [cards, filters]);

  // ------------------------------------------------------------------
  // 2. Dashboard KPI metrics
  // ------------------------------------------------------------------
  const metrics = useMemo(() => {
    const byStage = (s) => filtered.filter((c) => c.stage === s).length;
    const totalValue = filtered
      .filter((c) => c.stage !== 'ClosedLost')
      .reduce((s, c) => s + (Number(c.amount) || 0), 0);
    return [
      { label: 'Qualification', value: byStage('Qualification'), hint: 'New opportunities', accent: true },
      { label: 'Discovery',     value: byStage('Discovery'),     hint: 'Active discovery' },
      { label: 'Proposal',      value: byStage('Proposal'),      hint: 'Pricing in flight' },
      { label: 'Negotiation',   value: byStage('Negotiation'),   hint: 'Final terms' },
      { label: 'Closed Won',    value: byStage('ClosedWon'),     hint: 'Booked revenue' },
      { label: 'Pipeline $',    value: formatUsd(totalValue),    hint: 'Excludes Closed Lost' }
    ];
  }, [filtered]);

  // ------------------------------------------------------------------
  // 3. Columns & card template (showcase-parity)
  // ------------------------------------------------------------------
  const columns = useMemo(
    () => stageOrder.map((stage) => ({ headerText: stageLabel(stage), keyField: stage })),
    []
  );

  /**
   * Card template — visually mirrors the Sales CRM showcase.
   * Layout (top -> bottom):
   *   1. Title row (title + trash icon top-right)
   *   2. Forecast chip on its own row (only on active stages)
   *   3. Account line (muted)
   *   4. Big green USD amount
   *   5. 2x2 meta grid for active cards or terminal meta for
   *      Closed Won / Closed Lost
   *
   * IMPORTANT — DOM ownership
   *   Syncfusion's Kanban clones the React elements the template
   *   returns so it can stamp out one DOM tree per card. React
   *   doesn't see those clones, so if we hand back a `<button>` with
   *   an `onClick` prop, React tracks a virtual node that Syncfusion
   *   freely detaches / re-inserts. When the user clicks Delete and
   *   the list re-renders, the next reconciliation pass calls
   *   `removeChild` against a node that's already gone -> the
   *   `Failed to execute 'removeChild' on 'Node'` crash.
   *
   *   The fix is to (a) hand back a stateless `<span>` placeholder
   *   with `data-card-id` so React doesn't track any listeners and
   *   (b) wire a real DOM listener on the kanban root that captures
   *   clicks on `[data-card-delete]`. That listener lives outside of
   *   React's commit phase entirely, so Syncfusion and React stop
   *   fighting over child ownership.
   */

  const cardTemplate = useMemo(
    () => (card) => {
      if (!card) return null;
      const terminal = isTerminalStage(card);
      return (
        <div
          className="pipeline-card-template"
          role="group"
          aria-label={`Deal ${card.id}`}
        >
          <div className="pipeline-card-head">
            <div className="pipeline-card-title">{card.title}</div>
            <span
              className="pipeline-card-delete"
              role="button"
              aria-label={`Delete ${card.id}`}
              title="Delete card"
              data-card-delete="1"
              data-card-id={card.id}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
              </svg>
            </span>
          </div>

          {showForecastBadge(card) && (
            <div className="pipeline-card-badge-row">
              <span className={`forecast-chip forecast-${card.forecastCategory.toLowerCase().replace(' ', '-')}`}>
                {card.forecastCategory}
              </span>
            </div>
          )}

          <div className="pipeline-card-account">{card.account}</div>

          <div className="pipeline-card-amount">{formatUsd(card.amount)}</div>

          {terminal ? (
            <dl className="pipeline-card-meta terminal-meta">
              <div>
                <dt>Owner</dt>
                <dd>{card.owner}</dd>
              </div>
              <div>
                <dt>{terminalDateLabel(card)}</dt>
                <dd>{formatDate(terminalDateValue(card))}</dd>
              </div>
              {card.stage === 'ClosedWon' && typeof card.salesCycleDays === 'number' && Number.isFinite(card.salesCycleDays) ? (
                <div>
                  <dt>Cycle</dt>
                  <dd>{card.salesCycleDays} days</dd>
                </div>
              ) : null}
              {card.stage === 'ClosedLost' && card.lossReason ? (
                <div className="pipeline-card-meta-wide">
                  <dt>Loss Reason</dt>
                  <dd>{card.lossReason}</dd>
                </div>
              ) : null}
            </dl>
          ) : (
            <dl className="pipeline-card-meta">
              <div>
                <dt>Owner</dt>
                <dd>{card.owner}</dd>
              </div>
              <div>
                <dt>Close</dt>
                <dd>{formatDate(card.expectedCloseDate)}</dd>
              </div>
              <div>
                <dt>Prob.</dt>
                <dd>{formatPercent(card.probability)}</dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd><span className={makePriorityClass(card.priority)}>{card.priority}</span></dd>
              </div>
            </dl>
          )}
        </div>
      );
    },
    []
  );

  const cardSettings = useMemo(
    () => ({
      headerField: 'id',
      contentField: 'content',
      template: cardTemplate,
      showHeader: false
    }),
    [cardTemplate]
  );

  // ------------------------------------------------------------------
  // 4. Edit dialog — full CRUD form (mirrors the Healthcare Waitlist
  //    dialog richness). All editable fields shown when creating or
  //    editing a card. Read-only mode is the only one that uses the
  //    3-field showcase layout.
  // ------------------------------------------------------------------
  const dialogSchema = useMemo(
    () => ({
      title: 'Card Details',
      fields: [
        { key: 'id',                 label: 'ID',                 type: 'readonly' },
        // The previous version had a separate `title` text input
        // AND a `content` textarea — both held the same value,
        // forcing users to maintain duplicate data. The schema
        // now exposes ONLY a single `content` text input which
        // serves as both the card's title (rendered in the card
        // template via `card.title`) and its body. The save
        // handler mirrors the entered value into the card's
        // `title` field so existing rendering code keeps working
        // without a schema rename.
        { key: 'content',            label: 'Content',            type: 'text',     required: true,  span: 'full' },
        { key: 'account',            label: 'Account',            type: 'dropdown', options: salesProjects.filter((p) => p !== 'All Accounts'), required: true },
        { key: 'owner',              label: 'Owner',              type: 'dropdown', options: salesOwners, required: true },
        { key: 'amount',             label: 'Amount (USD)',       type: 'number',   format: 'n0', required: true },
        { key: 'stage',              label: 'Stage',              type: 'dropdown', options: stageOrder.map(stageLabel), valueKeyMap: Object.fromEntries(stageOrder.map((s) => [stageLabel(s), s])), required: true },
        { key: 'priority',           label: 'Priority',           type: 'dropdown', options: ['Critical', 'High', 'Medium', 'Low'], required: true },
        { key: 'forecastCategory',   label: 'Forecast',           type: 'dropdown', options: ['Pipeline', 'Best Case', 'Commit', 'Omitted'] },
        { key: 'probability',        label: 'Probability (%)',    type: 'number',   format: 'n0' },
        { key: 'expectedCloseDate',  label: 'Expected close',     type: 'date' }
      ]
    }),
    []
  );

  // ------------------------------------------------------------------
  // 5. Event handlers
  // ------------------------------------------------------------------
  // Note: there used to be an `isDeletingRef` guard here that briefly
  // blocked `dataBound` events during a programmatic delete. With
  // the simplified delete flow (pure `setCards` only) the guard is
  // no longer needed — the event handlers below already operate on
  // the React state, which is the single source of truth.

  const openEdit = (card) => {
    if (!card) return;
    setDialogState({ open: true, mode: 'edit', value: card });
  };

  // Single-click is intentionally a no-op — the edit dialog only
  // opens on double-click. We also explicitly ignore click events
  // whose target sits inside the per-card trash icon so Syncfusion
  // never fires `cardClick` / `cardDoubleClick` on a delete-click.
  // (`e.originalEvent` is the underlying browser event the kanban
  // wrapped — we use it to test for the data-card-delete marker.)
  const handleCardClick = (card, evt) => {
    if (evt?.originalEvent?.target?.closest?.('[data-card-delete="1"]')) return;
  };
  const handleCardDoubleClick = (card, evt) => {
    if (evt?.originalEvent?.target?.closest?.('[data-card-delete="1"]')) return;
    openEdit(card);
  };

  // Confirm-delete flow — handled by the global trash icon button
  // rendered on each card (see cardTemplate).
  const requestDelete = (card) => {
    if (!card) return;
    setConfirmDelete({ open: true, card });
  };

  const cancelDelete = () => {
    setConfirmDelete({ open: false, card: null });
  };

  /**
   * Delete card — pure React state.
   *
   * The kanban reads its data from `dataSource={filtered}` which is
   * derived from `cards`. Updating `cards` through `setCards` is
   * therefore enough to make the card vanish: React re-renders,
   * the filtered memo re-computes, the kanban's `dataSource` prop
   * changes, and Syncfusion's internal diff removes the now-missing
   * card from its DOM.
   *
   * Previous versions of this function called Syncfusion's
   * imperative APIs (`k.deleteCard`, `k.dataSource = ...`,
   * `k.refresh('cards')`) in addition to `setCards` — that was
   * a workaround for the recurring
   * `Failed to execute 'removeChild' on 'Node'` crash, whose actual
   * root cause was an out-of-order Dialog teardown. With the dialog
   * fixed, those imperative calls are redundant: they fire a
   * separate Syncfusion render pass that races React's reconciliation
   * and is exactly what was producing the
   *   Uncaught TypeError: Cannot convert undefined or null to object
   *     at hasOwnProperty (<anonymous>)
   * stack trace through observer.js / notify-property-change.js /
   * component-base.js. Dropping them is not just a code-size win —
   * it eliminates the second observer pass entirely.
   */
  const performDelete = () => {
    const target = confirmDelete.card;
    if (!target) return;

    // Close the confirmation dialog first. DeleteConfirmDialog's
    // close branch now does a single rAF + unmount, so the popup
    // teardown runs in lockstep with React's next commit and never
    // leaves Syncfusion's observer chain holding a destroyed
    // reference.
    setConfirmDelete({ open: false, card: null });

    setCards((prev) => prev.filter((c) => c.id !== target.id));

    window.__toast?.({
      title: 'Card deleted',
      content: `${target.id} · ${target.title || target.content}`,
      cssClass: 'e-toast-warning'
    });
  };

  const handleAddTask = () => {
    const newId = `PIPE-${idCounterRef.current++}`;
    const newCard = {
      id: newId,
      title: 'New Opportunity',
      content: 'New Opportunity',
      stage: 'Qualification',
      owner: salesOwners[0],
      account: salesProjects.find((p) => p !== 'All Accounts') || salesProjects[0],
      amount: 10000,
      probability: 20,
      priority: 'Medium',
      forecastCategory: 'Pipeline',
      expectedCloseDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      wonDate: null,
      lostDate: null,
      lossReason: null,
      salesCycleDays: null,
      tags: ['new-logo']
    };
    setDialogState({ open: true, mode: 'create', value: newCard });
  };

  /**
   * Map the dialog's "displayed" stage label back to the canonical
   * stage key (e.g. "Closed Won" -> "ClosedWon").
   */
  const resolveStageKey = (displayLabel) => {
    const match = stageOrder.find((s) => stageLabel(s) === displayLabel);
    return match || displayLabel;
  };

  const handleSave = (value) => {
    // The CardDialog returns display labels for dropdowns. Map the
    // stage display label back to the canonical stage key.
    const stageKey = resolveStageKey(value.stage);

    setCards((prev) => {
      const exists = prev.some((p) => p.id === value.id);
      // The dialog no longer exposes a separate `title` field —
      // it only has a single `content` input. We mirror that
      // value into the card's `title` field (the card template
      // renders `{card.title}`) so the kanban card continues to
      // display the entered text without a schema rename.
      const normalised = {
        ...value,
        stage: stageKey,
        amount: Number(value.amount) || 0,
        probability: Number(value.probability) || 0,
        title: value.content,
        tags: typeof value.tags === 'string'
          ? value.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : Array.isArray(value.tags) ? value.tags : []
      };
      if (exists) {
        window.__toast?.({
          title: 'Card updated',
          content: `${normalised.id} · ${normalised.title}`,
          cssClass: 'e-toast-success'
        });
        return prev.map((p) => (p.id === normalised.id ? { ...p, ...normalised } : p));
      }
      window.__toast?.({
        title: 'Card created',
        content: `${normalised.id} · ${normalised.title}`,
        cssClass: 'e-toast-success'
      });
      return [normalised, ...prev];
    });
    setDialogState({ open: false, mode: 'edit', value: null });
  };

  // CardDialog's "Delete" button calls this with the full card value.
  // Route it through `performDelete` so we use the same
  // imperative + RAF-sequenced path as the trash-icon flow,
  // instead of `setCards` which races Syncfusion's DOM.
  const handleDelete = (value) => {
    if (!value) return;
    setConfirmDelete({ open: true, card: value });
    setDialogState({ open: false, mode: 'edit', value: null });
  };

  /**
   * After a drag completes, sync the card's stage to React state and
   * surface a toast.
   */
  const handleDragStop = (e) => {
    const updated = e?.data ? (Array.isArray(e.data) ? e.data[0] : e.data) : null;
    if (updated && updated.id) {
      setCards((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
      window.__toast?.({
        title: 'Card moved',
        content: `${updated.id} → ${stageLabel(updated.stage)}`,
        cssClass: 'e-toast-info'
      });
    }
  };

  /**
   * Cancel Syncfusion's built-in card-edit dialog. We use our own
   * `CardDialog` instead so the kanban shows zero native popups —
   * only the React-controlled dialog appears on double-click.
   */
  const handleDialogOpen = (e) => {
    if (e && typeof e.cancel === 'boolean') {
      e.cancel = true;
    }
  };

  /**
   * Delegated click handler for the trash button rendered inside each
   * card template. We attach it on `mousedown` so React never has to
   * reconcile the click — the Syncfusion kanban owns the cloned DOM
   * nodes and React owns the model only. Resolving the clicked card
   * is a simple lookup in `cardsRef` to avoid a stale-closure on the
   * list.
   */
  useEffect(() => {
    const kanbanEl = kanbanRef.current?.element;
    if (!kanbanEl) return undefined;
    const onMouseDown = (e) => {
      const target = e.target?.closest?.('[data-card-delete="1"]');
      if (!target) return;
      const cardId = target.getAttribute('data-card-id');
      if (!cardId) return;
      e.preventDefault();
      e.stopPropagation();
      const card = cardsRef.current.find((c) => c.id === cardId) || null;
      setConfirmDelete({ open: true, card });
    };
    kanbanEl.addEventListener('mousedown', onMouseDown);
    return () => kanbanEl.removeEventListener('mousedown', onMouseDown);
  }, []);

  return (
    <>
      {/* ---------- Page header (showcase parity) ---------- */}
      <div className="page-header">
        <div className="page-header__title">
          <span className="icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="5" height="18" rx="1" />
              <rect x="10" y="3" width="5" height="14" rx="1" />
              <rect x="17" y="3" width="4" height="9" rx="1" />
            </svg>
          </span>
          <div>
            <h1>Pipeline Kanban</h1>
            <div className="page-header__sub">
              Stage-based deal movement and prioritization.
            </div>
          </div>
        </div>
      </div>

      <DashboardStats metrics={metrics} />

      <FilterBar
        assignees={salesOwners}
        projects={salesProjects}
        searchPlaceholder="Search deals, accounts, owners..."
        assigneeLabel="Owner"
        projectLabel="Account"
        onChange={setFilters}
        onAddTask={handleAddTask}
      />

      {/* ---------- Kanban (directly inlined so the JSX matches the
                  showcase 1:1 and we keep drag/event parity) ---------- */}
      <div className="kanban-wrap pipeline-kanban">
        <ErrorBoundary>
          <KanbanComponent
            id="sales-kanban"
            ref={kanbanRef}
            keyField="stage"
            dataSource={filtered}
            cardSettings={cardSettings}
            allowDragAndDrop
            allowKeyboard
            cardClick={(e) => handleCardClick(e.data, e)}
            cardDoubleClick={(e) => handleCardDoubleClick(e.data, e)}
            dragStop={handleDragStop}
            dialogOpen={handleDialogOpen}
            cssClass="e-pipeline-kanban"
          >
            <ColumnsDirective>
              {columns.map((c) => (
                <ColumnDirective
                  key={c.keyField}
                  headerText={c.headerText}
                  keyField={c.keyField}
                  showItemCount
                  isExpanded
                />
              ))}
            </ColumnsDirective>
          </KanbanComponent>
        </ErrorBoundary>
      </div>

      <CardDialog
        mode={dialogState.mode}
        open={dialogState.open}
        schema={dialogSchema}
        initialValue={dialogState.value}
        onClose={() => setDialogState({ open: false, mode: 'edit', value: null })}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      <DeleteConfirmDialog
        open={confirmDelete.open}
        title="Delete card"
        message={
          confirmDelete.card
            ? `Delete ${confirmDelete.card.id} — ${confirmDelete.card.title || confirmDelete.card.content}? This action cannot be undone.`
            : 'Are you sure you want to delete this card?'
        }
        onConfirm={performDelete}
        onClose={cancelDelete}
      />
    </>
  );
}
