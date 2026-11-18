
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../services/api';

const ROLE_INFO = {
  ROLE_STUDENT: {
    icon: 'bi-mortarboard-fill',
    color: '#10b981',
    label: 'Student',
    desc: 'Browse jobs and track your applications',
  },
  ROLE_PLACEMENT_OFFICER: {
    icon: 'bi-briefcase-fill',
    color: '#f59e0b',
    label: 'Placement Officer',
    desc: 'Manage postings, interviews and placements',
  },
  ROLE_ADMIN: {
    icon: 'bi-shield-fill-check',
    color: '#f43f5e',
    label: 'Administrator',
    desc: 'Full system access and user management',
  },
};

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    role: 'ROLE_STUDENT',
    fullName: '',
    department: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const roleInfo = ROLE_INFO[form.role];

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerUser(form);
      navigate('/login');
    } catch (err) {
      let msg = err.message || 'Registration failed. Please try again.';
      try {
        msg = JSON.parse(msg).message || msg;
      } catch (_) {}
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg,#f8fafc 0%,#eef2ff 50%,#f0fdf4 100%)',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* PlacementHub Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
              marginBottom: '1rem',
            }}
          >
            <i
              className="bi bi-mortarboard-fill text-white"
              style={{ fontSize: '1.375rem' }}
            ></i>
          </div>

          <h1
            style={{
              fontWeight: 800,
              fontSize: '1.625rem',
              color: '#0f172a',
              letterSpacing: '-0.04em',
              marginBottom: 4,
            }}
          >
            Join PlacementHub
          </h1>

          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            Create your account and get started
          </p>
        </div>

        {/* Registration Card */}
        <div
          style={{
            background: 'white',
            borderRadius: 20,
            boxShadow: '0 20px 40px -8px rgba(0,0,0,0.12)',
            border: '1px solid rgba(255,255,255,0.8)',
            padding: '2rem',
          }}
        >

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: 12,
                padding: '0.875rem 1.125rem',
                marginBottom: '1.5rem',
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
              }}
            >
              <i
                className="bi bi-exclamation-circle-fill"
                style={{
                  color: '#f43f5e',
                  fontSize: '1rem',
                  flexShrink: 0,
                  marginTop: 1,
                }}
              ></i>

              <span
                style={{
                  fontSize: '0.85rem',
                  color: '#be123c',
                  fontWeight: 500,
                  lineHeight: 1.5,
                }}
              >
                {error}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Role Selector */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#475569',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                Account Type
              </label>

              <div className="row g-2">
                {Object.entries(ROLE_INFO).map(([val, info]) => (
                  <div key={val} className="col-4">
                    <label
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                        padding: '0.75rem 0.5rem',
                        borderRadius: 12,
                        cursor: 'pointer',
                        border:
                          form.role === val
                            ? `2px solid ${info.color}`
                            : '2px solid #e2e8f0',
                        background:
                          form.role === val ? `${info.color}10` : 'white',
                        transition: 'all 0.15s',
                      }}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={val}
                        checked={form.role === val}
                        onChange={set}
                        style={{ display: 'none' }}
                      />

                      <i
                        className={`bi ${info.icon}`}
                        style={{
                          fontSize: '1.25rem',
                          color: form.role === val ? info.color : '#94a3b8',
                        }}
                      ></i>

                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: form.role === val ? info.color : '#94a3b8',
                          textAlign: 'center',
                          lineHeight: 1.2,
                        }}
                      >
                        {info.label}
                      </span>
                    </label>
                  </div>
                ))}
              </div>

              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  margin: '0.5rem 0 0',
                  textAlign: 'center',
                }}
              >
                {roleInfo.desc}
              </p>
            </div>

            {/* Username */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#475569',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                Username <span style={{ color: '#f43f5e' }}>*</span>
              </label>

              <div style={{ position: 'relative' }}>
                <i
                  className="bi bi-person"
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    fontSize: '0.9rem',
                  }}
                ></i>

                <input
                  name="username"
                  value={form.username}
                  onChange={set}
                  required
                  className="form-control shadow-none"
                  placeholder="Choose a username"
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#475569',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                Email Address <span style={{ color: '#f43f5e' }}>*</span>
              </label>

              <div style={{ position: 'relative' }}>
                <i
                  className="bi bi-envelope"
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    fontSize: '0.9rem',
                  }}
                ></i>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={set}
                  required
                  className="form-control shadow-none"
                  placeholder="name@example.com"
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#475569',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                Password <span style={{ color: '#f43f5e' }}>*</span>
              </label>

              <div style={{ position: 'relative' }}>
                <i
                  className="bi bi-lock"
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    fontSize: '0.9rem',
                  }}
                ></i>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={set}
                  required
                  minLength={6}
                  className="form-control shadow-none"
                  placeholder="At least 6 characters"
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </div>

            {/* Admin Extra Field */}
            {form.role === 'ROLE_ADMIN' && (
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#475569',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  Full Name <span style={{ color: '#f43f5e' }}>*</span>
                </label>

                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={set}
                  required
                  className="form-control shadow-none"
                  placeholder="Your full name"
                />
              </div>
            )}

            {/* Placement Officer Extra Field */}
            {form.role === 'ROLE_PLACEMENT_OFFICER' && (
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#475569',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  Department <span style={{ color: '#f43f5e' }}>*</span>
                </label>

                <input
                  name="department"
                  value={form.department}
                  onChange={set}
                  required
                  className="form-control shadow-none"
                  placeholder="e.g. Placement Cell"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn w-100 d-flex align-items-center justify-content-center gap-2 mt-2"
              style={{
                background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                border: 'none',
                color: 'white',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: '0.9375rem',
                padding: '0.75rem',
                boxShadow: loading
                  ? 'none'
                  : '0 4px 14px rgba(99,102,241,0.45)',
                transition: 'all 0.2s',
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm"></span>
                  Creating account...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus-fill"></i>
                  Create Account
                </>
              )}
            </button>
          </form>
        </div>

        {/* Login Link */}
        <p
          style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            fontSize: '0.875rem',
            color: '#64748b',
          }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              fontWeight: 700,
              color: '#6366f1',
              textDecoration: 'none',
            }}
          >
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
