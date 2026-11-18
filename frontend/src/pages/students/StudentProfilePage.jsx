import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchUserByUsername,
  linkStudentProfile,
  fetchStudentById,
  updateStudent,
  fetchStudentProfileByStudentId,
  updateStudentProfile,
  createStudentProfile,
  createSkill,
  createCertificate
} from '../../services/api';

// ── small reusable helpers ────────────────────────────────────────────────────

function Field({ label, icon, children }) {
  return (
    <div className="mb-3">
      <label className="form-label d-flex align-items-center gap-2"
        style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569' }}>
        <i className={`bi ${icon}`} style={{ color: '#6366f1' }}></i>
        {label}
      </label>
      {children}
    </div>
  );
}

function ReadRow({ label, value }) {
  return (
    <div className="d-flex align-items-start py-3"
      style={{ borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ width: 160, flexShrink: 0, fontSize: '0.8125rem',
        fontWeight: 600, color: '#94a3b8' }}>{label}</span>
      <span style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 500 }}>
        {value || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>Not set</span>}
      </span>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function StudentProfilePage() {
  const { user } = useAuth();

  // raw data from API
  const [student, setStudent]       = useState(null);
  const [profile, setProfile]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // edit mode
  const [editing, setEditing]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState('');
  const [saveOk, setSaveOk]         = useState(false);


// Form state — mirrors Student + StudentProfile fields
const [form, setForm] = useState({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  department: '',
  batch: '',
  cgpa: '',
  bio: '',
  resumeUrl: ''
});

// Skills and Certificates
const [skills, setSkills] = useState([]);
const [certificates, setCertificates] = useState([]);

const [showAddSkill, setShowAddSkill] = useState(false);
const [showAddCert, setShowAddCert] = useState(false);

const [skillForm, setSkillForm] = useState({
  name: '',
  category: ''
});

const [certForm, setCertForm] = useState({
  name: '',
  issuedDate: ''
});

  // ── load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.username) return;
    (async () => {
      try {
        setLoading(true);
        setError('');

        const userObj = await linkStudentProfile();
        const sid = userObj?.student?.id;
        if (!sid) { setError('No student record linked to this account.'); return; }

        const studentData = userObj.student;
        setStudent(studentData);

        // fetch profile by student ID — returns 404 if not created yet
        let profileData = null;
        try { profileData = await fetchStudentProfileByStudentId(sid); }
        catch (_) { /* profile doesn't exist yet — that's fine */ }
        setProfile(profileData);
setSkills(profileData?.skills || []);
setCertificates(studentData?.certificates || profileData?.certificates || []);

        setForm({
          firstName:  studentData.firstName  || '',
          lastName:   studentData.lastName   || '',
          email:      studentData.email      || '',
          phone:      profileData?.phone      || '',
          department: profileData?.department || '',
          batch:      profileData?.batch      || '',
          cgpa:       profileData?.cgpa       != null ? String(profileData.cgpa) : '',
          bio:        profileData?.bio        || '',
          resumeUrl:  profileData?.resumeUrl  || '',
        });
      } catch (e) {
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.username]);

  // ── handlers ──────────────────────────────────────────────────────────────
  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaveOk(false);
    try {
      // 1) update Student (name + email)
      const updatedStudent = await updateStudent(student.id, {
        ...student,
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
      });
      setStudent(updatedStudent);

      // 2) update or create StudentProfile
      const profilePayload = {
        phone:      form.phone,
        department: form.department,
        batch:      form.batch,
        cgpa:       form.cgpa !== '' ? parseFloat(form.cgpa) : null,
        bio:        form.bio,
        resumeUrl:  form.resumeUrl,
        student:    { id: student.id },
      };

      let updatedProfile;
      if (profile?.id) {
        updatedProfile = await updateStudentProfile(profile.id, profilePayload);
      } else {
        updatedProfile = await createStudentProfile(profilePayload);
      }
      setProfile(updatedProfile);

      setSaveOk(true);
      setEditing(false);
      setTimeout(() => setSaveOk(false), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };


    // reset form back to current saved values
  const submitAddSkill = async (e) => {
    e.preventDefault();

    try {
      const savedSkill = await createSkill(skillForm);

      if (profile?.id) {
        await updateStudentProfile(profile.id, {
          ...profile,
          skills: [...skills, savedSkill]
        });
      }

      setSkills(prev => [...prev, savedSkill]);
      setShowAddSkill(false);
      setSkillForm({ name: '', category: '' });
    } catch (error) {
      console.error(error);
      alert('Failed to add skill.');
    }
  };

  const submitAddCert = async (e) => {
    e.preventDefault();

    try {
      if (!student?.id) return;

      const savedCert = await createCertificate({
        ...certForm,
        student: { id: student.id }
      });

      setCertificates(prev => [...prev, savedCert]);
      setShowAddCert(false);
      setCertForm({ name: '', issuedDate: '' });
    } catch (error) {
      console.error(error);
      alert('Failed to add certificate.');
    }
  };

//handle cancle

  const handleCancel = () => {
    setForm({
      firstName: student?.firstName || '',
      lastName: student?.lastName || '',
      email: student?.email || '',
      phone: profile?.phone || '',
      department: profile?.department || '',
      batch: profile?.batch || '',
      cgpa: profile?.cgpa != null ? String(profile.cgpa) : '',
      bio: profile?.bio || '',
      resumeUrl: profile?.resumeUrl || '',
    });

    setSaveError('');
    setSaveOk(false);
    setEditing(false);
  };

  // ── completion meter ───────────────────────────────────────────────────────
  const fields = ['firstName','lastName','email','phone','department','batch','cgpa','bio','resumeUrl'];
  const filled = fields.filter(k => form[k] && String(form[k]).trim() !== '').length;
  const pct    = Math.round((filled / fields.length) * 100);

  const initials = `${form.firstName?.[0] || ''}${form.lastName?.[0] || ''}`.toUpperCase() || '?';

  // ── render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center gap-2 mt-3" role="alert">
        <i className="bi bi-exclamation-triangle-fill"></i>
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* ── page header ── */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h4 style={{ fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>My Profile</h4>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 0 }}>
            Manage your personal information and placement details.
          </p>
        </div>
        {!editing && (
          <button className="btn d-flex align-items-center gap-2"
            onClick={() => setEditing(true)}
            style={{
              background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
              color: 'white', border: 'none', borderRadius: 12,
              fontWeight: 600, fontSize: '0.875rem', padding: '0.6rem 1.25rem',
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
            }}>
            <i className="bi bi-pencil-fill"></i> Edit Profile
          </button>
        )}
      </div>

      {/* ── success toast ── */}
      {saveOk && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-4"
          style={{ borderRadius: 12, border: 'none', background: '#d1fae5' }}>
          <i className="bi bi-check-circle-fill text-success"></i>
          <span style={{ fontWeight: 600, color: '#065f46' }}>Profile saved successfully!</span>
        </div>
      )}

      <div className="row g-4">
        {/* ── left: avatar + completion ── */}
        <div className="col-12 col-lg-3">
          <div className="card border-0 text-center p-4" style={{ borderRadius: 20 }}>
            {/* Avatar */}
            <div className="mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{
                width: 88, height: 88, borderRadius: '50%',
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                fontSize: '1.75rem', fontWeight: 800, color: 'white',
                boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
              }}>
              {initials}
            </div>
            <h6 style={{ fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
              {form.firstName} {form.lastName}
            </h6>
            <p style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 600, marginBottom: '1.25rem' }}>
              {form.department || 'Student'}
            </p>

            {/* Profile completion */}
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '0.875rem' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>
                  Profile completion
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6366f1' }}>{pct}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 99, background: '#e2e8f0' }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  background: pct >= 80
                    ? 'linear-gradient(90deg,#10b981,#059669)'
                    : pct >= 50
                      ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                      : 'linear-gradient(90deg,#6366f1,#4f46e5)',
                  width: `${pct}%`,
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 8, marginBottom: 0 }}>
                {pct < 80 ? 'Complete your profile to improve visibility.' : 'Great! Your profile looks complete.'}
              </p>
            </div>

            {/* Info chips */}
            <div className="mt-3 d-flex flex-column gap-2">
              {[
                { icon: 'bi-envelope-fill',   val: form.email      || '—', color: '#6366f1' },
                { icon: 'bi-telephone-fill',  val: form.phone      || '—', color: '#0ea5e9' },
                { icon: 'bi-mortarboard-fill',val: form.batch      || '—', color: '#10b981' },
                { icon: 'bi-graph-up',        val: form.cgpa ? `CGPA: ${form.cgpa}` : '—', color: '#f59e0b' },
              ].map((c, i) => (
                <div key={i} className="d-flex align-items-center gap-2 text-start p-2 rounded-3"
                  style={{ background: '#f8fafc', fontSize: '0.8rem', color: '#475569' }}>
                  <i className={`bi ${c.icon}`} style={{ color: c.color, flexShrink: 0 }}></i>
                  <span className="text-truncate">{c.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── right: details / edit form ── */}
        <div className="col-12 col-lg-9">

          {/* ── VIEW mode ── */}
          {!editing && (
            <>
              <div className="card border-0 mb-4" style={{ borderRadius: 20 }}>
                <div className="card-body p-4">
                  <h6 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '1rem',
                    paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                    <i className="bi bi-person-fill me-2" style={{ color: '#6366f1' }}></i>
                    Personal Information
                  </h6>
                  <ReadRow label="First Name"  value={form.firstName} />
                  <ReadRow label="Last Name"   value={form.lastName} />
                  <ReadRow label="Email"       value={form.email} />
                  <ReadRow label="Phone"       value={form.phone} />
                </div>
              </div>

              <div className="card border-0 mb-4" style={{ borderRadius: 20 }}>
                <div className="card-body p-4">
                  <h6 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '1rem',
                    paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                    <i className="bi bi-briefcase-fill me-2" style={{ color: '#6366f1' }}></i>
                    Academic & Placement Details
                  </h6>
                  <ReadRow label="Department"  value={form.department} />
                  <ReadRow label="Batch"       value={form.batch} />
                  <ReadRow label="CGPA"        value={form.cgpa} />
                  <ReadRow label="Resume URL"  value={form.resumeUrl
                    ? <a href={form.resumeUrl} target="_blank" rel="noreferrer"
                        style={{ color: '#6366f1', fontWeight: 600 }}>View Resume</a>
                    : null} />
                </div>
              </div>

              {form.bio && (
                <div className="card border-0" style={{ borderRadius: 20 }}>
                  <div className="card-body p-4">
                    <h6 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                      <i className="bi bi-chat-quote-fill me-2" style={{ color: '#6366f1' }}></i>
                      About Me
                    </h6>
                    <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.7, marginBottom: 0 }}>
                      {form.bio}
                    </p>
                  </div>
                </div>
              )}

{/* Skills Section */}
<div className="card border-0 mb-4" style={{ borderRadius: 20 }}>
  <div className="card-body p-4">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h6 className="fw-bold mb-0">
        <i className="bi bi-code-slash me-2 text-primary"></i>
        My Skills
      </h6>
      <button
        className="btn btn-sm btn-primary"
        onClick={() => setShowAddSkill(!showAddSkill)}
      >
        + Add Skill
      </button>
    </div>

    {skills.length === 0 ? (
      <p className="text-muted mb-0">No skills added yet.</p>
    ) : (
      <div className="d-flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span key={skill.id || index} className="badge bg-light text-dark border p-2">
            {skill.name}
            {skill.category && ` · ${skill.category}`}
          </span>
        ))}
      </div>
    )}

    {showAddSkill && (
      <form onSubmit={submitAddSkill} className="mt-3">
        <input
          className="form-control mb-2"
          placeholder="Skill name"
          value={skillForm.name}
          onChange={e => setSkillForm({ ...skillForm, name: e.target.value })}
          required
        />
        <input
          className="form-control mb-2"
          placeholder="Category (e.g. Programming)"
          value={skillForm.category}
          onChange={e => setSkillForm({ ...skillForm, category: e.target.value })}
        />
        <button type="submit" className="btn btn-success btn-sm me-2">
          Save Skill
        </button>
        <button type="button" className="btn btn-light btn-sm"
          onClick={() => setShowAddSkill(false)}>
          Cancel
        </button>
      </form>
    )}
  </div>
