import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };

/**
 * Fixed-position toast stack. Two live regions: errors are announced
 * immediately (assertive), everything else politely.
 */
export default function ToastViewport({ toasts, onDismiss }) {
  const errors = toasts.filter((t) => t.type === 'error');
  const others = toasts.filter((t) => t.type !== 'error');

  return (
    <div className="toast-viewport">
      <div role="alert" aria-live="assertive" className="toast-region">
        {errors.map((t) => <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />)}
      </div>
      <div role="status" aria-live="polite" className="toast-region">
        {others.map((t) => <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />)}
      </div>
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const Icon = ICONS[toast.type] || Info;
  return (
    <div className={`toast toast-${toast.type}`}>
      <Icon size={18} className="toast-icon" aria-hidden="true" />
      <span className="toast-message">{toast.message}</span>
      <button
        type="button"
        className="toast-close"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}
