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
