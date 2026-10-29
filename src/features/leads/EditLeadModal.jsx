import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import {
  updateLead,
  COURSE_OPTIONS,
  SOURCE_OPTIONS,
  STATUS_OPTIONS,
  fetchCounsellors,
} from '../../services/leadService';
import useAuth from '../../context/useAuth';

export default function EditLeadModal({ isOpen, onClose, lead, onLeadUpdated }) {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [courseInterest, setCourseInterest] = useState('');
  const [source, setSource] = useState('');
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [notes, setNotes] = useState('');
  const [counsellors, setCounsellors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && lead) {
      setFullName(lead.full_name || '');
      setPhone(lead.phone || '');
      setEmail(lead.email || '');
      setCourseInterest(lead.course_interest || COURSE_OPTIONS[0]);
      setSource(lead.source || SOURCE_OPTIONS[0]);
      setStatus(lead.status || 'New');
      setAssignedTo(lead.assigned_to || '');
      setNotes(lead.notes || '');
      setErrorMsg('');

      async function loadStaff() {
        const { data } = await fetchCounsellors();
        if (data) setCounsellors(data);
      }
      loadStaff();
    }
  }, [isOpen, lead]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Student full name is required');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Phone number is required');
      return;
    }

    setSubmitting(true);
    try {
      const updates = {
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        course_interest: courseInterest,
        source,
        status,
        assigned_to: assignedTo || null,
        notes: notes.trim() || null,
      };

      const { data, error } = await updateLead(lead.id, updates, user?.id);
      if (error) {
        setErrorMsg(error);
      } else {
        onClose();
        if (onLeadUpdated) onLeadUpdated(data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update lead');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Lead Information"
      maxWidth="560px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={submitting} disabled={submitting}>
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {errorMsg && (
          <p style={{ color: '#b91c1c', fontSize: '0.8125rem', fontWeight: 600 }}>{errorMsg}</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Student Full Name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={{ padding: '0.55rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ padding: '0.55rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: '0.55rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Course Interest</label>
            <select
              value={courseInterest}
              onChange={(e) => setCourseInterest(e.target.value)}
              style={{ padding: '0.55rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff' }}
            >
              {COURSE_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              style={{ padding: '0.55rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff' }}
            >
              {SOURCE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ padding: '0.55rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff' }}
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Assigned To</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              style={{ padding: '0.55rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff' }}
            >
              <option value="">-- Unassigned --</option>
              {counsellors.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Counselling Notes</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ padding: '0.55rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
          />
        </div>
      </form>
    </Modal>
  );
}
