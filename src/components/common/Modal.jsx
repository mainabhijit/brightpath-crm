import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

/**
 * Reusable Accessible Modal Dialog
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = '540px',
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="modal-content"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header" style={{ padding: '1rem 1.25rem' }}>
          <h3 className="card-title" style={{ fontSize: '1.125rem' }}>{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close modal"
            style={{ padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}
          >
            <X size={18} />
          </Button>
        </div>
        <div className="card-body" style={{ padding: '1.25rem', overflowY: 'auto', maxHeight: 'calc(85vh - 120px)' }}>
          {children}
        </div>
        {footer && (
          <div className="card-footer" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
