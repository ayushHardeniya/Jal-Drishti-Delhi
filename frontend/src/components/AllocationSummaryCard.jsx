import React from 'react';

export default function AllocationSummaryCard({ label, value, note, tone = 'default' }) {
  return (
    <div className={`allocation-summary-card allocation-summary-${tone}`}>
      <span className="allocation-summary-label">{label}</span>
      <span className="allocation-summary-value">{value}</span>
      {note && <span className="allocation-summary-note">{note}</span>}
    </div>
  );
}