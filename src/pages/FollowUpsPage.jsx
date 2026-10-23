import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

export default function FollowUpsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ALL');

  const followUps = [
    {
      id: 'f-1',
      lead_id: 'lead-1',
      student: 'Aarav Sharma',
      course: 'IIT-JEE Target 2027',
      due_at: 'Oct 23, 10:30 AM',
      isOverdue: true,
      note: 'Call student to explain study materials and scholarship criteria.',
      status: 'pending',
    },
    {
      id: 'f-2',
      lead_id: 'lead-2',
      student: 'Priya Patel',
      course: 'NEET Dropper Batch',
      due_at: 'Oct 23, 02:00 PM',
      isOverdue: false,
      note: 'Confirm walk-in parent visit for biology faculty interaction.',
      status: 'pending',
    },
    {
      id: 'f-3',
      lead_id: 'lead-3',
      student: 'Rohan Deshmukh',
      course: 'Foundation Class 10',
      due_at: 'Oct 25, 11:00 AM',
      isOverdue: false,
      note: 'Send fee structure brochure and syllabus PDF via email.',
      status: 'pending',
    },
    {
      id: 'f-4',
      lead_id: 'lead-4',
      student: 'Ananya Gupta',
      course: 'IIT-JEE Advanced Intensive',
      due_at: 'Oct 22, 05:00 PM',
      isOverdue: false,
      note: 'Enrolment fee received. Confirmed admission batch allotted.',
      status: 'completed',
    },
  ];

  const filteredTasks = followUps.filter((task) => {
    if (activeTab === 'OVERDUE') return task.isOverdue && task.status === 'pending';
    if (activeTab === 'UPCOMING') return !task.isOverdue && task.status === 'pending';
    if (activeTab === 'COMPLETED') return task.status === 'completed';
    return true;
  });

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
          <Button variant="primary" icon={<Plus size={16} />}>
            Schedule Task
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        {[
          { key: 'ALL', label: 'All Tasks', count: followUps.length },
          { key: 'OVERDUE', label: 'Overdue', count: 1, urgent: true },
          { key: 'UPCOMING', label: 'Upcoming', count: 2 },
          { key: 'COMPLETED', label: 'Completed', count: 1 },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
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
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Follow-up Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {filteredTasks.map((task) => (
          <Card key={task.id} style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{task.student}</h4>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>({task.course})</span>
                  {task.isOverdue && task.status === 'pending' && (
                    <Badge variant="lost" icon={<AlertCircle size={12} />}>
                      Overdue
                    </Badge>
                  )}
                  {task.status === 'completed' && (
                    <Badge variant="converted" icon={<CheckCircle2 size={12} />}>
                      Completed
                    </Badge>
                  )}
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.375rem 0' }}>
                  {task.note}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <Calendar size={13} /> Scheduled: <strong>{task.due_at}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {task.status === 'pending' && (
                  <Button variant="secondary" size="sm" icon={<CheckCircle2 size={14} />}>
                    Mark Done
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/leads/${task.lead_id}`)}
                >
                  View Lead <ArrowRight size={13} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
