import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import {
  TextBoxComponent,
  TextAreaComponent,
  NumericTextBoxComponent
} from '@syncfusion/ej2-react-inputs';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { DatePickerComponent } from '@syncfusion/ej2-react-calendars';

/**
 * CardDialog — generic CRUD dialog used by both pages.
 *
 * ROOT-CAUSE FIX (the previous "insertBefore" crash)
 * -------------------------------------------------
 * Syncfusion's React wrappers attach DOM nodes imperatively during
 * mount. When a dialog containing nested Syncfusion inputs (TextBox,
 * DropDown, DatePicker) is *already mounted* and Syncfusion internally
 * rebuilds a popup overlay while React is also reconciling, the
 * `insertBefore` call can target a node that's been detached — that's
 * the exact error from the bug report.
 *
 * The robust workaround is:
 *  1. Mount the entire DialogComponent only while `open` is true.
 *  2. Use a `key` that changes every time the dialog opens so all
 *     Syncfusion sub-components are created fresh (no leftover state,
 *     no half-rendered popups, no stale DOM references).
 *  3. Defer the actual `open=true` prop by one frame with a `mounted`
 *     flag so the first paint has finished before Syncfusion's
 *     animation engine runs `insertBefore`.
 *  4. Cleanly call `destroy()` on the underlying Syncfusion instance
 *     in a layout effect when the dialog closes, so any leftover
 *     popup overlays are removed before React unmounts the node.
 */
