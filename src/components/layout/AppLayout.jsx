import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import Modal from '../common/Modal';
import Button from '../common/Button';
import RoleBadge from '../auth/RoleBadge';
import useAuth from '../../context/useAuth';

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, role, signOut } = useAuth();

  // Determine current page title
  function getPageTitle() {
    const path = location.pathname;
    if (path === '/') return 'Overview & Analytics';
    if (path.startsWith('/leads')) return 'Student Enquiry Pipeline';
    if (path === '/follow-ups') return 'Scheduled Follow-ups';
    if (path === '/settings') return 'Institute & Profile Settings';
    return 'BrightPath CRM';
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Staff Counsellor';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="app-layout">
      {/* Sidebar (Desktop and Mobile Drawer) */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNewEnquiryClick={() => {
          if (location.pathname !== '/leads') {
            navigate('/leads');
          }
          setIsNewLeadModalOpen(true);
        }}
      />

      {/* Main Content Viewport */}
      <div className="app-main">
        {/* Sticky Topbar */}
        <header className="app-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {getPageTitle()}
            </span>
          </div>

          <div className="topbar-right">
            {/* Live Role Badge */}
            <RoleBadge role={role} />

            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ padding: '0.375rem 0.5rem' }}
              title="Notifications"
            >
              <Bell size={16} />
            </button>

            {/* User Chip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                paddingLeft: '0.5rem',
                borderLeft: '1px solid var(--border-color)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#e0e7ff',
                  color: '#3730a3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
                title={user?.email || displayName}
              >
                {initials}
              </div>

              {user && (
                <button
                  type="button"
                  onClick={signOut}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}
                  title="Sign Out"
                >
                  <LogOut size={14} />
                  <span className="hide-on-mobile">Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="page-content-area">
          <Outlet context={{ openCreateLeadModal: () => setIsNewLeadModalOpen(true) }} />
        </main>
      </div>

      {/* Placeholder Lead Modal for Phase 1 Navigation Verification */}
      <Modal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        title="Create New Student Enquiry"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsNewLeadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsNewLeadModalOpen(false)}>
              Save Enquiry (Demo)
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            This modal shell verifies interactive dialog state and layout.
            Full database persistence with Supabase will be activated in Phase 5.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Student Full Name</label>
            <input
              type="text"
              placeholder="e.g. Aarav Sharma"
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Phone Number</label>
            <input
              type="tel"
              placeholder="e.g. +91 9876543210"
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
