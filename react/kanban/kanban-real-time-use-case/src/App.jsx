/**
 * Top-level App component.
 * Renders the AppBar + PageTabs shell, declares the two routes, and
 * provides a shared Toast host for both pages.
 */
import React, { useRef, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastComponent } from '@syncfusion/ej2-react-notifications';

import AppHeader from './components/layout/AppHeader.jsx';
import PageTabs from './components/layout/PageTabs.jsx';
import ToastBridge from './components/layout/ToastBridge.jsx';
import ErrorBoundary from './components/layout/ErrorBoundary.jsx';
import SalesPipelinePage from './pages/SalesPipelinePage.jsx';
import HealthcareWaitlistPage from './pages/HealthcareWaitlistPage.jsx';

export default function App() {
  const toastRef = useRef(null);

  /**
   * Imperative API used by the rest of the app:
   *   window.__showToast({ title, content, cssClass }) OR via ToastBridge.
   * Using a ref keeps the call site simple and dependency-free.
   */
  const showToast = useCallback((opts) => {
    if (toastRef.current) {
      toastRef.current.show(opts);
    }
  }, []);

  return (
    <div className="app-shell">
      <AppHeader />
      <PageTabs />

      <main className="app-main" id="main-content" role="main">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Navigate to="/sales-pipeline" replace />} />
            <Route path="/sales-pipeline" element={<SalesPipelinePage showToast={showToast} />} />
            <Route path="/healthcare-waitlist" element={<HealthcareWaitlistPage showToast={showToast} />} />
            <Route path="*" element={<Navigate to="/sales-pipeline" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>

      <ToastBridge showToast={showToast} />
      <ToastComponent
        ref={toastRef}
        id="app-toast"
        position={{ X: 'Right', Y: 'Top' }}
        timeOut={3500}
        showCloseButton
        showProgressBar
        newestOnTop
        cssClass="toast-host"
      />
    </div>
  );
}
