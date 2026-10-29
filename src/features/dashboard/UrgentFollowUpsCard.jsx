import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

// "3d overdue", "5h overdue", "20m overdue"
function overdueLabel(dueAt, now) {
  const minutes = Math.max(1, Math.floor((now - new Date(dueAt)) / 60000));
  if (minutes < 60) return `${minutes}m overdue`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h overdue`;
  return `${Math.floor(hours / 24)}d overdue`;
}

/**
 * Top 5 longest-overdue follow-ups
 * @param {Object} props
 * @param {Array} props.followUps already sorted oldest due first
 * @param {number} props.totalOverdue
 * @param {Date} props.loadedAt time the metrics were fetched
 */
export default function UrgentFollowUpsCard({ followUps = [], totalOverdue = 0, loadedAt }) {
  const navigate = useNavigate();
  const remaining = totalOverdue - followUps.length;

  return (
    <Card
      title="Urgent Follow-ups"
      subtitle="Overdue counselling actions, longest waiting first"
      actions={
        <Button variant="ghost" size="sm" onClick={() => navigate('/follow-ups')}>
          View All <ArrowUpRight size={14} />
        </Button>
      }
    >
      {followUps.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <CheckCircle2 size={16} color="#059669" aria-hidden="true" />
          No overdue follow-ups. You're all caught up.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {followUps.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => navigate(`/leads/${task.lead_id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                borderLeft: '3px solid #dc2626',
                backgroundColor: '#ffffff',
                textAlign: 'left',
                cursor: 'pointer',
                width: '100%',
                font: 'inherit',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {task.lead?.full_name || 'Unknown enquiry'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {task.note}
                </div>
              </div>
              <Badge variant="lost" icon={<AlertCircle size={12} />} style={{ flexShrink: 0 }}>
                {overdueLabel(task.due_at, loadedAt)}
              </Badge>
            </button>
          ))}
          {remaining > 0 && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              +{remaining} more overdue on the Follow-ups page
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
