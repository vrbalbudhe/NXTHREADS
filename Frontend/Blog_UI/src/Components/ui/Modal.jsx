import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}) {
  const panelRef = useRef(null);
  const widths = { sm: "sm:max-w-sm", md: "sm:max-w-lg", lg: "sm:max-w-2xl" };

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const focusable = panelRef.current?.querySelector(
      "input, textarea, select, button:not([data-close])"
    );
    focusable?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close dialog"
        data-close
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-[2px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[92vh] w-full ${widths[size] || widths.md} animate-slide-up flex-col rounded-t-2xl border border-line bg-panel shadow-lift dark:border-line-dark dark:bg-panel-dark sm:rounded-2xl`}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 dark:border-line-dark">
            <div>
              {title && (
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
              )}
              {description && <p className="mt-0.5 text-xs muted">{description}</p>}
            </div>
            <button
              type="button"
              data-close
              onClick={onClose}
              className="icon-btn -mr-2 -mt-1"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-line px-5 py-3 pb-safe dark:border-line-dark">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  tone = "danger",
  busy = false,
}) {
  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${tone === "danger" ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{message}</p>
    </Modal>
  );
}
