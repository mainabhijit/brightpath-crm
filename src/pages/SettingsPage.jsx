import React from 'react';
import {
  Shield,
  Database,
  Building,
  Key,
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

export default function SettingsPage() {
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
              BP
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Staff Counsellor</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>counsellor@brightpath.edu</p>
              <div style={{ marginTop: '0.25rem' }}>
                <Badge variant="contacted" icon={<Shield size={12} />}>
                  Counsellor Role
                </Badge>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Organization:</span>
              <span style={{ fontWeight: 600 }}>BrightPath Academy</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Access Scope:</span>
              <span>Own & Assigned Leads Only</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Authentication Provider:</span>
              <span>Supabase Auth (JWT)</span>
            </div>
          </div>
        </Card>

        {/* Database & Cloud Connection Card */}
        <Card title="Database & Cloud Services" subtitle="Supabase PostgreSQL and Vercel hosting status">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <Database size={20} color="var(--primary)" style={{ marginTop: '0.125rem' }} />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Supabase PostgreSQL Engine</div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Phase 2 will integrate the official client SDK and validate live database credentials.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <Building size={20} color="#059669" style={{ marginTop: '0.125rem' }} />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Vercel Continuous Deployment</div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Git triggers live staging builds for every phase milestone.
                </p>
              </div>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <Button variant="outline" size="sm" icon={<Key size={14} />}>
                Manage Security Credentials
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
