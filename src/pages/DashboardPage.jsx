import React from 'react';
import {
  Users,
  UserCheck,
  Clock,
  TrendingUp,
  AlertCircle,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();

  // Fictional sample metrics for Phase 1 visual verification
  const kpiStats = [
    { title: 'Total Leads', value: '48', change: '+12% this week', icon: Users, color: '#2563eb' },
    { title: 'New Enquiries', value: '14', change: '5 today', icon: Clock, color: '#0284c7' },
    { title: 'Converted Admissions', value: '18', change: '37.5% rate', icon: UserCheck, color: '#059669' },
    { title: 'Overdue Follow-ups', value: '4', change: 'Requires action', icon: AlertCircle, color: '#dc2626', urgent: true },
    { title: 'Conversion Rate', value: '37.5%', change: 'Target: >35%', icon: TrendingUp, color: '#7c3aed' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Executive Dashboard</h2>
          <p className="page-description">
            Enquiry pipeline, counsellor activity, and follow-up metrics.
          </p>
        </div>
        <div className="page-actions">
          <Badge variant="neutral" icon={<Calendar size={13} />}>
            Academic Session 2026–27
          </Badge>
          <Button variant="primary" size="sm" onClick={() => navigate('/leads')}>
            View Lead Pipeline
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {kpiStats.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} style={{ padding: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                  {kpi.title}
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: `${kpi.color}15`,
                    color: kpi.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
                {kpi.value}
              </div>
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: kpi.urgent ? '#dc2626' : '#059669',
                  }}
                >
                  {kpi.change}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pipeline & Follow-ups Preview Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Pipeline Distribution Card */}
        <Card
          title="Pipeline Stage Breakdown"
          subtitle="Distribution of current enquiries across admission stages"
          actions={
            <Button variant="ghost" size="sm" onClick={() => navigate('/leads')}>
              View Table <ArrowUpRight size={14} />
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { label: 'New Enquiries', count: 14, percent: 29, badge: 'new' },
              { label: 'Contacted / Pitch Sent', count: 10, percent: 21, badge: 'contacted' },
              { label: 'Qualified / Test Scheduled', count: 6, percent: 12, badge: 'qualified' },
              { label: 'Converted to Admission', count: 18, percent: 38, badge: 'converted' },
            ].map((stage, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                  <Badge variant={stage.badge}>{stage.label}</Badge>
                  <span style={{ fontWeight: 600 }}>{stage.count} ({stage.percent}%)</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${stage.percent}%`,
                      height: '100%',
                      backgroundColor: 'var(--primary)',
                      borderRadius: 'var(--radius-full)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Urgent Actions Card */}
        <Card
          title="High Priority Follow-ups"
          subtitle="Enquiries scheduled for counselling action today"
          actions={
            <Button variant="ghost" size="sm" onClick={() => navigate('/follow-ups')}>
              View All <ArrowUpRight size={14} />
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { student: 'Aarav Sharma', course: 'IIT-JEE Target 2027', time: '10:30 AM (Overdue)', tag: 'lost' },
              { student: 'Priya Patel', course: 'NEET Dropper Batch', time: '02:00 PM Today', tag: 'contacted' },
              { student: 'Rohan Deshmukh', course: 'Foundation Class 10', time: '04:30 PM Today', tag: 'new' },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.student}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.course}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Badge variant={item.tag}>{item.time}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
