import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        <AlertTriangle size={32} />
      </div>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '420px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        The CRM resource or page you requested does not exist or may have been moved.
      </p>
      <Button variant="primary" icon={<Home size={16} />} onClick={() => navigate('/')}>
        Return to Dashboard
      </Button>
    </div>
  );
}
