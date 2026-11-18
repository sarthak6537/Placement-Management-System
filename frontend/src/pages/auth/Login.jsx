import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [waitingForUser, setWaitingForUser] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isAuthenticated } = useAuth();

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // Once login() is called, token is set and AuthContext decodes it async.
  // This effect fires when user is finally populated — then navigate.
  useEffect(() => {
    if (waitingForUser && user) {
      setWaitingForUser(false);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, waitingForUser]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginUser(form);
      if (data?.accessToken) {
        login(data.accessToken);
        setWaitingForUser(true); // wait for AuthContext to decode token + set user
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 60%,#312e81 100%)',
    }}>
      {/* Left panel — branding */}
      <div className="d-none d-lg-flex flex-column justify-content-between p-5" style={{ width: '45%', color: 'white' }}>
        <div className="d-flex align-items-center gap-3">
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99,102,241,0.5)',
          }}>
            <i className="bi bi-mortarboard-fill text-white" style={{ fontSize: '1.1rem' }}></i>
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em' }}>PlacementHub</span>
        </div>

        <div>
          <h2 style={{ fontWeight: 800, fontSize: '2.25rem', letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: '1rem', color: 'white' }}>
            Your campus<br />placement hub.
          </h2>
          <p style={{ color: 'rgba(199,210,254,0.7)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            Manage students, jobs, interviews and<br />placement records — all in one place.
          </p>

          {[
            { icon: 'bi-people-fill',          color: '#818cf8', text: 'Student profiles & applications' },
            { icon: 'bi-briefcase-fill',        color: '#34d399', text: 'Live job postings from companies' },
            { icon: 'bi-calendar-event-fill',   color: '#fbbf24', text: 'Interview scheduling & tracking' },
            { icon: 'bi-bar-chart-fill',        color: '#f43f5e', text: 'Placement analytics & reports' },
          ].map((f, i) => (
            <div key={i} className="d-flex align-items-center gap-3 mb-3">
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${f.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <i className={`bi ${f.icon}`} style={{ color: f.color, fontSize: '0.9rem' }}></i>
              </div>
              <span style={{ fontSize: '0.9rem', color: 'rgba(226,232,240,0.85)', fontWeight: 500 }}>{f.text}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.5)' }}>
© 2026 PlacementHub · Placement Management System
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4" style={{
        background: '#f1f5f9',
        borderRadius: '0 0 0 0',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile logo */}
          <div className="d-flex d-lg-none align-items-center gap-3 mb-5 justify-content-center">
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="bi bi-mortarboard-fill text-white" style={{ fontSize: '1rem' }}></i>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a' }}>PlacementHub</span>
          </div>

          <h2 style={{ fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.04em', color: '#0f172a', marginBottom: 4 }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '2rem' }}>
            Sign in to your PlacementHub account
          </p>

          {/* Error */}
          {error && (
            <div style={{
              background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12,
              padding: '0.875rem 1.125rem', marginBottom: '1.25rem',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <i className="bi bi-exclamation-circle-fill" style={{ color: '#f43f5e', fontSize: '1rem', flexShrink: 0, marginTop: 1 }}></i>
              <span style={{ fontSize: '0.85rem', color: '#be123c', fontWeight: 500 }}>{error}</span>
            </div>
          )}

          {/* Form Card */}
          <div style={{
            background: 'white', borderRadius: 20,
            boxShadow: '0 20px 40px -8px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0', padding: '2rem',
          }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.125rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-person" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.9rem' }}></i>
                  <input name="username" value={form.username} onChange={set} required autoFocus
                    className="form-control shadow-none" placeholder="Enter your username"
                    style={{ paddingLeft: 36 }} />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: 4 }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569', margin: 0 }}>
                    Password
                  </label>
                </div>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-lock" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.9rem' }}></i>
                  <input type="password" name="password" value={form.password} onChange={set} required
                    className="form-control shadow-none" placeholder="••••••••"
                    style={{ paddingLeft: 36 }} />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                style={{
                  background: loading ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#4f46e5)',
                  border: 'none', color: 'white', borderRadius: 12,
                  fontWeight: 700, fontSize: '0.9375rem',
                  padding: '0.75rem',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(99,102,241,0.45)',
                  transition: 'all 0.2s',
                }}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm"></span> Signing in…</>
                  : <><i className="bi bi-box-arrow-in-right"></i> Sign In</>
                }
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: '#64748b' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 700, color: '#6366f1', textDecoration: 'none' }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
