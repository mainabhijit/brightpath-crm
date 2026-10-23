import React from 'react';

/**
 * Reusable Card container component
 */
export default function Card({
  title,
  subtitle,
  actions,
  children,
  footer,
  className = '',
  bodyClassName = '',
  ...rest
}) {
  const hasHeader = title || subtitle || actions;

  return (
    <div className={`card ${className}`} {...rest}>
      {hasHeader && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className={`card-body ${bodyClassName}`}>{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}
