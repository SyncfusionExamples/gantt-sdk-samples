import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

/**
 * PageTabs — top-level navigation between the two Kanban pages.
 * Uses NavLink so the active state is driven by the router.
 */
export default function PageTabs() {
  const location = useLocation();

  // Compute a friendly page title for screen readers
  const srTitle =
    location.pathname.startsWith('/healthcare-waitlist')
      ? 'Healthcare Waitlist page'
      : location.pathname.startsWith('/sales-pipeline')
      ? 'Sales CRM Pipeline page'
      : 'Kanban application';

  return (
    <nav className="pagetabs" role="navigation" aria-label="Primary">
      <span className="visually-hidden">{srTitle}</span>
      <div className="pagetabs__inner">
        <NavLink
          to="/sales-pipeline"
          className={({ isActive }) => `pagetab ${isActive ? 'is-active' : ''}`}
        >
          <span className="icon" aria-hidden="true">📈</span>
          <span>Sales Pipeline</span>
        </NavLink>
        <NavLink
          to="/healthcare-waitlist"
          className={({ isActive }) => `pagetab ${isActive ? 'is-active' : ''}`}
        >
          <span className="icon" aria-hidden="true">🏥</span>
          <span>Healthcare Waitlist</span>
        </NavLink>
      </div>
    </nav>
  );
}
