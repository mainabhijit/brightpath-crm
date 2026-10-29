import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Plus } from 'lucide-react';
import Button from '../components/common/Button';
import FollowUpList from '../features/followups/FollowUpList';
import CreateFollowUpModal from '../features/followups/CreateFollowUpModal';
import { fetchFollowUps, completeFollowUp, getOverdue } from '../services/followUpService';
import useAuth from '../context/useAuth';

export default function FollowUpsPage() {
  const { user } = useAuth();
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const applyResult = useCallback(({ data, error }) => {
    setFollowUps(data);
    setErrorMsg(error || '');
    setLoading(false);
  }, []);

  const loadFollowUps = useCallback(() => fetchFollowUps().then(applyResult), [applyResult]);

  useEffect(() => {
    fetchFollowUps().then(applyResult);
  }, [applyResult]);

  async function handleComplete(task) {
    const { data, error } = await completeFollowUp(task, user?.id);
    if (error) {
      alert('Failed to complete follow-up: ' + error);
      return;
    }
    setFollowUps((prev) => prev.map((f) => (f.id === task.id ? { ...f, ...data } : f)));
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Scheduled Follow-ups</h2>
          <p className="page-description">
            Manage your counselling calls, campus appointments, and reminders.
          </p>
        </div>
        <div className="page-actions">
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsCreateOpen(true)}>
            Schedule Follow-up
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="spinner" style={{ width: '2rem', height: '2rem', margin: '0 auto 1rem', color: 'var(--primary)' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading follow-ups...</p>
        </div>
      ) : (
        <FollowUpList
          followUps={followUps}
          onComplete={handleComplete}
          defaultTab={getOverdue(followUps).length > 0 ? 'OVERDUE' : 'UPCOMING'}
        />
      )}

      {isCreateOpen && (
        <CreateFollowUpModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={loadFollowUps}
        />
      )}
    </div>
  );
}
