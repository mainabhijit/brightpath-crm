import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../context/useAuth';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import Button from '../components/common/Button';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signInWithPassword, signUp, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      if (isRegister) {
        if (!fullName.trim()) {
          setErrorMsg('Please enter your full name.');
          setSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters.');
          setSubmitting(false);
          return;
        }

        const { data, error } = await signUp({ email, password, fullName });
        if (error) {
          setErrorMsg(error.message);
        } else if (data?.user) {
          if (data.session) {
            navigate(from, { replace: true });
          } else {
            setSuccessMsg(
              'Account created successfully! Check your email if email confirmation is enabled, or sign in below.'
            );
            setIsRegister(false);
          }
        }
      } else {
        const { error } = await signInWithPassword({ email, password });
        if (error) {
          setErrorMsg(
            error.message === 'Invalid login credentials'
              ? 'Invalid email or password. Please verify your credentials or create a new account.'
              : error.message
          );
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: 'var(--bg-page)',
      }}
    >
      {/* Left Column: Academy Value Showcase (Desktop) */}
      <div
        className="auth-showcase"
        style={{
          flex: '1 1 50%',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '3.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          background: 'radial-gradient(circle at 10% 20%, #1e3a8a 0%, #0f172a 70%)',
        }}
      >
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', zIndex: 10 }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
            }}
          >
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em' }}>
              BrightPath CRM
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Academy Admissions Portal
            </p>
          </div>
        </div>

        {/* Center Pitch */}
        <div style={{ maxWidth: '480px', zIndex: 10, margin: '3rem 0' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(37, 99, 235, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#93c5fd',
              fontSize: '0.8125rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
            }}
          >
            <Sparkles size={14} /> Built for Education & Coaching Institutes
          </div>

          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Turn student enquiries into confirmed admissions.
          </h2>
          <p style={{ fontSize: '1rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '2rem' }}>
            Streamline your counselling desk, schedule disciplined follow-ups, and track batch conversions with real-time role security.
          </p>

          {/* Pillars List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              {
                icon: ShieldCheck,
                title: 'Role-Based Row Level Security',
                desc: 'Counsellors manage their pipeline; managers and admins oversee the entire institute.',
              },
              {
                icon: TrendingUp,
                title: 'Automated Overdue Tracking',
                desc: 'Never let prospective students slip through the cracks with automated urgency flags.',
              },
            ].map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div key={idx} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#60a5fa',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#f1f5f9' }}>{pillar.title}</h4>
                    <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.4 }}>{pillar.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div style={{ fontSize: '0.75rem', color: '#64748b', zIndex: 10 }}>
          BrightPath Academy CRM • Connected to Supabase PostgreSQL & Auth
        </div>
      </div>

      {/* Right Column: Focus Authentication Card */}
      <div
        style={{
          flex: '1 1 50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2.5rem 1.5rem',
          maxWidth: '600px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-main)' }}>
              {isRegister ? 'Create Staff Account' : 'Welcome to BrightPath'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
              {isRegister
                ? 'Register your account to access the counselling workspace'
                : 'Sign in with your staff email and password'}
            </p>
          </div>

          {/* Config Alert if Running without .env */}
          {!isConfigured && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#b45309',
                fontSize: '0.8125rem',
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'flex-start',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div>
                <strong>Running in Demo Mode:</strong> Add your Supabase credentials to <code>.env</code> to activate live cloud authentication.
              </div>
            </div>
          )}

          {/* Tab Selector */}
          <div
            style={{
              display: 'flex',
              padding: '0.25rem',
              backgroundColor: '#f1f5f9',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '1.5rem',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 600,
                backgroundColor: !isRegister ? '#ffffff' : 'transparent',
                color: !isRegister ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: !isRegister ? 'var(--shadow-xs)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 600,
                backgroundColor: isRegister ? '#ffffff' : 'transparent',
                color: isRegister ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: isRegister ? 'var(--shadow-xs)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              Register
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '0.8125rem',
                marginBottom: '1.25rem',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#047857',
                fontSize: '0.8125rem',
                marginBottom: '1.25rem',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Full Name field (Register only) */}
            {isRegister && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label htmlFor="login-full-name" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={16}
                    style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  />
                  <input id="login-full-name" autoComplete="name"
                    type="text"
                    required
                    placeholder="e.g. Abhijit Rout"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.875rem 0.625rem 2.375rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#ffffff',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label htmlFor="login-email" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input id="login-email" autoComplete="email"
                  type="email"
                  required
                  placeholder="name@brightpath.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem 0.625rem 2.375rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#ffffff',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label htmlFor="login-password" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input id="login-password" autoComplete={isRegister ? 'new-password' : 'current-password'}
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 2.5rem 0.625rem 2.375rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#ffffff',
                    fontSize: '0.875rem',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {isRegister && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Must be at least 6 characters. New profiles default to <strong>Counsellor</strong>.
                </span>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={submitting}
              icon={!submitting && <ArrowRight size={16} />}
              style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}
            >
              {isRegister ? 'Create Staff Account' : 'Sign In to Workspace'}
            </Button>
          </form>

          {/* Quick Demo Access (Helpful during evaluation/workshop) */}
          <div
            style={{
              marginTop: '2rem',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-color)',
              backgroundColor: '#fafafa',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              textAlign: 'center',
            }}
          >
            <strong>First time setting up?</strong> Register your admin email above, then run the SQL statement in <code>supabase/README.md</code> to promote yourself to Administrator.
          </div>
        </div>
      </div>
    </div>
  );
}
