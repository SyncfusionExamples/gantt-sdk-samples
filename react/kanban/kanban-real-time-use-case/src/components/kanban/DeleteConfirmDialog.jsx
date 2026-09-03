import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
// Note: the dialog's two footer buttons are declared through the
// Syncfusion `buttons` prop (not as `<ButtonComponent>` children),
// so we deliberately do NOT import `@syncfusion/ej2-react-buttons`.
// Each import brings a fresh `notify-property-change.js` observer
// chain that fires during prop diff and can trip the
// `hasOwnProperty` TypeError if React unmounts the dialog out of
// order. The smaller the observer surface, the lower the risk of
// a stray property notification landing on a destroyed target.

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
    // We track an internal "alive" flag so any in-flight
    // requestAnimationFrame can check before calling setMounted
    // on a component that has already been torn down (e.g. by
    // a React Router page transition). React tolerates
    // setState-after-unmount but logs a warning; this guard
    // makes the warning impossible and eliminates the
    // window during which React's profiler can read from a
    // stale interaction map.
    let alive = true;

    // ---------- Open ----------
    // When `open` flips false -> true, mount the Syncfusion dialog
    // on the next animation frame so our parent's first paint is
    // finished before the popup overlay inserts itself into <body>.
    // A bumped `openKeyRef` also gives us a fresh React subtree
    // (remount of <DialogComponent>) on every open, so any
    // leftover internal state from a previous confirms is
    // discarded with it.
    if (open && !lastOpenRef.current) {
      openKeyRef.current += 1;
      const raf = requestAnimationFrame(() => {
        if (alive) setMounted(true);
      });
      lastOpenRef.current = true;
      return () => {
        alive = false;
        cancelAnimationFrame(raf);
      };
    }

    // ---------- Close ----------
    // When `open` flips true -> false, simply unmount the React
    // tree on the next animation frame. We DO NOT call
    // `dlgRef.current.destroy()` here because Syncfusion's
    // `DialogComponent` does not expect to be destroyed by the
    // React layer during a normal lifecycle: it owns internal
    // observers (`observer.js`, `notify-property-change.js`,
    // `component-base.js`) that try to apply the next prop batch
    // (e.g. `visible`, `cssClass`) to the already-destroyed
    // instance, which is what produces the stack trace:
    //   Uncaught TypeError: Cannot convert undefined or null to
    //   object at hasOwnProperty (<anonymous>) ...
    // Letting React handle unmount through the `key`-bump +
    // `mounted` toggle is the documented lifecycle path: React
    // detaches its wrapper, Syncfusion's own unmount handler
    // (registered through `useEffect` cleanup inside the wrapper)
    // tears down the popup overlay, and nothing is destroyed
    // out-of-order.
    if (!open && lastOpenRef.current) {
      const raf = requestAnimationFrame(() => {
        if (alive) {
          setMounted(false);
          lastOpenRef.current = false;
        }
      });
      return () => {
        alive = false;
        cancelAnimationFrame(raf);
      };
    }
  }, [open]);

  const handleConfirm = () => {
    // Only `onConfirm`. The pages that own this dialog already call
    // `setConfirmDelete({ open: false })` from inside their
    // `performDelete` function so the dialog begins its close
    // animation immediately. Calling `onClose?.()` here would fire
    // the same setter a second time later — harmless on its own,
    // but it also triggers a second `useEffect([open])` pass which
    // interferes with the unmount sequence.
    onConfirm?.();
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
      /* 520px (was 420): the longest production message is
         "Delete PIPE-1011 — Vendor Risk Assessment? This
         action cannot be undone." (~73 chars × ~7.5px avg
         glyph width at 14px font = ~547px of text). At 420px
         the text wraps to two lines and the selected card's
         id/title runs into the second line. 520px gives the
         text ~448px of horizontal room (after icon + paddings)
         which is enough to keep it on a single visual line for
         every realistic title length we've seeded. */
      width="520px"
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
            /* `e-danger` only — the `.e-flat` part was forcing
               Syncfusion to inject a 16×16 left-padding for an
               absent icon, which was throwing Cancel and
               Delete off the same baseline (icon accounted
               for Cancel would be empty, so the two buttons
               ended up with different intrinsic widths). The
               red header badge inside the dialog body already
               conveys the destructive intent, so the button
               itself stays pure text — matches the showcase
               Cancel/Delete pair. */
            cssClass: 'e-danger'
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
