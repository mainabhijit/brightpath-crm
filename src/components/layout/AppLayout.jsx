import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, User } from 'lucide-react';
import Sidebar from './Sidebar';
import Modal from '../common/Modal';
import Button from '../common/Button';

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current page title
  function getPageTitle() {
    const path = location.pathname;
    if (path === '/') return 'Overview & Analytics';
    if (path.startsWith('/leads')) return 'Student Enquiry Pipeline';
    if (path === '/follow-ups') return 'Scheduled Follow-ups';
    if (path === '/settings') return 'Institute & Profile Settings';
    return 'BrightPath CRM';
  }

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
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ padding: '0.375rem 0.5rem' }}
              title="Notifications"
            >
              <Bell size={16} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#e2e8f0',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <User size={16} />
              </div>
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
            This modal shell verifies interactive dialog state and layout for Phase 1.
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
