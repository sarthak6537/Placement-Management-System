import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { path: '/', label: 'Dashboard', icon: 'bi-grid-1x2-fill', roles: ['ROLE_ADMIN', 'ROLE_PLACEMENT_OFFICER', 'ROLE_STUDENT'] },
    ]
  },
  {
    label: 'Recruitment',
    items: [
      { path: '/students',     label: 'Students',      icon: 'bi-people-fill',           roles: ['ROLE_ADMIN', 'ROLE_PLACEMENT_OFFICER'] },
      { path: '/companies',    label: 'Companies',     icon: 'bi-building-fill',          roles: ['ROLE_ADMIN', 'ROLE_PLACEMENT_OFFICER', 'ROLE_STUDENT'] },
      { path: '/jobs',         label: 'Job Postings',  icon: 'bi-briefcase-fill',         roles: ['ROLE_ADMIN', 'ROLE_PLACEMENT_OFFICER', 'ROLE_STUDENT'] },
      { path: '/applications', label: 'Applications',  icon: 'bi-file-earmark-text-fill', roles: ['ROLE_ADMIN', 'ROLE_PLACEMENT_OFFICER'] },
      { path: '/interviews',   label: 'Interviews',    icon: 'bi-calendar-event-fill',    roles: ['ROLE_ADMIN', 'ROLE_PLACEMENT_OFFICER'] },
      { path: '/placements',   label: 'Placements',    icon: 'bi-award-fill',             roles: ['ROLE_ADMIN', 'ROLE_PLACEMENT_OFFICER'] },
    ]
  },
  {
    label: 'Management',
    items: [
      { path: '/colleges',   label: 'Colleges',   icon: 'bi-mortarboard-fill',     roles: ['ROLE_ADMIN', 'ROLE_PLACEMENT_OFFICER'] },
      { path: '/statistics', label: 'Statistics', icon: 'bi-bar-chart-fill',       roles: ['ROLE_ADMIN', 'ROLE_PLACEMENT_OFFICER'] },
      { path: '/reports',    label: 'Reports',    icon: 'bi-graph-up-arrow',        roles: ['ROLE_ADMIN', 'ROLE_PLACEMENT_OFFICER'] },
      { path: '/users',      label: 'Users',      icon: 'bi-shield-fill-check',     roles: ['ROLE_ADMIN'] },
    ]
  },
  {
    label: 'Student',
    items: [
      { path: '/recommended-jobs', label: 'Recommended Jobs', icon: 'bi-stars',                        roles: ['ROLE_STUDENT'] },
      { path: '/my-applications',  label: 'My Applications',  icon: 'bi-file-earmark-check-fill',      roles: ['ROLE_STUDENT'] },
      { path: '/certificates',     label: 'Certificates',     icon: 'bi-patch-check-fill',              roles: ['ROLE_STUDENT'] },
    ]
  }
];

const ROLE_CONFIG = {
  ROLE_ADMIN:             { label: 'Administrator',      color: '#f43f5e', bg: 'rgba(244,63,94,0.15)' },
  ROLE_PLACEMENT_OFFICER: { label: 'Placement Officer',  color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  ROLE_STUDENT:           { label: 'Student',            color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
};

export default function Sidebar({ isMobile }) {
  const { logout, user } = useAuth();
  const userRoles = user?.roles || [];
  const primaryRole = userRoles[0] || '';
  const roleCfg = ROLE_CONFIG[primaryRole] || { label: 'User', color: '#818cf8', bg: 'rgba(129,140,248,0.15)' };

  const visibleGroups = navGroups.map(g => ({
    ...g,
    items: g.items.filter(item => item.roles.some(r => userRoles.includes(r)))
  })).filter(g => g.items.length > 0);

  return (
    <div className="d-flex flex-column h-100" style={{
      background: 'linear-gradient(180deg,#0f172a 0%,#1e1b4b 100%)',
      minHeight: '100vh',
    }}>
      {/* Brand */}
      {!isMobile && (
        <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <NavLink to="/" className="d-flex align-items-center gap-3 text-decoration-none">
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99,102,241,0.45)',
              flexShrink: 0,
            }}>
              <i className="bi bi-mortarboard-fill text-white" style={{ fontSize: '1rem' }}></i>
            </div>
            <div>
              <div className="fw-bold text-white" style={{ fontSize: '1rem', letterSpacing: '-0.02em' }}>PlacementHub</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>Placement Management System</div>
            </div>
          </NavLink>
        </div>
      )}

      {/* User pill */}
      <div className="px-3 pt-3 pb-2">
        <div className="d-flex align-items-center gap-3 px-2 py-2 rounded-3" style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
            style={{ width: 34, height: 34, fontSize: '0.85rem', background: roleCfg.bg, color: roleCfg.color }}>
            {(user?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="fw-semibold text-white text-truncate" style={{ fontSize: '0.825rem' }}>
              {user?.username || 'User'}
            </div>
            <div style={{ fontSize: '0.68rem', color: roleCfg.color, fontWeight: 600 }}>
              {roleCfg.label}
            </div>
          </div>
        </div>
      </div>

      {/* Nav Groups */}
      <div className="flex-grow-1 overflow-auto px-3 py-2" style={{ scrollbarWidth: 'none' }}>
        {visibleGroups.map((group) => (
          <div key={group.label} className="mb-3">
            <div className="px-2 mb-1" style={{
              fontSize: '0.6rem', fontWeight: 700,
              color: 'rgba(148,163,184,0.5)',
              textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>
              {group.label}
            </div>
            <ul className="nav flex-column gap-1 list-unstyled mb-0">
              {group.items.map(({ path, label, icon }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    end={path === '/'}
                    className={({ isActive }) =>
                      `custom-nav-link d-flex align-items-center gap-3 w-100 text-decoration-none ${isActive ? 'active' : ''}`
                    }
                    data-bs-dismiss={isMobile ? 'offcanvas' : undefined}
                  >
                    <i className={`bi ${icon}`} style={{ fontSize: '0.95rem', width: 18, textAlign: 'center' }}></i>
                    <span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="px-3 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
        <ul className="nav flex-column gap-1 list-unstyled mb-0">
          <li>
            <NavLink to="/profile"
              className={({ isActive }) => `custom-nav-link d-flex align-items-center gap-3 w-100 text-decoration-none ${isActive ? 'active' : ''}`}
              data-bs-dismiss={isMobile ? 'offcanvas' : undefined}
            >
              <i className="bi bi-person-circle" style={{ fontSize: '0.95rem', width: 18, textAlign: 'center' }}></i>
              <span>My Profile</span>
            </NavLink>
          </li>
          <li>
            <button onClick={logout}
              className="custom-nav-link d-flex align-items-center gap-3 w-100 border-0 bg-transparent text-start"
              style={{ cursor: 'pointer', color: '#f43f5e' }}
            >
              <i className="bi bi-box-arrow-right" style={{ fontSize: '0.95rem', width: 18, textAlign: 'center' }}></i>
              <span style={{ fontWeight: 600 }}>Sign Out</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
