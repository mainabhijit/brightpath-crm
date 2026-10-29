import React from 'react';
import Badge from '../../components/common/Badge';
import DistributionBars from './DistributionBars';

/**
 * Pipeline breakdown: lead count per admission stage, in pipeline order
 */
export default function StatusDistributionChart({ items, total }) {
  return (
    <DistributionBars
      items={items}
      total={total}
      renderLabel={(item) => <Badge variant={item.label}>{item.label}</Badge>}
      emptyText="No enquiries in the pipeline yet."
    />
  );
}
