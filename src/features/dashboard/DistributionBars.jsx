import React from 'react';

/**
 * Single-series horizontal bar list. Bar width = share of total, so the
 * percentage label and the bar length always agree. Labels and counts are
 * printed on every row, so the chart doubles as its own data table.
 * @param {Object} props
 * @param {Array<{label: string, count: number}>} props.items
 * @param {number} props.total
 * @param {(item: Object) => React.ReactNode} [props.renderLabel]
 * @param {string} [props.emptyText]
 */
export default function DistributionBars({
  items = [],
  total = 0,
  renderLabel,
  emptyText = 'No data yet.',
}) {
  if (!total || items.length === 0) {
    return <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{emptyText}</p>;
  }

  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {items.map((item) => {
        const percent = Math.round((item.count / total) * 100);
        const summary = `${item.label}: ${item.count} of ${total} (${percent}%)`;

        return (
          <li key={item.label} title={summary} aria-label={summary}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-secondary)', minWidth: 0 }}>
                {renderLabel ? renderLabel(item) : item.label}
              </span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                {item.count} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({percent}%)</span>
              </span>
            </div>
            <div aria-hidden="true" style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${percent}%`,
                  minWidth: item.count > 0 ? '4px' : 0,
                  height: '100%',
                  backgroundColor: 'var(--primary)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 300ms',
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
