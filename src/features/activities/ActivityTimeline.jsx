import React from 'react';
import {
  Activity,
  CalendarPlus,
  CheckCircle2,
  Edit3,
  RefreshCw,
  UserPlus,
} from 'lucide-react';

const TYPE_STYLES = {
  lead_created: { icon: UserPlus, color: '#2563eb', bg: '#dbeafe', label: 'Enquiry created' },
  status_updated: { icon: RefreshCw, color: '#7c3aed', bg: '#ede9fe', label: 'Stage changed' },
  lead_updated: { icon: Edit3, color: '#475569', bg: '#f1f5f9', label: 'Details edited' },
  follow_up_scheduled: { icon: CalendarPlus, color: '#d97706', bg: '#fef3c7', label: 'Follow-up scheduled' },
  follow_up_completed: { icon: CheckCircle2, color: '#059669', bg: '#d1fae5', label: 'Follow-up completed' },
};

const FALLBACK_STYLE = { icon: Activity, color: '#475569', bg: '#f1f5f9', label: 'Activity' };

/**
 * Vertical chronological timeline of lead activity rows (newest first)
 */
export default function ActivityTimeline({ activities = [], loading = false }) {
  if (loading) {
    return (
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading activity history...</p>
    );
  }

  if (activities.length === 0) {
    return (
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        No activity recorded for this enquiry yet.
      </p>
    );
  }

  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, position: 'relative' }}>
      {activities.map((item, index) => {
        const style = TYPE_STYLES[item.activity_type] || FALLBACK_STYLE;
        const Icon = style.icon;
        const isLast = index === activities.length - 1;
        const timestamp = new Date(item.created_at).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });

        return (
          <li key={item.id} style={{ display: 'flex', gap: '0.75rem', position: 'relative', paddingBottom: isLast ? 0 : '1rem' }}>
            {/* Connector line */}
            {!isLast && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '13px',
                  top: '28px',
                  bottom: 0,
                  width: '2px',
                  backgroundColor: 'var(--border-color)',
                }}
              />
            )}

            {/* Icon badge */}
            <span
              aria-hidden="true"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: style.bg,
                color: style.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={14} />
            </span>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {style.label}
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.125rem 0', overflowWrap: 'anywhere' }}>
                {item.description}
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {timestamp}
                {item.actor?.full_name && <> • by {item.actor.full_name}</>}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
