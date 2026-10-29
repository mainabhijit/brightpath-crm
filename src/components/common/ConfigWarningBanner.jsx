import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { isConfigured } from '../../lib/supabaseClient';

/**
 * Shown on every app page when Supabase environment variables are missing,
 * so a misconfigured deployment is obvious instead of silently showing empty data.
 */
export default function ConfigWarningBanner() {
  if (isConfigured) return null;

  return (
    <div
      role="alert"
      style={{
        marginBottom: '1.25rem',
        padding: '0.875rem 1rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--status-contacted-bg)',
        border: '1px solid var(--status-contacted-border)',
        color: 'var(--status-contacted-text)',
        fontSize: '0.8125rem',
        display: 'flex',
        gap: '0.625rem',
        alignItems: 'flex-start',
      }}
    >
      <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '0.0625rem' }} aria-hidden="true" />
      <div>
        <strong>Database not connected — demo mode.</strong> No data is loaded or saved, and sign-in is disabled.
        Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env</code> (locally)
        or in Vercel → Project Settings → Environment Variables, then rebuild. See the README’s Setup section.
      </div>
    </div>
  );
}
