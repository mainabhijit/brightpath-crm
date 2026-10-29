import React from 'react';
import Spinner from './Spinner';

/**
 * Suspense fallback shown while a lazily loaded page chunk downloads
 */
export default function PageFallback() {
  return (
    <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}>
      <Spinner size="1.5rem" color="var(--primary)" />
    </div>
  );
}
