import React from 'react';

const STATUS_CONFIG = {
  /* Generic */
  Active:   { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  Inactive: { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
  Pending:  { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  Disabled: { bg: '#ffe4e6', color: '#be123c', dot: '#f43f5e' },

  /* Jobs */
  OPEN:   { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  CLOSED: { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
  DRAFT:  { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },

  /* Applications */
  APPLIED:     { bg: '#eef2ff', color: '#4338ca', dot: '#6366f1' },
  SHORTLISTED: { bg: '#cffafe', color: '#155e75', dot: '#06b6d4' },
  INTERVIEW:   { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  SELECTED:    { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  REJECTED:    { bg: '#ffe4e6', color: '#be123c', dot: '#f43f5e' },

  /* Interviews */
  SCHEDULED:  { bg: '#cffafe', color: '#155e75', dot: '#06b6d4' },
  COMPLETED:  { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  CANCELLED:  { bg: '#ffe4e6', color: '#be123c', dot: '#f43f5e' },

  /* Certs */
  Verified: { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },

  /* Settings */
  Enabled:  { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  Ready:    { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
};

export default function StatusBadge({ status, customConfig = {} }) {
  if (!status) return null;

  const merged = { ...STATUS_CONFIG, ...customConfig };
  const cfg = merged[status];

  if (cfg) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: cfg.bg, color: cfg.color,
        borderRadius: 20, padding: '0.25em 0.7em',
        fontSize: '0.72rem', fontWeight: 700,
        letterSpacing: '0.03em', whiteSpace: 'nowrap',
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: cfg.dot, flexShrink: 0,
        }} />
        {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
      </span>
    );
  }

  /* Fallback */
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: '#f1f5f9', color: '#475569',
      borderRadius: 20, padding: '0.25em 0.7em',
      fontSize: '0.72rem', fontWeight: 700,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', flexShrink: 0 }} />
      {status}
    </span>
  );
}
