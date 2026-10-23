import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Clock,
  User,
  GraduationCap,
  Plus,
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState('New');

  return (
    <div>
      {/* Top Navigation & Actions */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => navigate('/leads')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} /> Back to Enquiry Pipeline
        </button>
      </div>

      {/* Lead Summary Header Card */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 700 }}>Aarav Sharma</h2>
              <Badge variant={currentStatus}>{currentStatus}</Badge>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Enquiry ID: <code style={{ backgroundColor: '#f1f5f9', padding: '0.125rem 0.375rem', borderRadius: 'var(--radius-xs)' }}>{id || 'lead-1'}</code> • Created on Oct 22, 2026
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</label>
              <select
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                }}
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            <Button variant="primary" size="sm" icon={<Plus size={14} />}>
              Schedule Call
            </Button>
          </div>
        </div>
      </Card>

      {/* Grid: Details & Activity Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Left Column: Contact & Course Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Card title="Student & Guardian Details">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={15} color="var(--text-muted)" />
                <span style={{ fontWeight: 600 }}>+91 98765 43210</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={15} color="var(--text-muted)" />
                <span>aarav.sharma@example.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GraduationCap size={15} color="var(--text-muted)" />
                <span>Target: <strong>IIT-JEE (2 Year Classroom Batch)</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={15} color="var(--text-muted)" />
                <span>Assigned Counsellor: <strong>Staff Counsellor</strong></span>
              </div>
            </div>
          </Card>

          <Card title="Scheduled Follow-up">
            <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#b45309', fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                <Clock size={14} /> Overdue Task
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                Call parent to discuss scholarship entrance test syllabus and timings.
              </p>
              <Button variant="outline" size="sm">
                Mark as Completed
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Activity Audit Timeline */}
        <Card title="Activity & Audit History" subtitle="Automated chronological trail of counselling actions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            {[
              { title: 'Status changed to Contacted', time: 'Today, 11:30 AM', actor: 'Staff Counsellor' },
              { title: 'Follow-up call scheduled', time: 'Yesterday, 04:15 PM', actor: 'Staff Counsellor' },
              { title: 'Enquiry received from Website Form', time: 'Oct 22, 09:45 AM', actor: 'System' },
            ].map((activity, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--primary)',
                    marginTop: '0.375rem',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{activity.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}>
                    <span><Calendar size={11} /> {activity.time}</span>
                    <span>• {activity.actor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
