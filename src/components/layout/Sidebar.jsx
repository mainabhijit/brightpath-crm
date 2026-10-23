import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Settings,
  GraduationCap,
  PlusCircle,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, onNewEnquiryClick }) {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/leads', label: 'Student Leads', icon: Users, badge: 'Active' },
    { to: '/follow-ups', label: 'Follow-ups', icon: CalendarCheck },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

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

        {/* User Profile Footer */}
        <div className="sidebar-footer">
          <div className="user-avatar" aria-label="User avatar">
            BP
          </div>
          <div className="user-info">
            <p className="user-name">Staff Counsellor</p>
            <span className="user-role-tag">Counsellor Role</span>
          </div>
        </div>
      </aside>
    </>
  );
}
