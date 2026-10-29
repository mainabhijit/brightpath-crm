import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import ErrorBoundary from '../common/ErrorBoundary';
import CreateLeadModal from '../../features/leads/CreateLeadModal';
import RoleBadge from '../auth/RoleBadge';
import useAuth from '../../context/useAuth';

const MOBILE_QUERY = '(max-width: 768px)';

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, role, signOut } = useAuth();
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const handleChange = (e) => setIsMobile(e.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  // Escape closes the mobile drawer
  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

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
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {/* Sidebar (Desktop and Mobile Drawer) */}
      <Sidebar
        isOpen={mobileMenuOpen}
        // Off-canvas drawer must not be reachable by Tab / screen readers while hidden
        inert={isMobile && !mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNewEnquiryClick={() => setIsNewLeadModalOpen(true)}
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
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="app-sidebar"
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
              aria-label="Notifications"
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
                aria-hidden="true"
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
                  aria-label="Sign Out"
                >
                  <LogOut size={14} />
                  <span className="hide-on-mobile">Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main id="main-content" className="page-content-area" tabIndex={-1}>
          {/* Keyed by route so a crash on one page clears when navigating away */}
          <ErrorBoundary key={location.pathname}>
            <Outlet context={{ openCreateLeadModal: () => setIsNewLeadModalOpen(true) }} />
          </ErrorBoundary>
        </main>
      </div>

      {/* Global "New Enquiry" (sidebar) — opens the real create form from any page */}
      {isNewLeadModalOpen && (
        <CreateLeadModal
          onClose={() => setIsNewLeadModalOpen(false)}
          onLeadCreated={(newLead) => navigate(`/leads/${newLead.id}`)}
        />
      )}
    </div>
  );
}
