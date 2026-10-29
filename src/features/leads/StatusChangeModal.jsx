import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { LOST_REASON_PRESETS } from '../../services/leadService';

/**
 * Mount only while open so each opening starts from the first preset.
 */
export default function StatusChangeModal({
  onClose,
  leadName,
  onConfirmLost,
}) {
  const [selectedPreset, setSelectedPreset] = useState(LOST_REASON_PRESETS[0]);
  const [customReason, setCustomReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    setErrorMsg('');
    const finalReason = selectedPreset === 'Other reason'
      ? customReason.trim()
      : selectedPreset;

    if (!finalReason) {
      setErrorMsg('Please specify why this enquiry was marked as Lost.');
      return;
    }

    setSubmitting(true);
    try {
      await onConfirmLost(finalReason);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Record Reason for Lost Enquiry"
      maxWidth="480px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            isLoading={submitting}
            disabled={submitting}
          >
            Mark as Lost
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            color: '#b91c1c',
            fontSize: '0.8125rem',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-start',
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
          <div>
            You are marking <strong>{leadName}</strong> as <strong>Lost</strong>. Per institute policy and database constraints, a valid reason is required for drop-off analysis.
          </div>
        </div>

        {errorMsg && (
          <p role="alert" style={{ color: '#b91c1c', fontSize: '0.8125rem', fontWeight: 600 }}>{errorMsg}</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label htmlFor="lost-reason-preset" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Primary Reason:</label>
          <select id="lost-reason-preset"
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            style={{
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '0.875rem',
              backgroundColor: '#ffffff',
            }}
          >
            {LOST_REASON_PRESETS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {selectedPreset === 'Other reason' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label htmlFor="lost-reason-custom" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Describe specific reason:</label>
            <textarea id="lost-reason-custom"
              rows={3}
              placeholder="Provide details about the student's decision..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              style={{
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '0.875rem',
              }}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
