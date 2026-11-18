import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchJobPostingById, createJobPosting, updateJobPosting, fetchCompanies } from '../../services/api';

const CARD = { background:'white', borderRadius:20, border:'1px solid #e2e8f0', boxShadow:'0 2px 8px -1px rgba(0,0,0,0.06)', marginBottom:'1.5rem' };
const CARD_HEADER = { padding:'1rem 1.5rem', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:10 };
const LABEL = { fontSize:'0.8125rem', fontWeight:600, color:'#475569', marginBottom:'0.375rem', display:'block' };

export default function JobForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '', description: '', eligibleBatch: '', eligibleBranches: '',
    location: '', employmentType: 'Full-time', applicationDeadline: '',
    status: 'OPEN', company: { id: '' },
    minimumCgpa: '', requiredSkills: '', graduationYear: '',
  });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const cos = await fetchCompanies();
        setCompanies(cos);
        if (isEdit) {
          const d = await fetchJobPostingById(id);
          setFormData({
            title: d.title || '', description: d.description || '',
            eligibleBatch: d.eligibleBatch || '', eligibleBranches: d.eligibleBranches || '',
            location: d.location || '', employmentType: d.employmentType || 'Full-time',
            applicationDeadline: d.applicationDeadline || '', status: d.status || 'OPEN',
            company: d.company || { id: '' },
            minimumCgpa: d.minimumCgpa != null ? String(d.minimumCgpa) : '',
            requiredSkills: d.requiredSkills || '',
            graduationYear: d.graduationYear != null ? String(d.graduationYear) : '',
          });
        }
      } catch { setError('Failed to load data.'); }
      finally { setLoading(false); }
    })();
  }, [id, isEdit]);

  const set = (name, value) => setFormData(p => ({ ...p, [name]: value }));

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'companyId') set('company', { id: parseInt(value, 10) || '' });
    else set(name, value);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!formData.company.id) { setError('Please select a company.'); return; }
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        company: { id: parseInt(formData.company.id, 10) },
        applicationDeadline: formData.applicationDeadline || null,
        minimumCgpa: formData.minimumCgpa !== '' ? parseFloat(formData.minimumCgpa) : null,
        graduationYear: formData.graduationYear !== '' ? parseInt(formData.graduationYear, 10) : null,
        requiredSkills: formData.requiredSkills || null,
      };
      if (isEdit) await updateJobPosting(id, payload);
      else await createJobPosting(payload);
      navigate('/jobs');
    } catch (err) {
      let msg = err.message || 'Failed to save job posting.';
      try { msg = JSON.parse(msg).message || msg; } catch (_) {}
      setError(msg);
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div style={{ width:52,height:52,borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center' }}>
        <div className="spinner-border text-white" style={{ width:28,height:28,borderWidth:2 }}></div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2 style={{ fontWeight:800, fontSize:'1.625rem', letterSpacing:'-0.04em', color:'#0f172a', marginBottom:4 }}>
            {isEdit ? 'Edit Job Posting' : 'Post a New Job'}
          </h2>
          <p style={{ fontSize:'0.875rem', color:'#64748b', margin:0 }}>
            {isEdit ? 'Update job details, eligibility and status.' : 'Create a new campus placement opportunity.'}
          </p>
        </div>
        <button onClick={() => navigate('/jobs')}
          className="btn btn-outline-secondary d-flex align-items-center gap-2"
          style={{ borderRadius:10 }}>
          <i className="bi bi-x-lg"></i> Cancel
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{ background:'#fff1f2', border:'1px solid #fecdd3', borderRadius:12, padding:'0.875rem 1.25rem', marginBottom:'1.5rem', display:'flex', gap:10, alignItems:'flex-start' }}>
          <i className="bi bi-exclamation-circle-fill" style={{ color:'#f43f5e', fontSize:'1rem', marginTop:2, flexShrink:0 }}></i>
          <span style={{ fontSize:'0.875rem', color:'#be123c', fontWeight:500 }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Job Details Card */}
        <div style={CARD}>
          <div style={CARD_HEADER}>
            <div style={{ width:32,height:32,borderRadius:8,background:'#eef2ff',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <i className="bi bi-briefcase-fill" style={{ color:'#6366f1',fontSize:'0.875rem' }}></i>
            </div>
            <span style={{ fontWeight:700, fontSize:'0.9375rem', color:'#0f172a' }}>Job Details</span>
          </div>
          <div style={{ padding:'1.5rem' }}>
            <div className="row g-3">
              <div className="col-12 col-md-8">
                <label style={LABEL}>Job Title <span style={{color:'#f43f5e'}}>*</span></label>
                <input name="title" value={formData.title} onChange={handleChange} required
                  className="form-control shadow-none" placeholder="e.g. Software Engineer" />
              </div>
              <div className="col-12 col-md-4">
                <label style={LABEL}>Company <span style={{color:'#f43f5e'}}>*</span></label>
                <select name="companyId" value={formData.company.id} onChange={handleChange}
                  required className="form-select shadow-none">
                  <option value="">Select company…</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label style={LABEL}>Employment Type</label>
                <select name="employmentType" value={formData.employmentType} onChange={handleChange} className="form-select shadow-none">
                  <option>Full-time</option>
                  <option>Internship</option>
                  <option>Contract</option>
                  <option>Part-time</option>
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label style={LABEL}>Location</label>
                <input name="location" value={formData.location} onChange={handleChange}
                  className="form-control shadow-none" placeholder="e.g. Bangalore or Remote" />
              </div>
              <div className="col-12">
                <label style={LABEL}>Job Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange}
                  rows={4} className="form-control shadow-none"
                  placeholder="Describe the role, responsibilities, and requirements…" />
              </div>
            </div>
          </div>
        </div>

        {/* Eligibility Engine Card */}
        <div style={CARD}>
          <div style={CARD_HEADER}>
            <div style={{ width:32,height:32,borderRadius:8,background:'#fffbeb',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <i className="bi bi-cpu-fill" style={{ color:'#f59e0b',fontSize:'0.875rem' }}></i>
            </div>
            <div>
              <span style={{ fontWeight:700, fontSize:'0.9375rem', color:'#0f172a' }}>Eligibility Engine</span>
              <div style={{ fontSize:'0.78rem', color:'#94a3b8', marginTop:1 }}>Students will be automatically checked against these requirements</div>
            </div>
          </div>
          <div style={{ padding:'1.5rem' }}>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label style={LABEL}>Minimum CGPA</label>
                <input type="number" name="minimumCgpa" value={formData.minimumCgpa} onChange={handleChange}
                  min="0" max="10" step="0.1"
                  className="form-control shadow-none" placeholder="e.g. 7.5" />
                <div style={{ fontSize:'0.75rem', color:'#94a3b8', marginTop:4 }}>Leave blank for no CGPA requirement</div>
              </div>
              <div className="col-12 col-md-4">
                <label style={LABEL}>Graduation Year</label>
                <input type="number" name="graduationYear" value={formData.graduationYear} onChange={handleChange}
                  min="2020" max="2035"
                  className="form-control shadow-none" placeholder="e.g. 2026" />
                <div style={{ fontSize:'0.75rem', color:'#94a3b8', marginTop:4 }}>Leave blank for any graduation year</div>
              </div>
              <div className="col-12 col-md-4">
                <label style={LABEL}>Required Skills</label>
                <input name="requiredSkills" value={formData.requiredSkills} onChange={handleChange}
                  className="form-control shadow-none" placeholder="Java, Spring Boot, SQL, React" />
                <div style={{ fontSize:'0.75rem', color:'#94a3b8', marginTop:4 }}>Comma-separated skill names</div>
              </div>
            </div>
          </div>
        </div>

        {/* Eligibility Card */}
        <div style={CARD}>
          <div style={CARD_HEADER}>
            <div style={{ width:32,height:32,borderRadius:8,background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <i className="bi bi-person-check-fill" style={{ color:'#10b981',fontSize:'0.875rem' }}></i>
            </div>
            <span style={{ fontWeight:700, fontSize:'0.9375rem', color:'#0f172a' }}>Eligibility & Logistics</span>
          </div>
          <div style={{ padding:'1.5rem' }}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label style={LABEL}>Eligible Batch</label>
                <input name="eligibleBatch" value={formData.eligibleBatch} onChange={handleChange}
                  className="form-control shadow-none" placeholder="e.g. 2026" />
              </div>
              <div className="col-12 col-md-6">
                <label style={LABEL}>Eligible Branches</label>
                <input name="eligibleBranches" value={formData.eligibleBranches} onChange={handleChange}
                  className="form-control shadow-none" placeholder="e.g. CSE, IT, ECE" />
              </div>
              <div className="col-12 col-md-6">
                <label style={LABEL}>Application Deadline</label>
                <input type="date" name="applicationDeadline" value={formData.applicationDeadline} onChange={handleChange}
                  className="form-control shadow-none" />
              </div>
              <div className="col-12 col-md-6">
                <label style={LABEL}>Listing Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="form-select shadow-none">
                  <option value="OPEN">Open — Accepting Applications</option>
                  <option value="CLOSED">Closed</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="d-flex justify-content-end gap-3" style={{ paddingTop:'0.5rem' }}>
          <button type="button" onClick={() => navigate('/jobs')}
            className="btn btn-outline-secondary px-4" style={{ borderRadius:10, fontWeight:600 }}>
            Discard
          </button>
          <button type="submit" disabled={submitting}
            className="btn btn-primary px-5 d-flex align-items-center gap-2" style={{ borderRadius:10, fontWeight:700 }}>
            {submitting
              ? <><span className="spinner-border spinner-border-sm"></span> Saving…</>
              : <><i className="bi bi-check2-circle"></i> {isEdit ? 'Update Job' : 'Publish Job'}</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
