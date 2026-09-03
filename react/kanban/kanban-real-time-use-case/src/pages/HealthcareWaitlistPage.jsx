import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  KanbanComponent,
  ColumnsDirective,
  ColumnDirective
} from '@syncfusion/ej2-react-kanban';
import {
  waitlistEntries as initialEntries,
  waitlistProviders,
  waitlistDepartments,
  waitlistAppointmentTypes,
  waitlistLocations,
  waitlistClinics,
  waitlistStages,
  urgencyLevels,
  waitlistProjects
} from '../data/waitlistData.js';
import { formatDate } from '../components/kanban/formatters.js';
import DashboardStats from '../components/kanban/DashboardStats.jsx';
import FilterBar from '../components/kanban/FilterBar.jsx';
import CardDialog from '../components/kanban/CardDialog.jsx';
import DeleteConfirmDialog from '../components/kanban/DeleteConfirmDialog.jsx';
import ErrorBoundary from '../components/layout/ErrorBoundary.jsx';

/**
 * HealthcareWaitlistPage — Page 2.
 *
 * Visual & behavioural parity with the Syncfusion Healthcare Waitlist
 * showcase (https://showcase.healthcare-appointment-ops/react/waitlist):
 *  - Page header: "Healthcare Waitlist" + subtitle
 *  - 4 stages with item counts (Open 26 / Matched 17 / Closed Expired 4 / Closed Cancelled 3)
 *  - 3-level swimlane hierarchy: Department — Location — Clinic
 *  - Card template: patient name, appointment type + priority, provider,
 *    urgency badge, "Xd waiting", date range
 *  - Dialog: View / Edit / Update / Delete / Save / Cancel
 *  - Drag-and-drop, search, urgency & department filters
 */

const statusPalette = {
  Open:            { bg: 'var(--color-sf-bg-brand-primary)',   fg: 'var(--color-sf-fg-brand-primary)' },
  Matched:         { bg: 'var(--color-sf-bg-success-primary)', fg: 'var(--color-sf-fg-success-primary)' },
  ClosedExpired:   { bg: 'var(--color-sf-bg-tertiary)',        fg: 'var(--color-sf-fg-secondary)' },
  ClosedCancelled: { bg: 'var(--color-sf-bg-error-primary)',   fg: 'var(--color-sf-fg-error-primary)' },
  Routine:         { bg: 'var(--color-sf-bg-brand-primary)',   fg: 'var(--color-sf-fg-brand-primary)' },
  Urgent:          { bg: 'var(--color-sf-bg-warning-primary)', fg: 'var(--color-sf-fg-warning-primary)' },
  Emergency:       { bg: 'var(--color-sf-bg-error-primary)',   fg: 'var(--color-sf-fg-error-primary)' }
};

const StatusBadge = ({ status }) => {
  const palette = statusPalette[status] || statusPalette.Open;
  return (
    <span
      className="wl-badge"
      style={{ background: palette.bg, color: palette.fg }}
    >
      {status}
    </span>
  );
};

/** Days waiting helper (mirrors the showcase). */
const daysWaiting = (iso) => {
  if (!iso) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
};

