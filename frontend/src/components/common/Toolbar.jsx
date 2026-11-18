import React from 'react';

export default function Toolbar({ searchPlaceholder, onSearch, filters = [], actions = [] }) {
  return (
    <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
      {/* Search */}
      {(onSearch || searchPlaceholder) && (
        <div className="flex-grow-1" style={{ maxWidth: 380, minWidth: 200 }}>
          <div className="input-group">
            <span className="input-group-text border-end-0 pe-2"
              style={{ background: 'white', borderRight: 'none', borderRadius: '10px 0 0 10px' }}>
              <i className="bi bi-search text-muted" style={{ fontSize: '0.875rem' }}></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 shadow-none ps-1"
              placeholder={searchPlaceholder || 'Search…'}
              style={{ background: 'white', borderLeft: 'none', borderRadius: '0 10px 10px 0', fontSize: '0.875rem' }}
              onChange={(e) => onSearch && onSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="d-flex flex-wrap gap-2 ms-auto">
        {filters.map((filter, i) => (
          <select key={i}
            className="form-select shadow-none"
            style={{ width: 'auto', minWidth: 140, borderRadius: 10, fontSize: '0.875rem', fontWeight: 500 }}
            onChange={filter.onChange}>
            <option value="">{filter.label}</option>
            {filter.options?.filter(o => o.value !== '').map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ))}

        {actions.map((action, i) => (
          <button key={i} onClick={action.onClick}
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            style={{ borderRadius: 10, fontSize: '0.875rem' }}>
            {action.icon && <i className={`bi ${action.icon}`}></i>}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
