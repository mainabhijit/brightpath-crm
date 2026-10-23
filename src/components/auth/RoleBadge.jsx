import React from 'react';
import { Shield, ShieldAlert, UserCheck } from 'lucide-react';

/**
 * Role badge displaying user authorization tier with semantic styling
 * @param {Object} props
 * @param {'counsellor' | 'manager' | 'admin' | string} props.role
 */
export default function RoleBadge({ role = 'counsellor', showIcon = true, className = '' }) {
  const normalized = (role || 'counsellor').toLowerCase();

  const config = {
    admin: {
      label: 'Administrator',
      icon: ShieldAlert,
      bg: '#faf5ff',
      text: '#7e22ce',
      border: '#e9d5ff',
    },
    manager: {
      label: 'Manager',
      icon: Shield,
      bg: '#eff6ff',
      text: '#1d4ed8',
      border: '#bfdbfe',
    },
    counsellor: {
      label: 'Counsellor',
      icon: UserCheck,
      bg: '#ecfdf5',
      text: '#047857',
      border: '#a7f3d0',
    },
  };

  const current = config[normalized] || config.counsellor;
  const Icon = current.icon;

  return (
    <span
      className={`role-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.2rem 0.55rem',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: current.bg,
        color: current.text,
        border: `1px solid ${current.border}`,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {showIcon && <Icon size={12} />}
      <span>{current.label}</span>
    </span>
  );
}
