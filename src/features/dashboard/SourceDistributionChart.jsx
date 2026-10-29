import React from 'react';
import DistributionBars from './DistributionBars';

/**
 * Source attribution: lead count per enquiry channel, largest first
 */
export default function SourceDistributionChart({ items, total }) {
  return (
    <DistributionBars
      items={items}
      total={total}
      emptyText="No enquiry sources recorded yet."
    />
  );
}
