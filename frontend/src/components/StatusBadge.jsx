import React from 'react';

export default function StatusBadge({ status }) {
  const cls =
    status === 'CRITICAL' ? 'badge-critical'
    : status === 'MODERATE' ? 'badge-moderate'
    : status === 'SAFE' ? 'badge-safe'
    : status === 'Clear' ? 'badge-clear'
    : status === 'Silted' ? 'badge-silted'
    : status === 'Blocked' ? 'badge-blocked'
    : status === 'warning' ? 'badge-warning'
    : 'badge-safe';
  return <span className={`badge ${cls}`}>{status}</span>;
}
