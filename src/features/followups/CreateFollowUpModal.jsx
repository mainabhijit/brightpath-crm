import React, { useState, useEffect } from 'react';
import { AlertCircle, Calendar, User, GraduationCap } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { fetchLeads, fetchCounsellors } from '../../services/leadService';
import { createFollowUp } from '../../services/followUpService';
import useAuth from '../../context/useAuth';

// Default due time: tomorrow at 10:00 local, formatted for <input type="datetime-local">
function defaultDueValue() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const labelStyle = { fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' };
const iconStyle = { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' };
const inputStyle = {
  width: '100%',
  padding: '0.55rem 0.75rem 0.55rem 2.25rem',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.875rem',
  backgroundColor: '#ffffff',
};

/**
 * Schedule a follow-up. Mount it only while open so each opening starts with a fresh form.
 * @param {Object} props
 * @param {() => void} props.onClose
 * @param {(followUp: Object) => void} [props.onCreated]
 * @param {Object} [props.lead] when provided, the lead selector is locked to this lead
 */
export default function CreateFollowUpModal({ onClose, onCreated, lead = null }) {
  const { user } = useAuth();
  const [leadId, setLeadId] = useState(lead?.id || '');
  const [dueAt, setDueAt] = useState(defaultDueValue);
  const [note, setNote] = useState('');
  const [assignedTo, setAssignedTo] = useState(lead?.assigned_to || user?.id || '');
  const [leads, setLeads] = useState([]);
  const [counsellors, setCounsellors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [openedAt] = useState(() => new Date());

  useEffect(() => {
    let cancelled = false;
    async function loadOptions() {
      const [staffRes, leadsRes] = await Promise.all([
        fetchCounsellors(),
        lead ? Promise.resolve({ data: [] }) : fetchLeads({ sortField: 'full_name', sortAsc: true }),
      ]);
      if (cancelled) return;
      setCounsellors(staffRes.data || []);
      setLeads(leadsRes.data || []);
    }
    loadOptions();
    return () => {
      cancelled = true;
    };
  }, [lead]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!leadId) {
      setErrorMsg('Please select the enquiry this follow-up is for.');
      return;
    }
    if (!dueAt) {
      setErrorMsg('Please choose a due date and time.');
      return;
    }
    if (!note.trim()) {
      setErrorMsg('Please describe what needs to happen on this follow-up.');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await createFollowUp(
        { leadId, dueAt, note, assignedTo },
        user?.id
      );
      if (error) {
        setErrorMsg(error);
      } else {
        if (onCreated) onCreated(data);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to schedule follow-up.');
    } finally {
      setSubmitting(false);
    }
  }

  const isPastDue = dueAt && new Date(dueAt) < openedAt;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Schedule Follow-up"
      maxWidth="520px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={submitting} disabled={submitting}>
            Schedule Follow-up
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {errorMsg && (
          <div
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

        {/* Lead selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label htmlFor="followup-lead" style={labelStyle}>
            Student Enquiry <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <GraduationCap size={15} style={iconStyle} />
            {lead ? (
              <input id="followup-lead" type="text" value={lead.full_name} disabled style={{ ...inputStyle, backgroundColor: '#f8fafc' }} />
            ) : (
              <select id="followup-lead" value={leadId} onChange={(e) => setLeadId(e.target.value)} style={inputStyle}>
                <option value="">-- Select an enquiry --</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.full_name} ({l.phone})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Due date & assignee */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label htmlFor="followup-due" style={labelStyle}>
              Due Date & Time <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Calendar size={15} style={iconStyle} />
              <input
                id="followup-due"
                type="datetime-local"
                required
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                style={inputStyle}
              />
            </div>
            {isPastDue && (
              <span style={{ fontSize: '0.75rem', color: '#b45309' }}>
                This time is in the past — the follow-up will be marked Overdue.
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label htmlFor="followup-assignee" style={labelStyle}>
              Assign to
            </label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={iconStyle} />
              <select id="followup-assignee" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} style={inputStyle}>
                <option value="">-- Me --</option>
                {counsellors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Note */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label htmlFor="followup-note" style={labelStyle}>
            Follow-up Note <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <textarea
            id="followup-note"
            rows={3}
            placeholder="e.g. Call parent to discuss scholarship test date"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ ...inputStyle, padding: '0.55rem 0.75rem', resize: 'vertical' }}
          />
        </div>
      </form>
    </Modal>
  );
}
