import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ToastContext } from './toastContextInstance';
import ToastViewport from '../components/common/Toast';
import { friendlyError, NETWORK_ERROR_MESSAGE } from '../lib/errorMessages';

const DURATIONS = { success: 4000, info: 5000, error: 7000 };

/**
 * Global toast notifications. Also reports connectivity changes and
 * unhandled promise rejections so failures never pass silently.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((type, message) => {
    const id = nextId.current++;
    setToasts((prev) => {
      // Collapse identical messages already on screen
      if (prev.some((t) => t.type === type && t.message === message)) return prev;
      // Keep at most 4 visible
      return [...prev.slice(-3), { id, type, message }];
    });
    setTimeout(() => dismiss(id), DURATIONS[type] || DURATIONS.info);
    return id;
  }, [dismiss]);

  const toast = useMemo(() => ({
    success: (message) => show('success', message),
    info: (message) => show('info', message),
    error: (err, fallback) => show('error', friendlyError(err, fallback)),
    dismiss,
  }), [show, dismiss]);

  useEffect(() => {
    const handleOffline = () => toast.error(NETWORK_ERROR_MESSAGE);
    const handleOnline = () => toast.success('Back online.');
    const handleRejection = (event) => {
      console.error('[ToastProvider] Unhandled rejection:', event.reason);
      toast.error(event.reason);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [toast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export default ToastProvider;
