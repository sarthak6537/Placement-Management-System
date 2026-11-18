import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchUserByUsername, fetchRecommendedJobs, createJobApplication } from '../../services/api';

// ── small helpers ─────────────────────────────────────────────────────────────

function ScoreBadge({ score }) {
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const bg    = score >= 80 ? '#d1fae5' : score >= 50 ? '#fef3c7' : '#fee2e2';
  return (
    <span style={{
      background: bg, color, fontWeight: 800, fontSize: '0.8rem',
      borderRadius: 20, padding: '0.25em 0.75em', display: 'inline-flex',
      alignItems: 'center', gap: 4,
    }}>
      <i className="bi bi-lightning-charge-fill"></i> {score}% Match
    </span>
  );
}

function EligibilityPill({ eligible, reasons }) {
  return eligible ? (
    <span style={{
      background: '#d1fae5', color: '#065f46', fontWeight: 700,
      fontSize: '0.78rem', borderRadius: 20, padding: '0.2em 0.7em',
      display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      <i className="bi bi-check-circle-fill"></i> Eligible
    </span>
  ) : (
    <span style={{
      background: '#fee2e2', color: '#991b1b', fontWeight: 700,
      fontSize: '0.78rem', borderRadius: 20, padding: '0.2em 0.7em',
      display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      <i className="bi bi-x-circle-fill"></i> Not Eligible
    </span>
  );
}

function SkillChip({ name, matched }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: matched ? '#d1fae5' : '#fee2e2',
      color: matched ? '#065f46' : '#991b1b',
      fontWeight: 600, fontSize: '0.75rem',
      borderRadius: 20, padding: '0.2em 0.7em',
      border: `1px solid ${matched ? '#a7f3d0' : '#fecaca'}`,
    }}>
      <i className={`bi ${matched ? 'bi-check-lg' : 'bi-x-lg'}`}></i>
      {name}
    </span>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function RecommendedJobs() {
  const { user } = useAuth();
  const [studentId, setStudentId]   = useState(null);
  const [jobs, setJobs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [expanded, setExpanded]     = useState(null); // jobId that is expanded
  const [applyState, setApplyState] = useState({});   // { [jobId]: 'loading'|'done'|'error'|'duplicate' }
  const [filterEligible, setFilterEligible] = useState(false);

  useEffect(() => {
    if (!user?.username) return;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const u = await fetchUserByUsername(user.username);
        const sid = u?.student?.id;
        if (!sid) {
          setError('Your account is not linked to a student record. Please contact your placement officer.');
          return;
        }
        setStudentId(sid);
        const data = await fetchRecommendedJobs(sid);
        setJobs(data);
      } catch (e) {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.username]);

  const handleApply = async (jobId) => {
    if (!studentId) return;
    setApplyState(s => ({ ...s, [jobId]: 'loading' }));
    try {
      await createJobApplication({
        jobPosting: { id: jobId },
        student: { id: studentId },
        status: 'APPLIED',
        appliedOn: new Date().toISOString().split('T')[0],
      });
      setApplyState(s => ({ ...s, [jobId]: 'done' }));
    } catch (err) {
      const isDup = err.message?.toLowerCase().includes('already') || err.message?.includes('409');
      setApplyState(s => ({ ...s, [jobId]: isDup ? 'duplicate' : 'error' }));
    }
  };

  const displayed = filterEligible ? jobs.filter(j => j.eligible) : jobs;

  // ── loading state ──
  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading…</span>
      </div>
    </div>
  );

  // ── error state ──
  if (error) return (
    <div className="alert alert-danger d-flex align-items-center gap-2 mt-3" role="alert">
      <i className="bi bi-exclamation-triangle-fill"></i> {error}
    </div>
  );

  // ── stats bar ──
  const totalJobs      = jobs.length;
  const eligibleJobs   = jobs.filter(j => j.eligible).length;
  const avgScore       = totalJobs > 0
    ? Math.round(jobs.reduce((s, j) => s + j.matchScore, 0) / totalJobs)
    : 0;
  const perfectMatch   = jobs.filter(j => j.matchScore === 100).length;

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="mb-4">
        <h4 style={{ fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
          <i className="bi bi-stars me-2" style={{ color: '#6366f1' }}></i>
          Recommended Jobs
        </h4>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 0 }}>
          Jobs ranked by your skill match score. Eligible jobs appear first.
        </p>
      </div>

      {/* ── Stats Row ── */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Jobs',     value: totalJobs,    icon: 'bi-briefcase',        color: '#6366f1', bg: '#eef2ff' },
          { label: 'You\'re Eligible', value: eligibleJobs, icon: 'bi-check-circle',   color: '#10b981', bg: '#d1fae5' },
          { label: 'Avg Match Score', value: `${avgScore}%`, icon: 'bi-lightning-charge', color: '#f59e0b', bg: '#fef3c7' },
          { label: '100% Matches',   value: perfectMatch, icon: 'bi-trophy',            color: '#8b5cf6', bg: '#ede9fe' },
        ].map((s, i) => (
          <div className="col-6 col-md-3" key={i}>
            <div className="card border-0 h-100" style={{ borderRadius: 16 }}>
              <div className="card-body p-3 d-flex align-items-center gap-3">
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: s.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: '1.2rem' }}></i>
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Toggle ── */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          onClick={() => setFilterEligible(f => !f)}
          className={`btn btn-sm d-flex align-items-center gap-2 ${filterEligible ? 'btn-success' : 'btn-outline-secondary'}`}
          style={{ borderRadius: 20, fontWeight: 600, fontSize: '0.8125rem' }}>
          <i className={`bi ${filterEligible ? 'bi-funnel-fill' : 'bi-funnel'}`}></i>
          {filterEligible ? 'Showing eligible only' : 'Show eligible only'}
        </button>
        <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
          {displayed.length} job{displayed.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Empty State ── */}
      {displayed.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-briefcase" style={{ fontSize: '3rem', color: '#cbd5e1' }}></i>
          <h6 className="mt-3" style={{ color: '#64748b' }}>No jobs found</h6>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            {filterEligible
              ? 'You are not eligible for any open jobs right now. Update your profile to improve eligibility.'
              : 'No open jobs at the moment. Check back later.'}
          </p>
        </div>
      )}

      {/* ── Job Cards ── */}
      <div className="d-flex flex-column gap-3">
        {displayed.map(job => {
          const isOpen = expanded === job.jobId;
          const state  = applyState[job.jobId];

          return (
            <div key={job.jobId} className="card border-0"
              style={{ borderRadius: 20, overflow: 'hidden',
                border: job.eligible ? '1px solid #a7f3d0' : '1px solid #e2e8f0' }}>

              {/* ── Card Header ── */}
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                      <EligibilityPill eligible={job.eligible} reasons={job.eligibilityReasons} />
                      <ScoreBadge score={job.matchScore} />
                    </div>
                    <h5 style={{ fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>{job.jobTitle}</h5>
                    <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                      <i className="bi bi-building me-1"></i>{job.companyName}
                      {job.location && <><span className="mx-2">·</span><i className="bi bi-geo-alt me-1"></i>{job.location}</>}
                      {job.employmentType && <><span className="mx-2">·</span><i className="bi bi-clock me-1"></i>{job.employmentType}</>}
                      {job.applicationDeadline && <><span className="mx-2">·</span><i className="bi bi-calendar-event me-1"></i>Deadline: {job.applicationDeadline}</>}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="d-flex gap-2 align-items-center">
                    <button
                      onClick={() => setExpanded(isOpen ? null : job.jobId)}
                      className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                      style={{ borderRadius: 10, fontSize: '0.8rem', fontWeight: 600 }}>
                      {isOpen ? <><i className="bi bi-chevron-up"></i> Less</> : <><i className="bi bi-chevron-down"></i> Details</>}
                    </button>

                    {state === 'done' ? (
                      <span style={{ color: '#065f46', fontWeight: 700, fontSize: '0.8rem',
                        background: '#d1fae5', borderRadius: 10, padding: '0.3em 0.8em',
                        display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <i className="bi bi-check-circle-fill"></i> Applied
                      </span>
                    ) : state === 'duplicate' ? (
                      <span style={{ color: '#92400e', fontWeight: 600, fontSize: '0.8rem',
                        background: '#fef3c7', borderRadius: 10, padding: '0.3em 0.8em' }}>
                        Already applied
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApply(job.jobId)}
                        disabled={state === 'loading' || !job.eligible}
                        className="btn btn-sm d-flex align-items-center gap-2"
                        title={!job.eligible ? 'You are not eligible for this job' : ''}
                        style={{
                          background: job.eligible ? 'linear-gradient(135deg,#6366f1,#4f46e5)' : '#e2e8f0',
                          color: job.eligible ? 'white' : '#94a3b8',
                          border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.8rem',
                        }}>
                        {state === 'loading'
                          ? <><span className="spinner-border spinner-border-sm"></span> Applying…</>
                          : <><i className="bi bi-send-fill"></i> Apply</>}
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Match Score Bar ── */}
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Skill Match</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: job.matchScore >= 80 ? '#10b981' : job.matchScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                      {job.matchScore}%
                    </span>
                  </div>
                  <div style={{ height: 6, borderRadius: 99, background: '#f1f5f9' }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      width: `${job.matchScore}%`,
                      background: job.matchScore >= 80
                        ? 'linear-gradient(90deg,#10b981,#059669)'
                        : job.matchScore >= 50
                          ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                          : 'linear-gradient(90deg,#ef4444,#dc2626)',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              </div>

              {/* ── Expanded Detail Panel ── */}
              {isOpen && (
                <div style={{ borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
                  <div className="p-4">
                    <div className="row g-4">

                      {/* Required Skills */}
                      {job.requiredSkills?.length > 0 && (
                        <div className="col-12 col-md-6">
                          <h6 style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a', marginBottom: '0.75rem' }}>
                            <i className="bi bi-code-slash me-2" style={{ color: '#6366f1' }}></i>Required Skills
                          </h6>
                          <div className="d-flex flex-wrap gap-2">
                            {job.requiredSkills.map((s, i) => {
                              const matched = job.matchedSkills?.includes(s);
                              return <SkillChip key={i} name={s} matched={matched} />;
                            })}
                          </div>
                        </div>
                      )}

                      {/* Missing Skills + Recommendations */}
                      {job.missingSkills?.length > 0 && (
                        <div className="col-12 col-md-6">
                          <h6 style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a', marginBottom: '0.75rem' }}>
                            <i className="bi bi-exclamation-triangle-fill me-2" style={{ color: '#f59e0b' }}></i>
                            Missing Skills & Recommendations
                          </h6>
                          <div className="d-flex flex-column gap-2">
                            {job.recommendations?.map((rec, i) => (
                              <div key={i} style={{
                                background: '#fff7ed', border: '1px solid #fed7aa',
                                borderRadius: 10, padding: '0.6rem 0.875rem',
                                fontSize: '0.8rem', color: '#92400e',
                              }}>
                                <i className="bi bi-lightbulb-fill me-2" style={{ color: '#f59e0b' }}></i>
                                {rec}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Eligibility Reasons */}
                      {!job.eligible && job.eligibilityReasons?.length > 0 && (
                        <div className="col-12">
                          <h6 style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a', marginBottom: '0.75rem' }}>
                            <i className="bi bi-shield-exclamation me-2" style={{ color: '#ef4444' }}></i>
                            Why You're Not Eligible
                          </h6>
                          <div className="d-flex flex-column gap-2">
                            {job.eligibilityReasons.map((r, i) => (
                              <div key={i} style={{
                                background: '#fff1f2', border: '1px solid #fecdd3',
                                borderRadius: 10, padding: '0.6rem 0.875rem',
                                fontSize: '0.8rem', color: '#be123c',
                              }}>
                                <i className="bi bi-x-circle-fill me-2"></i>{r}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Perfect match message */}
                      {job.matchScore === 100 && job.missingSkills?.length === 0 && (
                        <div className="col-12">
                          <div style={{
                            background: '#d1fae5', border: '1px solid #a7f3d0',
                            borderRadius: 12, padding: '0.875rem 1.25rem',
                            fontSize: '0.875rem', color: '#065f46', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: 8,
                          }}>
                            <i className="bi bi-trophy-fill" style={{ color: '#10b981', fontSize: '1.1rem' }}></i>
                            You have all the required skills for this role. Great match!
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