</div>

{/* Certificates Section */}
<div className="card border-0 mb-4" style={{ borderRadius: 20 }}>
  <div className="card-body p-4">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h6 className="fw-bold mb-0">
        <i className="bi bi-award-fill me-2 text-primary"></i>
        My Certificates
      </h6>
      <button
        className="btn btn-sm btn-primary"
        onClick={() => setShowAddCert(!showAddCert)}
      >
        + Add Certificate
      </button>
    </div>

    {certificates.length === 0 ? (
      <p className="text-muted mb-0">No certificates added yet.</p>
    ) : (
      <div>
        {certificates.map((cert, index) => (
          <div key={cert.id || index} className="border-bottom py-2">
            <strong>{cert.name}</strong>
            {cert.issuedDate && (
              <div className="text-muted small">
                Issued: {cert.issuedDate}
              </div>
            )}
          </div>
        ))}
      </div>
    )}

    {showAddCert && (
      <form onSubmit={submitAddCert} className="mt-3">
        <input
          className="form-control mb-2"
          placeholder="Certificate name"
          value={certForm.name}
          onChange={e => setCertForm({ ...certForm, name: e.target.value })}
          required
        />
        <label className="form-label">Issue Date</label>
        <input
          type="date"
          className="form-control mb-2"
          value={certForm.issuedDate}
          onChange={e => setCertForm({ ...certForm, issuedDate: e.target.value })}
        />
        <button type="submit" className="btn btn-success btn-sm me-2">
          Save Certificate
        </button>
        <button type="button" className="btn btn-light btn-sm"
          onClick={() => setShowAddCert(false)}>
          Cancel
        </button>
      </form>
    )}
  </div>
