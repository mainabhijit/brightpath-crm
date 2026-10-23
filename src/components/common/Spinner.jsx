import React from 'react';

/**
 * Reusable Spinner component
 */
export default function Spinner({ size = '1rem', color = 'currentColor', className = '' }) {
  return (
    <span
      className={`spinner ${className}`}
      style={{ width: size, height: size, borderColor: color, borderRightColor: 'transparent' }}
      role="status"
      aria-label="Loading"
    />
  );
}
