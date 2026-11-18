import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchMyCertificates, createCertificate, deleteCertificate, fetchUserByUsername, linkStudentProfile } from '../../services/api';

export default function CertificateList() {
  const { user } = useAuth();
  const isStudent = user?.roles?.includes('ROLE_STUDENT');

  const [certs, setCerts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Add form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ name: '', issuedDate: '' });
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState('');

  // Delete state
  const [deletingId, setDeletingId] = useState(null);

  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    if (!isStudent) return;
    loadCerts();
    loadStudentId();
  }, [isStudent, user?.username]);

  const loadStudentId = async () => {
    try {
      let userObj = await fetchUserByUsername(user.username).catch(() => null);
      if (userObj?.student?.id) {
        setStudentId(userObj.student.id);
      } else {
        const linked = await linkStudentProfile();
        if (linked?.student?.id) setStudentId(linked.student.id);
      }
    } catch (e) {
      console.warn('Could not fetch student ID', e);
    }
  };

  const loadCerts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchMyCertificates();
      setCerts(data);
    } catch (e) {
      setError('Failed to load certificates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!studentId) {
      setSaveError('Student profile not linked. Cannot add certificate.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const newCert = await createCertificate({
        name: form.name,
        issuedDate: form.issuedDate,
        student: { id: studentId }
      });
      setCerts(prev => [newCert, ...prev]);
      setForm({ name: '', issuedDate: '' });
      setShowForm(false);
    } catch (err) {
      setSaveError(err.message || 'Failed to add certificate.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteCertificate(id);
      setCerts(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('Failed to delete certificate.');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Non-student fallback ──
  if (!isStudent) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-patch-check" style={{ fontSize: '3rem', color: '#cbd5e1' }}></i>
        <h5 className="mt-3" style={{ color: '#64748b' }}>Certificates</h5>
        <p style={{ color: '#94a3b8' }}>This page is for students only.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h4 style={{ fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
            <i className="bi bi-patch-check-fill me-2" style={{ color: '#6366f1' }}></i>
            My Certificates
          </h4>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 0 }}>
            Track and manage your course and skill certificates.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(f => !f); setSaveError(''); }}
          className="btn d-flex align-items-center gap-2"
          style={{
            background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
            color: 'white', border: 'none', borderRadius: 12,
            fontWeight: 600, fontSize: '0.875rem', padding: '0.6rem 1.25rem',
            boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
          }}>
          <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'}`}></i>
          {showForm ? 'Cancel' : 'Add Certificate'}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card border-0 mb-4" style={{ borderRadius: 16, border: '1px solid #e2e8f0' }}>
          <div className="card-body p-4">
            <h6 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              <i className="bi bi-plus-circle-fill me-2" style={{ color: '#6366f1' }}></i>
              Add New Certificate
            </h6>
            {saveError && (
              <div className="alert alert-danger py-2 px-3 mb-3" style={{ borderRadius: 10, fontSize: '0.85rem' }}>
                <i className="bi bi-exclamation-circle-fill me-2"></i>{saveError}
              </div>
            )}
            <form onSubmit={handleAdd}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>
                    Certificate Name <span style={{ color: '#f43f5e' }}>*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required className="form-control shadow-none"
                    placeholder="e.g. AWS Cloud Practitioner" />
                </div>
                <div className="col-12 col-md-6">
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>
                    Issued Date <span style={{ color: '#f43f5e' }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={form.issuedDate}
                    onChange={e => setForm(f => ({ ...f, issuedDate: e.target.value }))}
                    required className="form-control shadow-none" />
                </div>
              </div>
              <div className="d-flex justify-content-end mt-3">
                <button type="submit" disabled={saving}
                  className="btn d-flex align-items-center gap-2"
                  style={{
                    background: saving ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#4f46e5)',
                    color: 'white', border: 'none', borderRadius: 10,
                    fontWeight: 600, padding: '0.5rem 1.5rem',
                  }}>
                  {saving
                    ? <><span className="spinner-border spinner-border-sm"></span> Saving…</>
                    : <><i className="bi bi-check-lg"></i> Save Certificate</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2" style={{ borderRadius: 12 }}>
          <i className="bi bi-exclamation-triangle-fill"></i> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && certs.length === 0 && (
        <div className="text-center py-5">
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: '#eef2ff', display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
          }}>
            <i className="bi bi-patch-check" style={{ fontSize: '2rem', color: '#6366f1' }}></i>
          </div>
          <h5 style={{ fontWeight: 700, color: '#0f172a' }}>No certificates yet</h5>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Add your first certificate to showcase your skills.
          </p>
          <button onClick={() => setShowForm(true)}
            className="btn btn-sm"
            style={{
              background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
              color: 'white', border: 'none', borderRadius: 10,
              fontWeight: 600, padding: '0.5rem 1.25rem',
            }}>
            <i className="bi bi-plus-lg me-1"></i> Add Certificate
          </button>
        </div>
      )}

      {/* Certificate Cards */}
      {!loading && certs.length > 0 && (
        <div className="row g-3">
          {certs.map(cert => (
            <div className="col-12 col-md-6 col-xl-4" key={cert.id}>
              <div className="card border-0 h-100" style={{
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                transition: 'box-shadow 0.2s',
              }}>
                <div className="card-body p-4">
                  {/* Icon + Name */}
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: 'linear-gradient(135deg,#eef2ff,#ede9fe)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <i className="bi bi-patch-check-fill" style={{ color: '#6366f1', fontSize: '1.2rem' }}></i>
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <h6 style={{
                        fontWeight: 700, color: '#0f172a', marginBottom: 2,
                        fontSize: '0.9375rem', wordBreak: 'break-word',
                      }}>
                        {cert.name}
                      </h6>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <i className="bi bi-calendar3"></i>
                        {cert.issuedDate
                          ? new Date(cert.issuedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="d-flex justify-content-between align-items-center pt-3"
                    style={{ borderTop: '1px solid #f1f5f9' }}>
                    <span style={{
                      background: '#d1fae5', color: '#065f46',
                      fontWeight: 700, fontSize: '0.72rem',
                      borderRadius: 20, padding: '0.2em 0.7em',
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}>
                      <i className="bi bi-check-circle-fill"></i> Verified
                    </span>
                    <button
                      onClick={() => handleDelete(cert.id)}
                      disabled={deletingId === cert.id}
                      className="btn btn-sm d-flex align-items-center gap-1"
                      style={{
                        color: '#ef4444', background: '#fff1f2',
                        border: '1px solid #fecdd3', borderRadius: 8,
                        fontWeight: 600, fontSize: '0.78rem',
                        padding: '0.25rem 0.75rem',
                      }}>
                      {deletingId === cert.id
                        ? <span className="spinner-border spinner-border-sm"></span>
                        : <><i className="bi bi-trash3"></i> Delete</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
