import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { fetchJobApplications, fetchInterviews } from '../../services/api';

const ROLE_CONFIG = {
  ROLE_ADMIN:             { label: 'Admin',             color: '#f43f5e', bg: 'rgba(244,63,94,0.12)' },
  ROLE_PLACEMENT_OFFICER: { label: 'Placement Officer', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  ROLE_STUDENT:           { label: 'Student',           color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const primaryRole = user?.roles?.[0] || '';
  const roleCfg = ROLE_CONFIG[primaryRole] || { label: 'User', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' };
  const isStudent = user?.roles?.includes('ROLE_STUDENT');

  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifRead, setNotifRead] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    try {
      if (isStudent) {
        // Students see their recent application status changes and upcoming interviews
        const [apps, ints] = await Promise.all([
          fetchJobApplications().catch(() => []),
          fetchInterviews().catch(() => []),
        ]);
        const notifs = [];
        apps.slice(-5).reverse().forEach(a => {
          notifs.push({
            id: `app-${a.id}`,
            icon: 'bi-file-earmark-text-fill',
            color: '#6366f1',
            title: `Application ${a.status?.toLowerCase() || 'submitted'}`,
            body: `${a.jobPosting?.title || 'Job'} at ${a.jobPosting?.company?.name || 'Company'}`,
            time: a.appliedOn,
          });
        });
        ints.slice(-3).reverse().forEach(i => {
          notifs.push({
            id: `int-${i.id}`,
            icon: 'bi-calendar-event-fill',
            color: '#f59e0b',
            title: `Interview: ${i.roundName || 'Scheduled'}`,
            body: `${i.jobPosting?.company?.name || 'Company'} · ${i.mode || 'TBD'}`,
            time: i.scheduledAt ? new Date(i.scheduledAt).toLocaleDateString('en-IN') : null,
          });
        });
        setNotifications(notifs.slice(0, 6));
      } else {
        // PO/Admin see recent applications
        const apps = await fetchJobApplications().catch(() => []);
        const notifs = [...apps].reverse().slice(0, 6).map(a => ({
          id: `app-${a.id}`,
          icon: 'bi-person-fill-check',
          color: '#6366f1',
          title: `New application`,
          body: `${a.student?.firstName || ''} ${a.student?.lastName || ''} → ${a.jobPosting?.title || 'Job'}`,
          time: a.appliedOn,
        }));
        setNotifications(notifs);
      }
    } catch (e) {
      console.error('Notif load error', e);
    }
  };

  const unreadCount = notifRead ? 0 : notifications.length;

  return (
    <div className="d-flex min-vh-100" style={{ background: '#f1f5f9' }}>

      {/* ── Fixed Sidebar ─────────────────────────── */}
      <div className="d-none d-lg-flex flex-column"
        style={{ width: 260, minHeight: '100vh', position: 'sticky', top: 0, height: '100vh', zIndex: 100 }}>
        <Sidebar />
      </div>

      {/* ── Main Column ───────────────────────────── */}
      <div className="flex-grow-1 d-flex flex-column min-vw-0">

        {/* Top Navbar */}
        <nav style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky', top: 0, zIndex: 200,
          padding: '0 1.75rem',
          height: 64,
          display: 'flex', alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 1px 0 0 #e2e8f0',
        }}>
          {/* Mobile: Hamburger + Brand */}
          <div className="d-flex align-items-center gap-3 d-lg-none">
            <button className="btn btn-light p-0 d-flex align-items-center justify-content-center border"
              type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileSidebar"
              style={{ width: 38, height: 38, borderRadius: 10 }}>
              <i className="bi bi-list" style={{ fontSize: '1.25rem' }}></i>
            </button>
            <div className="d-flex align-items-center gap-2">
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className="bi bi-mortarboard-fill text-white" style={{ fontSize: '0.8rem' }}></i>
              </div>
              <span className="fw-bold" style={{ color: '#0f172a', fontSize: '0.95rem' }}>PlacementHub</span>
            </div>
          </div>

          {/* Search */}
          <div className="d-none d-md-flex flex-grow-1" style={{ maxWidth: 400 }}>
            <div className="input-group">
              <span className="input-group-text border-end-0 pe-2 ps-3"
                style={{ background: '#f8fafc', borderRight: 'none', borderRadius: '10px 0 0 10px' }}>
                <i className="bi bi-search text-muted" style={{ fontSize: '0.875rem' }}></i>
              </span>
              <input type="search" className="form-control border-start-0 ps-1 shadow-none"
                placeholder="Search students, jobs, companies..."
                style={{ background: '#f8fafc', borderLeft: 'none', borderRadius: '0 10px 10px 0', fontSize: '0.85rem' }} />
            </div>
          </div>

          <div className="ms-auto d-flex align-items-center gap-2">
            {/* Notifications */}
            <div className="dropdown">
              <button
                className="btn btn-light position-relative d-flex align-items-center justify-content-center"
                style={{ width: 38, height: 38, borderRadius: 10, padding: 0, border: '1px solid #e2e8f0' }}
                onClick={() => { setShowNotifs(v => !v); setNotifRead(true); }}
                type="button"
              >
                <i className="bi bi-bell" style={{ fontSize: '1rem', color: '#475569' }}></i>
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 5, right: 5,
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#f43f5e', border: '1.5px solid white',
                  }} />
                )}
              </button>

              {showNotifs && (
                <>
                  {/* Click-outside overlay */}
                  <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setShowNotifs(false)} />
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    width: 340, zIndex: 300,
                    background: 'white', borderRadius: 16,
                    boxShadow: '0 20px 40px -8px rgba(0,0,0,0.18)',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                  }}>
                    {/* Header */}
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Notifications</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{notifications.length} recent updates</div>
                      </div>
                      <button onClick={() => { setNotifRead(true); setShowNotifs(false); }}
                        style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}>
                        Mark all read
                      </button>
                    </div>

                    {/* List */}
                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                          <i className="bi bi-bell-slash d-block mb-2" style={{ fontSize: '1.5rem' }}></i>
                          <span style={{ fontSize: '0.85rem' }}>No notifications yet</span>
                        </div>
                      ) : (
                        notifications.map((n, i) => (
                          <div key={n.id} style={{
                            display: 'flex', gap: '0.75rem', padding: '0.875rem 1.25rem',
                            borderBottom: i < notifications.length - 1 ? '1px solid #f8fafc' : 'none',
                            transition: 'background 0.15s',
                            cursor: 'default',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fafbff'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <div style={{
                              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                              background: `${n.color}15`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <i className={`bi ${n.icon}`} style={{ color: n.color, fontSize: '0.9rem' }}></i>
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#0f172a', marginBottom: 2 }}>{n.title}</div>
                              <div style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.body}</div>
                              {n.time && <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>{timeAgo(n.time) || n.time}</div>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                      <Link
                        to={isStudent ? '/my-applications' : '/applications'}
                        onClick={() => setShowNotifs(false)}
                        style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#6366f1', textDecoration: 'none' }}
                      >
                        View all activity →
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User dropdown */}
            <div className="dropdown">
              <button className="btn d-flex align-items-center gap-2 px-2"
                style={{ border: '1px solid #e2e8f0', borderRadius: 12, height: 44, background: 'white' }}
                data-bs-toggle="dropdown">
                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                  style={{ width: 30, height: 30, fontSize: '0.8rem', background: roleCfg.bg, color: roleCfg.color }}>
                  {(user?.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="d-none d-md-block text-start lh-sm">
                  <div className="fw-semibold" style={{ fontSize: '0.8rem', color: '#0f172a' }}>
                    {user?.username || 'User'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: roleCfg.color, fontWeight: 600 }}>{roleCfg.label}</div>
                </div>
                <i className="bi bi-chevron-down d-none d-md-block" style={{ fontSize: '0.65rem', color: '#94a3b8' }}></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-end mt-2" style={{ minWidth: 200 }}>
                <li className="px-3 py-2 border-bottom mb-1">
                  <div className="fw-semibold text-dark" style={{ fontSize: '0.875rem' }}>{user?.username}</div>
                  <div style={{ fontSize: '0.75rem', color: roleCfg.color, fontWeight: 600 }}>{roleCfg.label}</div>
                </li>
                <li>
                  <Link className="dropdown-item d-flex align-items-center gap-2" to="/profile">
                    <i className="bi bi-person" style={{ color: '#6366f1' }}></i> My Profile
                  </Link>
                </li>
                {user?.roles?.includes('ROLE_ADMIN') && (
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2" to="/settings">
                      <i className="bi bi-gear" style={{ color: '#94a3b8' }}></i> Settings
                    </Link>
                  </li>
                )}
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item d-flex align-items-center gap-2 text-danger" onClick={logout}>
                    <i className="bi bi-box-arrow-right"></i> Sign Out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Mobile Offcanvas */}
        <div className="offcanvas offcanvas-start border-0" tabIndex="-1" id="mobileSidebar" style={{ width: 280 }}>
          <div className="offcanvas-header" style={{
            background: 'linear-gradient(180deg,#0f172a,#1e1b4b)',
            padding: '1.25rem 1.25rem 1rem',
          }}>
            <div className="d-flex align-items-center gap-3">
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className="bi bi-mortarboard-fill text-white" style={{ fontSize: '0.9rem' }}></i>
              </div>
<span className="fw-bold text-white" style={{ fontSize: '1rem' }}>PlacementHub</span>
            </div>
            <button type="button" className="btn-close btn-close-white shadow-none" data-bs-dismiss="offcanvas"></button>
          </div>
          <div className="offcanvas-body p-0">
            <Sidebar isMobile />
          </div>
        </div>

        {/* Page Content */}
        <main className="page-container flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
