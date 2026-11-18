import React from 'react';

export default function DataTable({
  columns, data, loading, error,
  emptyStateIcon = 'bi-inbox',
  emptyStateTitle = 'No data available',
  emptyStateMessage = 'There are no records to display at this time.',
  emptyStateAction,
  keyField = 'id',
  pagination = null,
}) {

  if (loading) {
    return (
      <div className="card border-0" style={{ borderRadius: 'var(--radius-xl)' }}>
        <div className="card-body d-flex align-items-center justify-content-center py-5" style={{ minHeight: 280 }}>
          <div className="text-center">
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <div className="spinner-border text-white" role="status" style={{ width: 24, height: 24, borderWidth: 2 }}>
                <span className="visually-hidden">Loading…</span>
              </div>
            </div>
            <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>Loading data…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-start gap-3 p-4" style={{ borderRadius: 'var(--radius-xl)' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, background: '#ffe4e6',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <i className="bi bi-exclamation-triangle-fill" style={{ color: '#f43f5e', fontSize: '1rem' }}></i>
        </div>
        <div>
          <div className="fw-bold mb-1" style={{ fontSize: '0.875rem' }}>Failed to load data</div>
          <div style={{ fontSize: '0.825rem' }}>{error}</div>
        </div>
      </div>
    );
  }

  const isEmpty = !data || data.length === 0;

  return (
    <div className="card border-0" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {columns.map((col, i) => (
                  <th key={i} className={col.className || ''} style={{ ...col.style, padding: '0.875rem 1.25rem' }}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isEmpty ? (
                <tr>
                  <td colSpan={columns.length} style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#eef2ff,#f8fafc)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 1.25rem',
                      border: '2px solid #e2e8f0',
                    }}>
                      <i className={`bi ${emptyStateIcon}`} style={{ fontSize: '1.75rem', color: '#94a3b8' }}></i>
                    </div>
                    <div className="fw-bold" style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '0.375rem' }}>
                      {emptyStateTitle}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
                      {emptyStateMessage}
                    </p>
                    {emptyStateAction && (
                      <button onClick={emptyStateAction.onClick}
                        className="btn btn-primary btn-sm px-4">
                        <i className="bi bi-plus-lg me-1"></i>{emptyStateAction.label}
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                data.map((row, ri) => (
                  <tr key={row[keyField] ?? ri}>
                    {columns.map((col, ci) => (
                      <td key={ci} className={col.tdClassName || ''} style={{ padding: '0.875rem 1.25rem' }}>
                        {col.render ? col.render(row) : row[col.field]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center px-4 py-3"
            style={{ borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Showing {Math.min((pagination.currentPage - 1) * pagination.itemsPerPage + 1, pagination.totalItems)}–
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems}
            </span>
            <div className="d-flex gap-1 mt-2 mt-sm-0">
              <button className="btn btn-light btn-sm" style={{ borderRadius: 8, padding: '0.3rem 0.75rem' }}
                disabled={pagination.currentPage === 1}
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}>
                <i className="bi bi-chevron-left"></i>
              </button>
              {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => i + 1).map(page => (
                <button key={page}
                  style={{
                    borderRadius: 8, padding: '0.3rem 0.65rem', fontSize: '0.8125rem', fontWeight: 600,
                    background: pagination.currentPage === page
                      ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                      : '#f8fafc',
                    color: pagination.currentPage === page ? 'white' : '#475569',
                    border: pagination.currentPage === page ? 'none' : '1px solid #e2e8f0',
                    boxShadow: pagination.currentPage === page ? '0 2px 8px rgba(99,102,241,0.35)' : 'none',
                  }}
                  className="btn btn-sm"
                  onClick={() => pagination.onPageChange(page)}>
                  {page}
                </button>
              ))}
              <button className="btn btn-light btn-sm" style={{ borderRadius: 8, padding: '0.3rem 0.75rem' }}
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}>
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