export default function CardDialog({
  mode,
  open,
  schema,
  initialValue,
  onClose,
  onSave,
  onDelete
}) {
  const [form, setForm] = useState({});
  const [mounted, setMounted] = useState(false);
  const [renderError, setRenderError] = useState(null);
  const lastOpenRef = useRef(false);
  const dlgRef = useRef(null);
  // Bump this counter every time the dialog opens so we can re-key
  // the dialog tree and force a clean remount of every Syncfusion
  // sub-component (TextBox, DropDown, DatePicker).
  const openKeyRef = useRef(0);

  // Defer the actual mount to the next animation frame so the parent's
  // first paint completes before Syncfusion starts inserting DOM.
  useEffect(() => {
    if (open && !lastOpenRef.current) {
      openKeyRef.current += 1;
      // Sanitise every value to a primitive that Syncfusion can render.
      const sanitised = {};
      const src = initialValue || {};
      Object.keys(src).forEach((k) => {
        const v = src[k];
        if (v === null || v === undefined) sanitised[k] = '';
        else if (Array.isArray(v)) sanitised[k] = v.join(', ');
        else if (typeof v === 'object') sanitised[k] = String(v);
        else sanitised[k] = v;
      });
      (schema?.fields || []).forEach((f) => {
        if (sanitised[f.key] === undefined || sanitised[f.key] === null) {
          sanitised[f.key] = f.type === 'number' ? 0 : '';
        }
      });
      setForm(sanitised);
      setRenderError(null);
      // Frame-defer the mount so React has time to commit the parent tree.
      const raf = requestAnimationFrame(() => setMounted(true));
      lastOpenRef.current = true;
      return () => cancelAnimationFrame(raf);
    }
    if (!open && lastOpenRef.current) {
      // Synchronously hide the dialog before unmounting so Syncfusion
      // can run its close animation. We then unmount on the next tick.
      try { dlgRef.current?.hide?.(); } catch { /* ignore */ }
      const t = setTimeout(() => {
        setMounted(false);
        lastOpenRef.current = false;
      }, 0);
      return () => clearTimeout(t);
    }
  }, [open, initialValue, schema]);

  // Clean up the Syncfusion instance on unmount.
  useEffect(() => {
    return () => {
      try { dlgRef.current?.destroy?.(); } catch { /* ignore */ }
    };
  }, []);

  const isReadOnly = mode === 'view';

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Translate dropdown display labels back to internal keys (if a
    // valueKeyMap is provided on the field).
    const out = { ...form };
    (schema?.fields || []).forEach((f) => {
      if (f.type === 'dropdown' && f.valueKeyMap) {
        const map = f.valueKeyMap;
        out[f.key] = map[form[f.key]] ?? form[f.key];
      }
    });

    const missing = (schema?.fields || [])
      .filter((f) => {
        if (!f.required) return false;
        const v = out[f.key];
        return v === undefined || v === null || v === '';
      })
      .map((f) => f.label);
    if (missing.length) {
      window.__toast?.({
        title: 'Missing required fields',
        content: `Please fill: ${missing.join(', ')}`,
        cssClass: 'e-toast-warning',
        timeOut: 4000
      });
      return;
    }
    onSave?.(out);
  };

  // Note: `onDelete` is still accepted on the prop signature for
  // backward compatibility, but is no longer wired to a footer
  // button. Deletions are exclusively triggered by the inline
  // trash icon on each card, which opens the global
  // DeleteConfirmDialog.

  // Button layout
  //   Read-only  : Close
  //   Create     : Cancel | Create              (no Delete — we're not editing an existing card)
  //   Edit       : Cancel | Save                (Delete is intentionally hidden — deletions
  //                                               go through the inline trash icon on the card
  //                                               which routes through the confirmation flow)
  const dialogButtons = isReadOnly
    ? [
        {
          buttonModel: { content: 'Close', cssClass: 'e-flat e-primary' },
          click: onClose
        }
      ]
    : mode === 'create'
    ? [
        {
          buttonModel: { content: 'Cancel', cssClass: 'e-flat' },
          click: onClose
        },
        {
          buttonModel: {
            content: 'Create',
            isPrimary: true,
            cssClass: 'e-flat e-primary',
            iconCss: 'e-icons e-save'
          },
          click: handleSave
        }
      ]
    : [
        {
          buttonModel: { content: 'Cancel', cssClass: 'e-flat' },
          click: onClose
        },
        {
          buttonModel: {
            content: 'Save',
            isPrimary: true,
            cssClass: 'e-flat e-primary',
            iconCss: 'e-icons e-save'
          },
          click: handleSave
        }
      ];

  // Render-error guard
  if (renderError) {
    return (
      <DialogComponent
        id="card-dialog"
        header="Error"
        width="480px"
        visible={open}
        isModal
        showCloseIcon
        close={onClose}
        buttons={[{
          buttonModel: { content: 'Close', cssClass: 'e-flat e-primary' },
          click: onClose
        }]}
      >
        <p>Something went wrong while opening this dialog.</p>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, color: 'var(--color-danger)' }}>
          {String(renderError)}
        </pre>
      </DialogComponent>
    );
  }

  // Don't mount the dialog tree until we've deferred one frame.
  // The `key` changes on every open so Syncfusion gets a clean slate.
  if (!mounted || typeof document === 'undefined') return null;

  // Render the dialog through a portal so its React subtree lives
  // outside the kanban wrapper. Syncfusion's clone-and-rebind cycle
  // can in rare cases detach ancestor nodes that React tracks; with
  // a portal React's reconciler can never touch a kanban-related
  // ancestor of the dialog, eliminating
  //   "Failed to execute 'removeChild' on 'Node'"
  // during open/close of the dialog while the kanban is mid-rerender.
  return ReactDOM.createPortal(
    <DialogComponent
      key={`dlg-${openKeyRef.current}`}
      ref={dlgRef}
      id="card-dialog"
      header={
        (mode === 'create' ? 'Create ' : mode === 'view' ? 'View ' : 'Edit ') +
        (schema?.title || 'Task')
      }
      width="720px"
      showCloseIcon
      isModal
      visible
      close={onClose}
      buttons={dialogButtons}
    >
      <form
        className="dlg-form"
        onSubmit={(e) => { e.preventDefault(); handleSave(); }}
      >
        {(() => {
          try {
            return (schema?.fields || []).map((f) => {
              const span = f.span === 'full' ? 'dlg-form__full' : '';
              if (f.type === 'readonly') {
                return (
                  <div key={f.key} className={`dlg-form__field ${span}`}>
                    <label>{f.label}</label>
                    <div
                      className="text-muted"
                      style={{ padding: '8px 12px', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-sm)' }}
                    >
                      {form[f.key] === '' || form[f.key] === undefined || form[f.key] === null ? '—' : String(form[f.key])}
                    </div>
                  </div>
                );
              }
              if (f.type === 'textarea') {
                return (
                  <div key={f.key} className={`dlg-form__field ${span}`}>
                    <label htmlFor={`f-${f.key}`}>{f.label}{f.required ? ' *' : ''}</label>
                    <TextAreaComponent
                      id={`f-${f.key}`}
                      rows={3}
                      value={String(form[f.key] ?? '')}
                      change={(e) => setField(f.key, e.value)}
                      placeholder={f.placeholder || ''}
                      readOnly={isReadOnly}
                    />
                  </div>
                );
              }
              if (f.type === 'number') {
                return (
                  <div key={f.key} className={`dlg-form__field ${span}`}>
                    <label htmlFor={`f-${f.key}`}>{f.label}{f.required ? ' *' : ''}</label>
                    <NumericTextBoxComponent
                      id={`f-${f.key}`}
                      value={Number(form[f.key] ?? 0)}
                      format={f.format || 'n0'}
                      change={(e) => setField(f.key, e.value)}
                      placeholder={f.placeholder || ''}
                      enabled={!isReadOnly}
                    />
                  </div>
                );
              }
              if (f.type === 'dropdown') {
                return (
                  <div key={f.key} className={`dlg-form__field ${span}`}>
                    <label>{f.label}{f.required ? ' *' : ''}</label>
                    <DropDownListComponent
                      dataSource={f.options || []}
                      value={form[f.key] === '' || form[f.key] === null ? null : form[f.key]}
                      change={(e) => setField(f.key, e.value)}
                      placeholder={f.placeholder || 'Select...'}
                      enabled={!isReadOnly}
                    />
                  </div>
                );
              }
              if (f.type === 'date') {
                return (
                  <div key={f.key} className={`dlg-form__field ${span}`}>
                    <label>{f.label}{f.required ? ' *' : ''}</label>
                    <DatePickerComponent
                      value={form[f.key] ? new Date(form[f.key]) : null}
                      change={(e) =>
                        setField(
                          f.key,
                          e.value ? new Date(e.value).toISOString().slice(0, 10) : null
                        )
                      }
                      placeholder={f.placeholder || 'Select date'}
                      enabled={!isReadOnly}
                    />
                  </div>
                );
              }
              // default: text
              return (
                <div key={f.key} className={`dlg-form__field ${span}`}>
                  <label htmlFor={`f-${f.key}`}>{f.label}{f.required ? ' *' : ''}</label>
                  <TextBoxComponent
                    id={`f-${f.key}`}
                    value={String(form[f.key] ?? '')}
                    input={(e) => setField(f.key, e.value)}
                    placeholder={f.placeholder || ''}
                    readOnly={isReadOnly || f.readOnly}
                  />
                </div>
              );
            });
          } catch (err) {
            setTimeout(() => setRenderError(err), 0);
            return null;
          }
        })()}
      </form>
    </DialogComponent>,
    document.body
  );
}
