import React, { useRef, useEffect, useState } from 'react';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { DateRangePickerComponent } from '@syncfusion/ej2-react-calendars';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
 
/**
 * FilterBar — page-level filter row.
 *
 * Props
 *  - assignees:        string[]     – list of assignees / providers
 *  - projects:         string[]     – list of accounts / departments
 *  - onChange:         (filters)    – called on any filter change
 *  - onAddTask:        () => void
 *  - searchPlaceholder: string
 *  - assigneeLabel:    string       – "Assignee" | "Provider" | etc.
 *  - projectLabel:     string       – "Account" | "Department" | etc.
 */
export default function FilterBar({
  assignees,
  projects,
  onChange,
  onAddTask,
  searchPlaceholder = 'Search...',
  assigneeLabel = 'Assignee',
  projectLabel = 'Project / Dataset'
}) {
  const [search, setSearch] = useState('');
  const [assignee, setAssignee] = useState(null);
  const [project, setProject] = useState(null);
  const [range, setRange] = useState(null);
 
  // Refs for imperative Clear
  const ddlAssignee = useRef(null);
  const ddlProject = useRef(null);
  const drpRange = useRef(null);
  // Mirror of the last applied range. Used to re-sync the
  // DateRangePicker's input text after the popup teardown echo
  // (see handleRangeChange below).
  const lastGoodRangeRef = useRef(null);
  // Flag we set while we are imperatively re-syncing the picker
  // after a teardown echo. It is checked at the top of
  // `handleRangeChange` so we drop the change event the library
  // fires as a by-product of that resync (see
  // `DateRangePicker.prototype.setDate -> refreshChange ->
  // changeTrigger`). The real fix is the guard, not avoidance of
  // the resync — we need the resync to restore the visible input.
  const suppressingRangeUpdateRef = useRef(false);
 
  // Push the current filter state up.
  useEffect(() => {
    onChange?.({ search, assignee, project, range });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, assignee, project, range]);
 
  // Keep the last-good mirror up to date whenever `range` changes
  // (from a real selection, from the Clear button, or from the
  // imperative picker paths).
  useEffect(() => {
    if (range && range.startDate && range.endDate) {
      lastGoodRangeRef.current = range;
    } else if (range === null) {
      lastGoodRangeRef.current = null;
    }
  }, [range]);
 
  const clear = () => {
    setSearch('');
    setAssignee(null);
    setProject(null);
    setRange(null);
    if (ddlAssignee.current) ddlAssignee.current.value = null;
    if (ddlProject.current) ddlProject.current.value = null;
    if (drpRange.current) drpRange.current.value = null;
  };
 
  // The DateRangePicker's `change` event (RangeEventArgs) exposes the
  // selection as `e.startDate` / `e.endDate` Date objects. `e.value` is
  // polymorphic (`Date[] | { start, end } | null`) and was previously
  // stored raw, so the pages' `range.startDate` / `range.endDate` reads
  // were always undefined and the date filter silently never applied.
  //
  // Syncfusion also fires `change` more than once during a single
  // user interaction: once on the completed selection, then a
  // follow-up during popup teardown that comes through as
  //   { value: null, startDate: null, endDate: null, daySpan: 0 }
  //
  // The first event commits the new range to React state. The
  // teardown echo does TWO things we have to undo:
  //   (1) the picker's internal `startValue` / `endValue` are
  //       cleared, so the visible input text goes blank even though
  //       the React state is still set. We re-apply the last good
  //       range to the picker via the ref so the input renders the
  //       selected dates again.
  //   (2) we do NOT call `setRange(null)` here — that would
  //       collapse the active filter, which the user did not ask
  //       for. State is only cleared by the FilterBar's own Clear
  //       button.
  const handleRangeChange = (e) => {
    // Drop the change event that is fired as a by-product of our
    // own imperative resync below. See `suppressingRangeUpdateRef`.
    if (suppressingRangeUpdateRef.current) {
      suppressingRangeUpdateRef.current = false;
      return;
    }
    if (e?.startDate && e?.endDate) {
      setRange({ startDate: e.startDate, endDate: e.endDate });
      return;
    }
    // Teardown echo. Re-sync the picker from the last good range
    // so the input text is not blanked out, but do not touch
    // React state — the filter is still valid.
    const good = lastGoodRangeRef.current;
    const picker = drpRange.current;
    if (good && picker?.setProperties) {
      // Mark that the next change event is ours and should be
      // ignored. `setDate()` ultimately calls `changeTrigger()`,
      // which would otherwise echo back into this handler with
      // the just-restored dates.
      suppressingRangeUpdateRef.current = true;
      try {
        picker.setProperties(
          {
            startDate: good.startDate,
            endDate: good.endDate,
            value: [good.startDate, good.endDate]
          },
          true
        );
        if (typeof picker.setDate === 'function') {
          // setDate -> refreshChange -> changeTrigger. The
          // change event it produces is the one we are
          // ignoring via the guard above.
          picker.setDate();
        } else if (typeof picker.updateInput === 'function') {
          picker.updateInput();
        }
      } catch (err) {
        // If the resync path ever fails (e.g. internal API drift
        // in a Syncfusion version bump), make sure we don't leave
        // the guard stuck in the "suppressing" state — that
        // would silently drop the user's NEXT real selection.
        suppressingRangeUpdateRef.current = false;
        // eslint-disable-next-line no-console
        console.warn('[FilterBar] Failed to re-sync DateRangePicker after teardown echo:', err);
      }
    }
  };
 
  return (
    <section className="filter-bar" aria-label="Filters">
      <div className="filter-bar__filters">
        <div className="filter-bar__group">
          <label className="filter-bar__label" htmlFor="flt-search">Search</label>
          <TextBoxComponent
            id="flt-search"
            placeholder={searchPlaceholder}
            value={search}
            input={(e) => setSearch(e.value || '')}
            showClearButton
            floatLabelType="Never"
            cssClass="filter-input"
          />
        </div>
 
        <div className="filter-bar__group">
          <label className="filter-bar__label">{projectLabel}</label>
          <DropDownListComponent
            ref={ddlProject}
            dataSource={projects}
            placeholder="All"
            allowFiltering
            showClearButton
            change={(e) => setProject(e.value || null)}
            value={project}
          />
        </div>
 
        <div className="filter-bar__group">
          <label className="filter-bar__label">{assigneeLabel}</label>
          <DropDownListComponent
            ref={ddlAssignee}
            dataSource={assignees}
            placeholder="All assignees"
            allowFiltering
            showClearButton
            change={(e) => setAssignee(e.value || null)}
            value={assignee}
          />
        </div>
 
        <div className="filter-bar__group">
          <label className="filter-bar__label">Date range</label>
          <DateRangePickerComponent
            ref={drpRange}
            placeholder="Any date"
            change={handleRangeChange}
            value={range ? [range.startDate, range.endDate] : null}
          />
        </div>
      </div>
 
      <div className="filter-bar__actions">
        <ButtonComponent cssClass="e-flat" onClick={clear}>
          Clear
        </ButtonComponent>
        <ButtonComponent
          cssClass="e-primary"
          iconCss="e-icons e-plus"
          onClick={onAddTask}
        >
          New Task
        </ButtonComponent>
      </div>
    </section>
  );
}