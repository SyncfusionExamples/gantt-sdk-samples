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

  // Push the current filter state up.
  useEffect(() => {
    onChange?.({ search, assignee, project, range });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, assignee, project, range]);

  const clear = () => {
    setSearch('');
    setAssignee(null);
    setProject(null);
    setRange(null);
    if (ddlAssignee.current) ddlAssignee.current.value = null;
    if (ddlProject.current) ddlProject.current.value = null;
    if (drpRange.current) drpRange.current.value = null;
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
            allowClear
            change={(e) => setRange(e.value || null)}
            value={range}
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
