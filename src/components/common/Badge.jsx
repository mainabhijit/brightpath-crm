import React from 'react';

/**
 * Reusable Badge component for lead statuses, roles, and priorities
 * @param {Object} props
 * @param {'new' | 'contacted' | 'qualified' | 'converted' | 'lost' | 'neutral'} [props.variant='neutral']
 * @param {React.ReactNode} [props.icon]
 * @param {React.ReactNode} props.children
 */
export default function Badge({
  variant = 'neutral',
  icon,
  children,
  className = '',
  ...rest
}) {
  const normalizedVariant = variant.toLowerCase();
  const variantClass = `badge-${normalizedVariant}`;

  return (
    <span className={`badge ${variantClass} ${className}`} {...rest}>
      {icon && <span className="badge-icon">{icon}</span>}
      {children}
    </span>
  );
}
