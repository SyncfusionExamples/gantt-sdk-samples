import React from 'react';

/**
 * AppHeader — top app bar with brand, page title, and a small
 * environment pill. Sticky to the top of the viewport.
 */
export default function AppHeader() {
  return (
    <header className="appbar" role="banner">
      <div className="appbar__inner">
        <div className="appbar__brand" aria-label="Syncfusion Kanban Showcase">
          <span className="logo" aria-hidden="true">SK</span>
          <span>Syncfusion Kanban Showcase</span>
        </div>
      </div>
    </header>
  );
}
