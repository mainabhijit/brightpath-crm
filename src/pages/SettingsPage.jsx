import React, { useState } from 'react';
import {
  Database,
  Building,
  CheckCircle2,
  Copy,
  Terminal,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import RoleBadge from '../components/auth/RoleBadge';
import useAuth from '../context/useAuth';

export default function SettingsPage() {
  const { user, profile, role, signOut, isConfigured } = useAuth();
  const [copied, setCopied] = useState(false);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Staff Counsellor';
  const email = user?.email || 'Not logged in (Demo mode)';
  const userId = user?.id || 'demo-user-id';
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ahhfbkgtynbfdnzkwdpw.supabase.co';

  const adminSqlSnippet = `UPDATE public.profiles\nSET role = 'admin'\nWHERE id = '${userId}';`;

  function handleCopySql() {
    navigator.clipboard.writeText(adminSqlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">System & Profile Settings</h2>
          <p className="page-description">
            Counsellor profile details, access permissions, and backend connection status.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* User Profile Card */}
        <Card title="User Account Profile" subtitle="Your active CRM identity and security credentials">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.125rem',
                fontWeight: 700,
              }}
            >
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{displayName}</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{email}</p>
              <div style={{ marginTop: '0.25rem' }}>
                <RoleBadge role={role} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Organization:</span>
              <span style={{ fontWeight: 600 }}>BrightPath Academy</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>User ID (UUID):</span>
              <code style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', padding: '0.125rem 0.375rem', borderRadius: 'var(--radius-xs)' }}>
                {userId.slice(0, 8)}...{userId.slice(-4)}
              </code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Access Scope:</span>
              <span>
                {role === 'admin'
                  ? 'Full Institute Access (Administrator)'
                  : role === 'manager'
                  ? 'Team Pipeline & Overdue Oversight'
                  : 'Own & Assigned Leads Only'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Authentication Provider:</span>
              <span>Supabase Auth (JWT)</span>
            </div>
          </div>

          {user && (
            <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign Out of Workspace
              </Button>
            </div>
          )}
        </Card>

        {/* Database & Cloud Connection Card */}
        <Card title="Database & Cloud Services" subtitle="Supabase PostgreSQL and Vercel hosting status">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <Database size={20} color="var(--primary)" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Supabase PostgreSQL Engine</span>
                  {isConfigured && (
                    <span style={{ fontSize: '0.6875rem', color: '#047857', backgroundColor: '#ecfdf5', padding: '0.125rem 0.375rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                      Connected
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Project URL: <code style={{ fontSize: '0.75rem', backgroundColor: '#e2e8f0', padding: '0.125rem 0.25rem', borderRadius: 'var(--radius-xs)' }}>{supabaseUrl}</code>
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <Building size={20} color="#059669" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Vercel Continuous Deployment</div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Git repository connected to <code>mainabhijit/brightpath-crm</code>.
                </p>
              </div>
            </div>

            {/* Admin Promotion SQL Box */}
            <div style={{ padding: '0.875rem', backgroundColor: '#faf5ff', borderRadius: 'var(--radius-md)', border: '1px solid #e9d5ff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#6b21a8', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Terminal size={14} /> Promote Account to Admin
                </span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  style={{
                    fontSize: '0.75rem',
                    color: '#7e22ce',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    cursor: 'pointer',
                  }}
                >
                  {copied ? <CheckCircle2 size={13} color="#059669" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied SQL!' : 'Copy SQL'}</span>
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#7e22ce', marginBottom: '0.5rem' }}>
                To unlock full team visibility, run this in your Supabase SQL Editor:
              </p>
              <pre
                style={{
                  fontSize: '0.75rem',
                  backgroundColor: '#ffffff',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #e9d5ff',
                  overflowX: 'auto',
                  color: '#4c1d95',
                }}
              >
                {adminSqlSnippet}
              </pre>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