export default function HealthcareWaitlistPage() {
  const [entries, setEntries] = useState(initialEntries);
  const [filters, setFilters] = useState({ search: '', assignee: null, project: null, range: null });
  const [dialogState, setDialogState] = useState({ open: false, mode: 'edit', value: null });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, entry: null });
  const kanbanRef = useRef(null);
  const idCounterRef = useRef(initialEntries.length + 200);
  // Always-fresh reference to the entries list, used by the
  // delegated DOM click handler so it doesn't capture a stale copy.
  const entriesRef = useRef(entries);
  useEffect(() => { entriesRef.current = entries; }, [entries]);
  // Note: there used to be an `isDeletingRef` guard here that briefly
  // blocked `dataBound` events during a programmatic delete. With
  // the simplified delete flow (pure `setEntries` only) the guard is
  // no longer needed — the event handlers below already operate on
  // the React state, which is the single source of truth.

  // ------------------------------------------------------------------
  // 1. Filtering
  // ------------------------------------------------------------------
  const filtered = useMemo(() => {
    const q = (filters.search || '').trim().toLowerCase();
    const { assignee, project, range } = filters;
    // Normalise both sides of the date comparison to a local day
    // number (yyyy-mm-dd in local TZ). `requestDateTime` is a full
    // ISO datetime ("...T10:23:45.000Z") and the picker returns
    // local-midnight `Date` objects — comparing raw millisecond
    // timestamps across that mismatch gives off-by-a-few-hours
    // false negatives at the upper boundary in any non-UTC
    // timezone. The day-number comparison is inclusive of the
    // end day and timezone-safe.
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
    return entries.filter((e) => {
      if (q) {
        const hay = `${e.waitlistId} ${e.patientName} ${e.patientId} ${e.preferredDepartmentName} ${e.preferredProviderName || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (assignee && e.preferredProviderName !== assignee) return false;
      if (project && project !== 'All Departments' && e.preferredDepartmentName !== project) return false;
      if (!inRange(e.requestDateTime)) return false;
      return true;
    });
  }, [entries, filters]);

  // ------------------------------------------------------------------
  // 2. Dashboard KPI metrics
  // ------------------------------------------------------------------
  const metrics = useMemo(() => {
    const byStatus = (s) => filtered.filter((e) => e.status === s).length;
    const emergencies = filtered.filter((e) => e.urgencyLevel === 'Emergency').length;
    return [
      { label: 'Open',             value: byStatus('Open'),             hint: 'Awaiting match',       accent: true },
      { label: 'Matched',          value: byStatus('Matched'),          hint: 'Slot found' },
      { label: 'Closed Expired',   value: byStatus('ClosedExpired'),    hint: 'Auto-expired' },
      { label: 'Closed Cancelled', value: byStatus('ClosedCancelled'),  hint: 'Patient cancelled' },
      { label: 'Emergencies',      value: emergencies,                  hint: 'High-urgency entries' }
    ];
  }, [filtered]);

  // ------------------------------------------------------------------
  // 3. Card template (showcase parity)
  // ------------------------------------------------------------------
  // The trash icon is rendered as a stateless `<span>` with
  // `data-card-delete` and `data-card-id` markers. A single delegated
  // `mousedown` listener attached to the kanban root (see the
  // useEffect below) watches for clicks on those markers. We avoid
  // binding a real `<button onClick>` because Syncfusion's kanban
  // clones card templates to render every card — React would track
  // a virtual node that Syncfusion freely detaches / re-inserts, and
  // the next reconciliation pass would call
  // `removeChild` on a node that's already gone, throwing the
  // `Failed to execute 'removeChild' on 'Node'` error.
  const cardTemplate = useMemo(
    () => (entry) => {
      if (!entry) return null;
      return (
        <div className="wl-card-template" role="group" aria-label={`Waitlist ${entry.waitlistId}`}>
          <div className="wl-card-head">
            <div className="wl-card-name">{entry.patientName}</div>
            <span
              className="wl-card-delete"
              role="button"
              aria-label={`Delete ${entry.waitlistId}`}
              title="Delete entry"
              data-card-delete="1"
              data-card-id={entry.waitlistId}
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
          <div className="wl-card-line text-muted">
            {entry.requestedAppointmentType} • Priority {entry.priorityScore}
          </div>
          {entry.preferredProviderName ? (
            <div className="wl-card-line text-muted">{entry.preferredProviderName}</div>
          ) : (
            <div className="wl-card-line text-subtle">Any available provider</div>
          )}
          <div className="wl-card-meta">
            <StatusBadge status={entry.urgencyLevel} />
            <span className="wl-card-waiting">{daysWaiting(entry.requestDateTime)}d waiting</span>
          </div>
          <div className="wl-card-dates text-subtle">
            {formatDate(entry.preferredDateRangeStart)} to {formatDate(entry.preferredDateRangeEnd)}
          </div>
        </div>
      );
    },
    []
  );

  const cardSettings = useMemo(
    () => ({
      headerField: 'waitlistId',
      contentField: 'patientName',
      template: cardTemplate,
      showHeader: false
    }),
    [cardTemplate]
  );

  // ------------------------------------------------------------------
  // 4. Columns (with multi-key fallbacks for legacy/alternate statuses)
  // ------------------------------------------------------------------
  const columns = useMemo(
    () => [
      { headerText: 'Open',              keyField: 'Open' },
      { headerText: 'Matched',           keyField: 'Matched' },
      { headerText: 'Closed Expired',    keyField: 'ClosedExpired,Expired' },
      { headerText: 'Closed Cancelled',  keyField: 'ClosedCancelled,Cancelled' }
    ],
    []
  );

  // ------------------------------------------------------------------
  // 5. Edit dialog — covers View / Edit / Update / Delete / Save
  // ------------------------------------------------------------------
  const dialogSchema = useMemo(
    () => ({
      title: 'Patient',
      fields: [
        { key: 'waitlistId',    label: 'Waitlist ID',    type: 'readonly' },
        { key: 'patientName',   label: 'Patient name',   type: 'text',     required: true,  span: 'full' },
        { key: 'patientId',     label: 'Patient ID',     type: 'text' },
        { key: 'priorityScore', label: 'Priority score', type: 'number',   format: 'n0' },
        { key: 'urgencyLevel',  label: 'Urgency',        type: 'dropdown', options: urgencyLevels, required: true },
        { key: 'status',        label: 'Status',         type: 'dropdown', options: waitlistStages.map((s) => s.key), valueKeyMap: Object.fromEntries(waitlistStages.map((s) => [s.key, s.key])), required: true },
        { key: 'preferredDepartmentName', label: 'Department', type: 'dropdown', options: waitlistDepartments.map((d) => d.name), required: true },
        { key: 'preferredLocationName',   label: 'Location',   type: 'dropdown', options: waitlistLocations.map((l) => l.name) },
        { key: 'preferredProviderName',   label: 'Provider',   type: 'dropdown', options: ['', ...waitlistProviders] },
        { key: 'requestedAppointmentType', label: 'Appointment type', type: 'dropdown', options: waitlistAppointmentTypes, required: true },
        { key: 'requestDateTime',           label: 'Request date',  type: 'date', required: true },
        { key: 'preferredDateRangeStart',   label: 'Preferred start', type: 'date' },
        { key: 'preferredDateRangeEnd',     label: 'Preferred end',   type: 'date' }
      ]
    }),
    []
  );

  // ------------------------------------------------------------------
  // 6. Event handlers
  // ------------------------------------------------------------------
  const openEdit = (entry) => {
    if (!entry) return;
    setDialogState({ open: true, mode: 'edit', value: entry });
  };

  // Single click is intentionally a no-op. The edit dialog only
  // opens on double-click to avoid accidental dialog opens while
  // scanning the board.
  // Single click is intentionally a no-op — the edit dialog only
  // opens on double-click. We also explicitly suppress card events
  // whose target sits inside the per-card trash icon so Syncfusion
  // never fires `cardClick` / `cardDoubleClick` on a delete-click.
  // (`e.originalEvent` is the wrapped browser event the kanban gave
  // us — we use it to test for the data-card-delete marker.)
  const handleCardClick = (entry, evt) => {
    if (evt?.originalEvent?.target?.closest?.('[data-card-delete="1"]')) return;
  };
  const handleCardDoubleClick = (entry, evt) => {
    if (evt?.originalEvent?.target?.closest?.('[data-card-delete="1"]')) return;
    openEdit(entry);
  };

  const cancelDelete = () => setConfirmDelete({ open: false, entry: null });

  /**
   * Delete entry — pure React state.
   *
   * The kanban reads its data from `dataSource={filtered}` which is
   * derived from `entries`. Updating `entries` through `setEntries`
   * is therefore enough to make the card vanish: React re-renders,
   * the filtered memo re-computes, the kanban's `dataSource` prop
   * changes, and Syncfusion's internal diff removes the now-missing
   * card from its DOM.
   *
   * Previous versions of this function called Syncfusion's
   * imperative APIs (`k.deleteCard`, `k.dataSource = ...`,
   * `k.refresh('cards')`) in addition to `setEntries` — that was
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
    const target = confirmDelete.entry;
    if (!target) return;

    // Close the confirmation dialog first. DeleteConfirmDialog's
    // close branch now does a single rAF + unmount, so the popup
    // teardown runs in lockstep with React's next commit and never
    // leaves Syncfusion's observer chain holding a destroyed
    // reference.
    setConfirmDelete({ open: false, entry: null });

    setEntries((prev) => prev.filter((e) => e.waitlistId !== target.waitlistId));

    window.__toast?.({
      title: 'Entry deleted',
      content: `${target.waitlistId} · ${target.patientName}`,
      cssClass: 'e-toast-warning'
    });
  };

  const handleAddTask = () => {
    const newId = `WL-${idCounterRef.current++}`;
    const newEntry = {
      waitlistId: newId,
      patientId: `PT-${(10000 + Math.floor(Math.random() * 9000)).toString()}`,
      patientName: '',
      preferredProviderId: null,
      preferredProviderName: waitlistProviders[0],
      preferredDepartmentId: waitlistDepartments[0].id,
      preferredDepartmentName: waitlistDepartments[0].name,
      preferredLocationName: waitlistLocations[0].name,
      preferredDateRangeStart: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      preferredDateRangeEnd: new Date(Date.now() + 28 * 86400000).toISOString().slice(0, 10),
      priorityScore: 40,
      urgencyLevel: 'Routine',
      requestedAppointmentType: waitlistAppointmentTypes[0],
      requestDateTime: new Date().toISOString().slice(0, 10),
      status: 'Open',
      matchedAppointmentId: null,
      swimlaneText: `${waitlistDepartments[0].name} — ${waitlistLocations[0].name} — ${waitlistClinics[0]}`,
      swimlaneKey: `${waitlistDepartments[0].id}-${waitlistLocations[0].name}-${waitlistClinics[0]}`
    };
    setDialogState({ open: true, mode: 'create', value: newEntry });
  };

  const handleSave = (value) => {
    setEntries((prev) => {
      const exists = prev.some((p) => p.waitlistId === value.waitlistId);
      const normalised = {
        ...value,
        priorityScore: Number(value.priorityScore) || 0,
        // Refresh swimlane text if any of the components changed
        swimlaneText: `${value.preferredDepartmentName || '—'} — ${value.preferredLocationName || ''} — ${value.preferredProviderName || 'Any'}`.replace(/ —\s*—/g, ' — ').replace(/— Any$/, '— Any')
      };
      if (exists) {
        window.__toast?.({
          title: 'Waitlist entry updated',
          content: `${normalised.waitlistId} · ${normalised.patientName}`,
          cssClass: 'e-toast-success'
        });
        return prev.map((p) => (p.waitlistId === normalised.waitlistId ? { ...p, ...normalised } : p));
      }
      window.__toast?.({
        title: 'Waitlist entry created',
        content: `${normalised.waitlistId} · ${normalised.patientName}`,
        cssClass: 'e-toast-success'
      });
      return [normalised, ...prev];
    });
    setDialogState({ open: false, mode: 'edit', value: null });
  };

  // CardDialog's "Delete" button calls this with the full card value.
  // Route it through `performDelete` so we use the same
  // imperative + RAF-sequenced path as the trash-icon flow,
  // instead of `setEntries` which races Syncfusion's DOM.
  const handleDelete = (value) => {
    if (!value) return;
    setConfirmDelete({ open: true, entry: value });
    setDialogState({ open: false, mode: 'edit', value: null });
  };

  const handleDragStop = (e) => {
    const updated = e?.data ? (Array.isArray(e.data) ? e.data[0] : e.data) : null;
    if (updated && updated.waitlistId) {
      setEntries((prev) => prev.map((p) => (p.waitlistId === updated.waitlistId ? { ...p, ...updated } : p)));
      window.__toast?.({
        title: 'Status updated',
        content: `${updated.waitlistId} → ${updated.status}`,
        cssClass: 'e-toast-info'
      });
    }
  };

  /**
   * Cancel Syncfusion's built-in card-edit dialog — we render our
   * own `CardDialog` instead, so only that appears when double-clicking
   * a card. This prevents the framework's default form from flashing
   * before our custom dialog mounts.
   */
  const handleDialogOpen = (e) => {
    if (e && typeof e.cancel === 'boolean') {
      e.cancel = true;
    }
  };

  /**
   * Delegated click handler for the trash button shown on each
   * card. We listen for `mousedown` on the kanban root and look for
   * the `data-card-delete` marker — React never sees any of these
   * clones, so its reconciler doesn't try to removeChild them
   * later (which is what was triggering the
   * `Failed to execute 'removeChild' on 'Node'` crash).
   */
  useEffect(() => {
    const kanbanEl = kanbanRef.current?.element;
    if (!kanbanEl) return undefined;
    const onMouseDown = (e) => {
      const target = e.target?.closest?.('[data-card-delete="1"]');
      if (!target) return;
      const waitlistId = target.getAttribute('data-card-id');
      if (!waitlistId) return;
      e.preventDefault();
      e.stopPropagation();
      const entry = entriesRef.current.find((x) => x.waitlistId === waitlistId) || null;
      setConfirmDelete({ open: true, entry });
    };
    kanbanEl.addEventListener('mousedown', onMouseDown);
    return () => kanbanEl.removeEventListener('mousedown', onMouseDown);
  }, []);

  return (
    <>
      {/* ---------- Page header ---------- */}
      <div className="page-header">
        <div className="page-header__title">
          <span className="icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
            </svg>
          </span>
          <div>
            <h1>Healthcare Waitlist</h1>
            <div className="page-header__sub">
              Manage patient appointments and waiting lists.
            </div>
          </div>
        </div>
      </div>

      <DashboardStats metrics={metrics} />

      <FilterBar
        assignees={waitlistProviders}
        projects={waitlistProjects}
        searchPlaceholder="Search patients, providers, departments..."
        assigneeLabel="Provider"
        projectLabel="Department"
        onChange={setFilters}
        onAddTask={handleAddTask}
      />

      {/* ---------- Kanban (3-level swimlane, multi-key status) ---------- */}
      <div className="kanban-wrap waitlist-kanban">
        <ErrorBoundary>
          <KanbanComponent
            id="waitlist-kanban"
            ref={kanbanRef}
            keyField="status"
            dataSource={filtered}
            cardSettings={cardSettings}
            swimlaneSettings={{
              keyField: 'swimlaneKey',
              textField: 'swimlaneText',
              showItemCount: true
            }}
            allowDragAndDrop
            allowKeyboard
            cardClick={(e) => handleCardClick(e.data, e)}
            cardDoubleClick={(e) => handleCardDoubleClick(e.data, e)}
            dragStop={handleDragStop}
            dialogOpen={handleDialogOpen}
            cssClass="e-waitlist-kanban"
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
        title="Delete waitlist entry"
        message={
          confirmDelete.entry
            ? `Delete ${confirmDelete.entry.waitlistId} — ${confirmDelete.entry.patientName}? This action cannot be undone.`
            : 'Are you sure you want to delete this entry?'
        }
        onConfirm={performDelete}
        onClose={cancelDelete}
      />
    </>
  );
}
