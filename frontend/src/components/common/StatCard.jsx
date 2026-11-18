import React from 'react';

/**
 * colorClass: one of the .stat-card-* gradient classes OR a custom background style
 * e.g. colorClass="stat-card-indigo"
 */
export default function StatCard({ title, value, icon, trend, trendLabel, colorClass = 'stat-card-indigo', onClick }) {
  const isPositive = trend && trend.startsWith('+');
  const isNegative = trend && trend.startsWith('-');

  return (
    <div
      className={`card border-0 h-100 ${colorClass} ${onClick ? 'transition-hover' : ''}`}
      style={{ cursor: onClick ? 'pointer' : 'default', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}
      onClick={onClick}
    >
      {/* Decorative circle */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 120, height: 120, borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 40, right: 20,
        width: 60, height: 60, borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
        pointerEvents: 'none',
      }} />

      <div className="card-body p-4 d-flex flex-column justify-content-between position-relative">
        {/* Icon */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}>
            <i className={`bi ${icon} text-white`} style={{ fontSize: '1.2rem' }}></i>
          </div>
        </div>

        {/* Value */}
        <div>
          <p className="mb-1" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.03em' }}>
            {title}
          </p>
          <h3 className="fw-bold mb-0 text-white" style={{ fontSize: '2rem', letterSpacing: '-0.04em' }}>
            {value}
          </h3>

          {trend && (
            <div className="d-flex align-items-center gap-2 mt-2" style={{ fontSize: '0.8rem' }}>
              <span style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 20, padding: '0.15rem 0.5rem',
                color: 'white', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 3,
              }}>
                <i className={`bi ${isPositive ? 'bi-arrow-up-right' : isNegative ? 'bi-arrow-down-right' : 'bi-dash'}`}></i>
                {trend}
              </span>
              {trendLabel && <span style={{ color: 'rgba(255,255,255,0.65)' }}>{trendLabel}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
