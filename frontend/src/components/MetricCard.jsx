import React from 'react';

export default function MetricCard({ label, value, delta }) {
  return (
    <div className="metric-card">
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
      {delta !== undefined && <span className="metric-delta">{delta}</span>}
    </div>
  );
}
