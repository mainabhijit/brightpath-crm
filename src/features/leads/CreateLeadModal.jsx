import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, GraduationCap, Tag, AlertCircle } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import {
  createLead,
  COURSE_OPTIONS,
  SOURCE_OPTIONS,
  STATUS_OPTIONS,
  fetchCounsellors,
} from '../../services/leadService';
import useAuth from '../../context/useAuth';
import useToast from '../../context/useToast';
import { validateLeadContact } from '../../lib/validation';

/**
 * Mount only while open (`{open && <CreateLeadModal />}`) so every opening starts with a fresh form.
 */
export default function CreateLeadModal({ onClose, onLeadCreated }) {
  const { user } = useAuth();
  const toast = useToast();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [courseInterest, setCourseInterest] = useState(COURSE_OPTIONS[0]);
  const [source, setSource] = useState(SOURCE_OPTIONS[0]);
  const [status, setStatus] = useState('New');
  const [assignedTo, setAssignedTo] = useState('');
  const [notes, setNotes] = useState('');
  const [counsellors, setCounsellors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load counsellors list on open
  useEffect(() => {
    let cancelled = false;
    fetchCounsellors().then(({ data }) => {
      if (cancelled || !data || data.length === 0) return;
      setCounsellors(data);
      // Default assignment to current logged-in user if present in staff
      const matched = data.find((c) => c.id === user?.id);
      setAssignedTo(matched ? matched.id : data[0].id);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (submitting) return;

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    const invalid = validateLeadContact({ fullName, phone, email });
    if (invalid) {
      setErrorMsg(invalid.message);
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await createLead(
        {
          full_name: trimmedName,
          phone: trimmedPhone,
          email: email.trim() || null,
          course_interest: courseInterest,
          source,
          status,
          assigned_to: assignedTo || user?.id || null,
          notes: notes.trim() || null,
        },
        user?.id
      );

      if (error) {
        setErrorMsg(error);
      } else {
        toast.success(`Enquiry for ${data.full_name} created.`);
        onClose();
        if (onLeadCreated) onLeadCreated(data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save lead.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Create New Student Enquiry"
      maxWidth="580px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={submitting}
            disabled={submitting}
          >
            Save Enquiry
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {errorMsg && (
          <div
            role="alert"
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '0.8125rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Student Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label htmlFor="lead-create-name" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Student Full Name <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <User
              size={15}
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input id="lead-create-name" autoComplete="off"
              type="text"
              required
              placeholder="e.g. Aarav Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
              }}
            />
          </div>
        </div>

        {/* Contact details row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {/* Phone Number */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label htmlFor="lead-create-phone" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Phone Number <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Phone
                size={15}
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input id="lead-create-phone" autoComplete="off"
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label htmlFor="lead-create-email" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Email Address (Optional)
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={15}
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input id="lead-create-email" autoComplete="off"
                type="email"
                placeholder="aarav@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>
        </div>

        {/* Course & Source Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {/* Target Course */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label htmlFor="lead-create-course" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Course Interest <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <GraduationCap
                size={15}
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <select id="lead-create-course"
                value={courseInterest}
                onChange={(e) => setCourseInterest(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                }}
              >
                {COURSE_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Lead Source */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label htmlFor="lead-create-source" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Enquiry Source <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Tag
                size={15}
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <select id="lead-create-source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                }}
              >
                {SOURCE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status & Counsellor Assignment */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {/* Initial Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label htmlFor="lead-create-status" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Initial Status
            </label>
            <select id="lead-create-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff',
              }}
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Assigned Counsellor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label htmlFor="lead-create-assignee" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Assign to Counsellor
            </label>
            <select id="lead-create-assignee"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="">-- Unassigned --</option>
              {counsellors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Initial Counselling Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label htmlFor="lead-create-notes" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Initial Counselling Notes
          </label>
          <textarea id="lead-create-notes"
            rows={3}
            placeholder="Student background, parent preferences, scholarship inquiries..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              resize: 'vertical',
            }}
          />
        </div>
      </form>
    </Modal>
  );
}
