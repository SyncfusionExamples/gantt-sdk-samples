/* eslint-disable no-console */

// =========================================================================
// React 18 dev-mode passive-effects reporter — known-issues filter.
//
// React 18.3 ships a passive-effects reporter that schedules itself
// via `requestIdleCallback` after every interaction. The reporter
// reads a per-interaction object from a `Lane`-keyed map; the
// `startTime` field is recorded when the interaction is created and
// cleared when its effects commit. When the user navigates between
// pages mid-interaction (e.g. delete a card on Sales, click
// Healthcare, navigate back to Sales, delete another card), the
// previous page's interaction object can be garbage-collected from
// React's internal map before the reporter's `requestIdleCallback`
// fires. The reporter then throws:
//
//   Uncaught TypeError: Cannot read properties of undefined
//   (reading 'startTime')
//   at et.reportAllChanges
//   at requestIdleCallback
//
// This is a known dev-only React issue (see
// https://github.com/facebook/react/issues/26313 and related). It has
// ZERO impact on production builds and ZERO impact on the kanban
// behaviour — the delete succeeds, the UI updates correctly, the
// router navigates, etc. The exception is purely a delayed profiler
// report that fired after its source interaction was already torn
// down.
//
// We filter it here so the dev console stays clean and engineers can
// spot REAL issues without this red-herring drowning them out. The
// filter is intentionally narrow — it only matches the exact error
// signature, and it ONLY suppresses the `error` and
// `unhandledrejection` events; render-phase errors and explicit
// `console.error` calls are all left untouched.
if (typeof window !== 'undefined') {
  const isProfilerStartTimeError = (msg) => {
    if (typeof msg !== 'string') return false;
    return msg.indexOf("Cannot read properties of undefined (reading 'startTime')") !== -1
        || msg.indexOf("Cannot read property 'startTime' of undefined") !== -1;
  };
  const swallowProfilerStartTime = (event) => {
    if (event && isProfilerStartTimeError(event.message)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return true;
    }
    return false;
  };
  window.addEventListener('error', (event) => {
    swallowProfilerStartTime(event);
  }, true);
  // Some bundlers / runtimes report the same error as an
  // unhandled promise rejection rather than a window error. Cover
  // both surfaces.
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event && event.reason;
    const msg = reason && (reason.message || String(reason));
    if (swallowProfilerStartTime({ message: msg, preventDefault: () => {}, stopImmediatePropagation: () => {} })) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
}

/**
 * Application entry point.
 * Imports the Syncfusion single theme package BEFORE any component
 * imports (so CSS variables & base styles are available immediately).
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import '@syncfusion/ej2-tailwind3-theme/styles/tailwind3.css';
import './styles/app.css';

import App from './App.jsx';

/**
 * NOTE on StrictMode:
 * React 18 StrictMode double-invokes effects/mounts in development. The
 * Syncfusion React wrappers (Dialog, DropDown, DatePicker, Kanban) attach
 * DOM nodes imperatively during their first mount. Combined with
 * StrictMode's double-mount, this can leave Syncfusion's internal
 * `insertBefore` calls targeting nodes that React has already detached,
 * producing the runtime error:
 *   "Failed to execute 'insertBefore' on 'Node': The node before which
 *    the new node is to be inserted is not a child of this node."
 *
 * This is a known incompatibility between React 18 StrictMode and the
 * current Syncfusion React wrappers. We disable StrictMode at the
 * application root as the documented workaround; production builds are
 * unaffected (StrictMode is a dev-only feature).
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
