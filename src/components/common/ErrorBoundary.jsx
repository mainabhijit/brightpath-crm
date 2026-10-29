import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

/**
 * Catches render-time crashes and shows a recoverable screen instead of a
 * blank page. Give it a `key` (e.g. the route path) to reset on navigation.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Render crash:', error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div role="alert" style={{ padding: '3rem 1.5rem', textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
        <AlertTriangle size={40} color="#dc2626" style={{ margin: '0 auto 1rem' }} aria-hidden="true" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Something went wrong on this page
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Your data is safe. Try reloading the page, or go back to the dashboard.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            <RotateCcw size={16} aria-hidden="true" />
            <span>Reload Page</span>
          </button>
          <a href="/" className="btn btn-outline">
            <Home size={16} aria-hidden="true" />
            <span>Go to Dashboard</span>
          </a>
        </div>
      </div>
    );
  }
}
