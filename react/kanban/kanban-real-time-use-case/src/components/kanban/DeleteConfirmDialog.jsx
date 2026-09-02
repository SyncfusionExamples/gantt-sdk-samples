import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';

/**
 * DeleteConfirmDialog — small confirmation modal rendered alongside
 * the kanban. Used when the user clicks the trash icon on a card.
 *
 * Props
 *   open:         boolean            – mount only when true
 *   title:        string             – header shown in the dialog
 *   message:      string             – body text (e.g. "Delete PIPE-1042?")
 *   confirmLabel: string (default "Delete")
 *   cancelLabel:  string (default "Cancel")
 *   onConfirm:    () => void
 *   onClose:      () => void
 */
export default function DeleteConfirmDialog({
  open,
  title = 'Confirm delete',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onClose
}) {
  // Frame-deferred mount so the parent's first paint is finished
  // before Syncfusion's animation engine runs any DOM insertion.
  // Bumping `openKeyRef` every open forces a fresh remount of the
  // underlying Syncfusion dialog tree, so leftover popup overlays
  // and stale references from the previous open can never collide
  // with the Reconciler.
  const [mounted, setMounted] = useState(false);
  const lastOpenRef = useRef(false);
  const dlgRef = useRef(null);
  const openKeyRef = useRef(0);

  useEffect(() => {
    if (open && !lastOpenRef.current) {
      openKeyRef.current += 1;
      const raf = requestAnimationFrame(() => setMounted(true));
      lastOpenRef.current = true;
      return () => cancelAnimationFrame(raf);
    }
    if (!open && lastOpenRef.current) {
      // The `removeChild` crash fix: we must fully purge Syncfusion's
      // popup overlay before React tries to unmount this subtree.
      // `hide()` alone leaves the modal mask attached to <body>, so
      // when React later removes its own wrapper it tries to take
      // down a node that's not where React thinks it is — boom:
      //   "Failed to execute 'removeChild' on 'Node'"
      // We call `destroy()` (which detaches the overlay AND clears
      // event handlers) and then wait through two animation frames
      // before letting React unmount.
      let raf1;
      let raf2;
      let cleanupTimer;
      try { dlgRef.current?.destroy?.(); } catch { /* ignore */ }
      // Give the browser two rAFs of breathing room (long enough for
      // Syncfusion's destroy queue to flush) plus a small extra delay
      // so any pending popup-overlay reflow finishes before React
      // pulls the React-managed wrapper out of the DOM.
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          cleanupTimer = setTimeout(() => {
            setMounted(false);
            lastOpenRef.current = false;
          }, 80);
        });
      });
      return () => {
        try { cancelAnimationFrame(raf1); } catch { /* ignore */ }
        try { cancelAnimationFrame(raf2); } catch { /* ignore */ }
        if (cleanupTimer) clearTimeout(cleanupTimer);
      };
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm?.();
    onClose?.();
  };

  if (!mounted || typeof document === 'undefined') return null;

  // Render the dialog through a portal so its React subtree lives
  // outside any kanban wrapper element. The kanban's clone-and-rebind
  // cycle can in rare cases detach ancestor nodes that React tracks;
  // a portal keeps the dialog totally independent of that dance,
  // eliminating the
  //   "Failed to execute 'removeChild' on 'Node'"
  // crash from the kanban subtree interfering with our dialog tree.
  return ReactDOM.createPortal(
    <DialogComponent
      key={'confirm-' + openKeyRef.current}
      ref={dlgRef}
      id="delete-confirm-dialog"
      header={title}
      width="420px"
      visible={open}
      isModal
      showCloseIcon
      animationSettings={{ effect: 'None' }}
      close={onClose}
      closeOnEscape
      cssClass="e-confirm-dialog"
      buttons={[
        {
          buttonModel: { content: cancelLabel, cssClass: 'e-flat' },
          click: onClose
        },
        {
          buttonModel: {
            content: confirmLabel,
            isPrimary: true,
            cssClass: 'e-flat e-danger',
            iconCss: 'e-icons e-delete'
          },
          click: handleConfirm
        }
      ]}
    >
      <div className="dlg-confirm-message" role="alert">
        <span className="dlg-confirm-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
          </svg>
        </span>
        <span>{message}</span>
      </div>
    </DialogComponent>,
    document.body
  );
}
