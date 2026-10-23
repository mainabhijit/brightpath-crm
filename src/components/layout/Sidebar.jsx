import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Settings,
  GraduationCap,
  PlusCircle,
  LogOut,
} from 'lucide-react';
import useAuth from '../../context/useAuth';
import RoleBadge from '../auth/RoleBadge';

export default function Sidebar({ isOpen, onClose, onNewEnquiryClick }) {
  const { user, profile, role, signOut } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/leads', label: 'Student Leads', icon: Users, badge: 'Active' },
    { to: '/follow-ups', label: 'Follow-ups', icon: CalendarCheck },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Staff Counsellor';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <div
        className={`mobile-drawer-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Container */}
      <aside className={`app-sidebar ${isOpen ? 'drawer-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-icon-wrapper">
            <GraduationCap size={22} />
          </div>
          <div>
            <h1 className="brand-title">BrightPath CRM</h1>
            <p className="brand-subtitle">Academy Portal</p>
          </div>
        </div>

        {/* Quick Action Button */}
        <div style={{ padding: '1rem 0.875rem 0.25rem' }}>
          <button
            onClick={() => {
              if (onClose) onClose();
              if (onNewEnquiryClick) onNewEnquiryClick();
            }}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.8125rem', padding: '0.55rem' }}
          >
            <PlusCircle size={16} />
            <span>New Enquiry</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <span className="sidebar-heading">Navigation</span>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon className="nav-icon" />
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Authenticated User Profile Footer */}
        <div className="sidebar-footer">
          <div className="user-avatar" aria-label="User avatar">
            {initials}
          </div>
          <div className="user-info">
            <p className="user-name" title={displayName}>{displayName}</p>
            <div style={{ marginTop: '0.125rem' }}>
              <RoleBadge role={role} showIcon={false} />
            </div>
          </div>
          {user && (
            <button
              type="button"
              onClick={signOut}
              title="Sign Out"
              aria-label="Sign Out"
              style={{
                color: '#94a3b8',
                padding: '0.375rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'color 150ms',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
