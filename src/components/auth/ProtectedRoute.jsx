import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import { GraduationCap } from 'lucide-react';
import Spinner from '../common/Spinner';

export default function ProtectedRoute() {
  const { user, loading, isConfigured } = useAuth();
  const location = useLocation();

  // If Supabase session is still resolving from localStorage / cookies
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-page)',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
          }}
        >
          <GraduationCap size={28} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <Spinner size="1.125rem" color="var(--primary)" />
          <span>Verifying staff credentials...</span>
        </div>
      </div>
    );
  }

  // If not logged in and credentials are configured, redirect to login
  if (!user && isConfigured) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render protected child routes
  return <Outlet />;
}
