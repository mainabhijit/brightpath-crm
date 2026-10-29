import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import {
  updateLead,
  COURSE_OPTIONS,
  SOURCE_OPTIONS,
  fetchCounsellors,
} from '../../services/leadService';
import useAuth from '../../context/useAuth';
import useToast from '../../context/useToast';
import { validateLeadContact } from '../../lib/validation';

/**
 * Mount only while open so the form is initialised from the current lead each time.
 * Status is intentionally not editable here: stage changes go through the
 * Stage selector, which enforces the Lost reason and logs the transition.
 */
export default function EditLeadModal({ onClose, lead, onLeadUpdated }) {
  const { user } = useAuth();
  const toast = useToast();
  const [fullName, setFullName] = useState(lead.full_name || '');
  const [phone, setPhone] = useState(lead.phone || '');
  const [email, setEmail] = useState(lead.email || '');
  const [courseInterest, setCourseInterest] = useState(lead.course_interest || COURSE_OPTIONS[0]);
  const [source, setSource] = useState(lead.source || SOURCE_OPTIONS[0]);
  const [assignedTo, setAssignedTo] = useState(lead.assigned_to || '');
  const [notes, setNotes] = useState(lead.notes || '');
  const [counsellors, setCounsellors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchCounsellors().then(({ data }) => {
      if (!cancelled && data) setCounsellors(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (submitting) return;

    const invalid = validateLeadContact({ fullName, phone, email });
    if (invalid) {
      setErrorMsg(invalid.message);
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
        assigned_to: assignedTo || null,
        notes: notes.trim() || null,
      };

      const { data, error } = await updateLead(lead.id, updates, user?.id);
      if (error) {
        setErrorMsg(error);
      } else {
        toast.success('Lead details saved.');
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
      isOpen
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
          <p role="alert" style={{ color: '#b91c1c', fontSize: '0.8125rem', fontWeight: 600 }}>{errorMsg}</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label htmlFor="lead-edit-name" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Student Full Name</label>
          <input id="lead-edit-name"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={{ padding: '0.55rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label htmlFor="lead-edit-phone" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Phone Number</label>
            <input id="lead-edit-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ padding: '0.55rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label htmlFor="lead-edit-email" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Email Address</label>
            <input id="lead-edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: '0.55rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label htmlFor="lead-edit-course" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Course Interest</label>
            <select id="lead-edit-course"
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
            <label htmlFor="lead-edit-source" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Source</label>
            <select id="lead-edit-source"
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label htmlFor="lead-edit-assignee" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Assigned To</label>
            <select id="lead-edit-assignee"
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
          <label htmlFor="lead-edit-notes" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Counselling Notes</label>
          <textarea id="lead-edit-notes"
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
