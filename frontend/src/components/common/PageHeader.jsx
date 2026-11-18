import React from 'react';

export default function PageHeader({ title, subtitle, primaryAction, secondaryAction, badge }) {
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3 mb-4">
      <div>
        {badge && (
          <span className="badge mb-2 d-inline-flex align-items-center gap-1"
            style={{
              background: 'rgba(99,102,241,0.1)',
              color: '#6366f1',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 20,
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.3em 0.75em',
              letterSpacing: '0.04em',
            }}>
            <i className="bi bi-lightning-fill" style={{ fontSize: '0.65rem' }}></i>
            {badge}
          </span>
        )}
        <h2 style={{
          fontSize: '1.625rem',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          color: '#0f172a',
          marginBottom: subtitle ? '0.25rem' : 0,
        }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: 0, fontWeight: 400 }}>
            {subtitle}
          </p>
        )}
      </div>

      {(primaryAction || secondaryAction) && (
        <div className="d-flex gap-2 flex-shrink-0">
          {secondaryAction && (
            <button onClick={secondaryAction.onClick}
              className="btn btn-outline-secondary d-flex align-items-center gap-2">
              {secondaryAction.icon && <i className={`bi ${secondaryAction.icon}`}></i>}
              {secondaryAction.label}
            </button>
          )}
          {primaryAction && (
            <button onClick={primaryAction.onClick}
              className="btn btn-primary d-flex align-items-center gap-2">
              {primaryAction.icon && <i className={`bi ${primaryAction.icon}`}></i>}
              {primaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
