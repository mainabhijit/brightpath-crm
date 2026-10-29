import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  User,
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import {
  isOverdue,
  getOverdue,
  getUpcoming,
  getCompleted,
} from '../../services/followUpService';

/**
 * Tabbed follow-up list: Overdue / Upcoming / Completed / All
 * @param {Object} props
 * @param {Array} props.followUps
 * @param {(followUp: Object) => Promise<void>} props.onComplete
 * @param {boolean} [props.showLead=true] show student name + "View Lead" link (off on Lead Detail)
 * @param {string} [props.defaultTab='UPCOMING']
 */
export default function FollowUpList({
  followUps = [],
  onComplete,
  showLead = true,
  defaultTab = 'UPCOMING',
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [completingId, setCompletingId] = useState(null);
  // Re-evaluate overdue state every minute so pending tasks flip to Overdue live
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const overdue = getOverdue(followUps, now);
  const upcoming = getUpcoming(followUps, now);
  // Most recently completed first
  const completed = getCompleted(followUps).sort(
    (a, b) => new Date(b.completed_at) - new Date(a.completed_at)
  );

  const tabs = [
    { key: 'OVERDUE', label: 'Overdue', items: overdue, urgent: overdue.length > 0 },
    { key: 'UPCOMING', label: 'Upcoming', items: upcoming },
    { key: 'COMPLETED', label: 'Completed', items: completed },
    { key: 'ALL', label: 'All', items: followUps },
  ];

  const visible = tabs.find((t) => t.key === activeTab)?.items || [];

  async function handleComplete(task) {
    setCompletingId(task.id);
    try {
      await onComplete(task);
    } finally {
      setCompletingId(null);
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div
        role="tablist"
        style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.5rem 0.875rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === tab.key ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeTab === tab.key ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 150ms',
            }}
          >
            <span>{tab.label}</span>
            <span
              style={{
                fontSize: '0.6875rem',
                padding: '0.125rem 0.375rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: tab.urgent ? '#fee2e2' : '#f1f5f9',
                color: tab.urgent ? '#b91c1c' : 'var(--text-secondary)',
              }}
            >
              {tab.items.length}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', padding: '1rem 0' }}>
          No {activeTab === 'ALL' ? '' : `${activeTab.toLowerCase()} `}follow-ups.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {visible.map((task) => {
            const overdueNow = isOverdue(task, now);
            const dueLabel = new Date(task.due_at).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            });

            return (
              <Card
                key={task.id}
                style={{
                  padding: '1rem 1.25rem',
                  borderLeft: overdueNow ? '3px solid #dc2626' : undefined,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      {showLead && (
                        <>
                          <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{task.lead?.full_name || 'Unknown enquiry'}</h4>
                          {task.lead?.course_interest && (
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>({task.lead.course_interest})</span>
                          )}
                        </>
                      )}
                      {overdueNow && (
                        <Badge variant="lost" icon={<AlertCircle size={12} />}>
                          Overdue
                        </Badge>
                      )}
                      {task.status === 'completed' && (
                        <Badge variant="converted" icon={<CheckCircle2 size={12} />}>
                          Completed
                        </Badge>
                      )}
                      {task.status === 'cancelled' && (
                        <Badge variant="neutral">Cancelled</Badge>
                      )}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.375rem 0', overflowWrap: 'anywhere' }}>
                      {task.note}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: overdueNow ? '#b91c1c' : 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Calendar size={13} /> Due: <strong>{dueLabel}</strong>
                      </span>
                      {task.assigned_to_profile?.full_name && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)' }}>
                          <User size={13} /> {task.assigned_to_profile.full_name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {task.status === 'pending' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<CheckCircle2 size={14} />}
                        isLoading={completingId === task.id}
                        disabled={completingId !== null}
                        onClick={() => handleComplete(task)}
                      >
                        Mark as Completed
                      </Button>
                    )}
                    {showLead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/leads/${task.lead_id}`)}
                      >
                        View Lead <ArrowRight size={13} />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
