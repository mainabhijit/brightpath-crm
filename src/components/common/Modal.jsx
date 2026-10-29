import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Reusable Accessible Modal Dialog
 * - Labelled by its title, focus moves into the dialog on open
 * - Tab / Shift+Tab are trapped inside, Escape closes
 * - Focus returns to the element that opened it on close
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = '540px',
}) {
  const titleId = useId();
  const dialogRef = useRef(null);
  // Latest onClose without re-running the open/close effect on every render
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;

    // Focus the first form field, else the first focusable control (the close button)
    const firstField = dialog?.querySelector('input:not([disabled]), select:not([disabled]), textarea:not([disabled])');
    (firstField || dialog?.querySelector(FOCUSABLE) || dialog)?.focus();

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !dialog) return;

      const focusable = Array.from(dialog.querySelectorAll(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header" style={{ padding: '1rem 1.25rem' }}>
          <h3 id={titleId} className="card-title" style={{ fontSize: '1.125rem' }}>{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close dialog"
            style={{ padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}
          >
            <X size={18} />
          </Button>
        </div>
        <div className="card-body modal-body">
          {children}
        </div>
        {footer && (
          <div className="card-footer modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
