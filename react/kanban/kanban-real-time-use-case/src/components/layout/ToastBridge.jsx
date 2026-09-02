/**
 * ToastBridge — exposes a global `window.__toast(opts)` function so that
 * deeply nested components can fire toasts without prop-drilling the
 * `showToast` callback through every layer.
 */
import { useEffect } from 'react';

export default function ToastBridge({ showToast }) {
  useEffect(() => {
    window.__toast = showToast;
    return () => {
      if (window.__toast === showToast) delete window.__toast;
    };
  }, [showToast]);

  return null;
}
