import React from 'react';
import {
  Users,
  UserCheck,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import Card from '../../components/common/Card';

/**
 * The 5 headline KPI tiles
 * @param {Object} props
 * @param {Object} props.metrics output of fetchDashboardMetrics()
 */
export default function MetricCards({ metrics }) {
  const { totalLeads, newLeads, convertedLeads, overdueCount, conversionRate } = metrics;
  const hasOverdue = overdueCount > 0;

  const kpiStats = [
    { title: 'Total Leads', value: totalLeads, note: 'Across all pipeline stages', icon: Users, color: '#2563eb' },
    { title: 'New Enquiries', value: newLeads, note: 'Awaiting first contact', icon: Clock, color: '#0284c7' },
    { title: 'Converted Admissions', value: convertedLeads, note: `${conversionRate}% of all leads`, icon: UserCheck, color: '#059669' },
    {
      title: 'Overdue Follow-ups',
      value: overdueCount,
      note: hasOverdue ? 'Requires action' : 'All caught up',
      noteIcon: hasOverdue ? AlertCircle : CheckCircle2,
      noteColor: hasOverdue ? '#dc2626' : '#059669',
      icon: AlertCircle,
      color: '#dc2626',
    },
    { title: 'Conversion Rate', value: `${conversionRate}%`, note: 'Converted ÷ total leads', icon: TrendingUp, color: '#7c3aed' },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}
    >
      {kpiStats.map((kpi) => {
        const Icon = kpi.icon;
        const NoteIcon = kpi.noteIcon;
        return (
          <Card key={kpi.title} style={{ padding: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                {kpi.title}
              </span>
              <div
                aria-hidden="true"
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
            <div
              style={{
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: kpi.noteColor || 'var(--text-muted)',
              }}
            >
              {NoteIcon && <NoteIcon size={13} aria-hidden="true" />}
              <span>{kpi.note}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