</div>

            </>
          )}

          {/* ── EDIT mode ── */}
          {editing && (
            <form onSubmit={handleSave}>
              {saveError && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-3"
                  style={{ borderRadius: 12 }}>
                  <i className="bi bi-exclamation-circle-fill"></i>
                  {saveError}
                </div>
              )}

              {/* Personal Info card */}
              <div className="card border-0 mb-4" style={{ borderRadius: 20 }}>
                <div className="card-body p-4">
                  <h6 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem',
                    paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                    <i className="bi bi-person-fill me-2" style={{ color: '#6366f1' }}></i>
                    Personal Information
                  </h6>
                  <div className="row g-3">
                    <div className="col-12 col-sm-6">
                      <Field label="First Name" icon="bi-person">
                        <input name="firstName" value={form.firstName} onChange={set}
                          required className="form-control shadow-none" placeholder="First name" />
                      </Field>
                    </div>
                    <div className="col-12 col-sm-6">
                      <Field label="Last Name" icon="bi-person">
                        <input name="lastName" value={form.lastName} onChange={set}
                          required className="form-control shadow-none" placeholder="Last name" />
                      </Field>
                    </div>
                    <div className="col-12 col-sm-6">
                      <Field label="Email" icon="bi-envelope">
                        <input type="email" name="email" value={form.email} onChange={set}
                          className="form-control shadow-none" placeholder="you@example.com" />
                      </Field>
                    </div>
                    <div className="col-12 col-sm-6">
                      <Field label="Phone" icon="bi-telephone">
                        <input name="phone" value={form.phone} onChange={set}
                          className="form-control shadow-none" placeholder="+91 98765 43210" />
                      </Field>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Info card */}
              <div className="card border-0 mb-4" style={{ borderRadius: 20 }}>
                <div className="card-body p-4">
                  <h6 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem',
                    paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                    <i className="bi bi-briefcase-fill me-2" style={{ color: '#6366f1' }}></i>
                    Academic & Placement Details
                  </h6>
                  <div className="row g-3">
                    <div className="col-12 col-sm-6">
                      <Field label="Department" icon="bi-building">
                        <input name="department" value={form.department} onChange={set}
                          className="form-control shadow-none" placeholder="e.g. Computer Science" />
                      </Field>
                    </div>
                    <div className="col-12 col-sm-6">
                      <Field label="Batch" icon="bi-mortarboard">
                        <input name="batch" value={form.batch} onChange={set}
                          className="form-control shadow-none" placeholder="e.g. 2022–2026" />
                      </Field>
                    </div>
                    <div className="col-12 col-sm-6">
                      <Field label="CGPA" icon="bi-graph-up">
                        <input type="number" name="cgpa" value={form.cgpa} onChange={set}
                          min="0" max="10" step="0.01"
                          className="form-control shadow-none" placeholder="e.g. 8.5" />
                      </Field>
                    </div>
                    <div className="col-12 col-sm-6">
                      <Field label="Resume URL" icon="bi-file-earmark-person">
                        <input name="resumeUrl" value={form.resumeUrl} onChange={set}
                          className="form-control shadow-none"
                          placeholder="https://drive.google.com/..." />
                      </Field>
                    </div>
                    <div className="col-12">
                      <Field label="About Me" icon="bi-chat-quote">
                        <textarea name="bio" value={form.bio} onChange={set}
                          rows={4} className="form-control shadow-none"
                          placeholder="Write a short bio about yourself, your skills and career goals…" />
                      </Field>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="d-flex gap-3 justify-content-end">
                <button type="button" onClick={handleCancel}
                  className="btn btn-light d-flex align-items-center gap-2"
                  style={{ borderRadius: 12, fontWeight: 600, padding: '0.6rem 1.5rem' }}>
                  <i className="bi bi-x-lg"></i> Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="btn d-flex align-items-center gap-2"
                  style={{
                    background: saving ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#4f46e5)',
                    color: 'white', border: 'none', borderRadius: 12,
                    fontWeight: 600, padding: '0.6rem 1.5rem',
                    boxShadow: saving ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
                  }}>
                  {saving
                    ? <><span className="spinner-border spinner-border-sm"></span> Saving…</>
                    : <><i className="bi bi-check-lg"></i> Save Changes</>
                  }
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
