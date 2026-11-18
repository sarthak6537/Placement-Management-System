import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { fetchJobPostings, fetchUserByUsername, fetchJobApplications, fetchInterviews } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [myInterviews, setMyInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const jobsData = await fetchJobPostings().catch(() => []);
        setJobs(jobsData);

        let userObj = await fetchUserByUsername(user.username).catch(() => null);
        let sid = null;
        if (userObj?.student?.id) {
          sid = userObj.student.id;
        } else {
          try {
            const { linkStudentProfile } = await import('../../services/api');
            const linked = await linkStudentProfile();
            if (linked?.student?.id) sid = linked.student.id;
          } catch (e) {
            console.warn('Could not auto-link student profile:', e.message);
          }
        }

        if (sid) {
          const { fetchJobApplicationsByStudentId } = await import('../../services/api');
          const [myAppsData, allInts] = await Promise.all([
            fetchJobApplicationsByStudentId(sid).catch(() => []),
            fetchInterviews().catch(() => [])
          ]);
          setMyApps(myAppsData);
          const jpIds = myAppsData.map(a => a.jobPosting?.id);
          setMyInterviews(allInts.filter(i => jpIds.includes(i.jobPosting?.id)));
        }
      } finally { setLoading(false); }
    })();
  }, [user]);

  const activeJobs = jobs.filter(j => j.status === 'OPEN').length;
  const recentJobs = [...jobs].reverse().slice(0, 5);

  return (
    <div>
      {/* Hero */}
      <div className="card border-0 mb-4 position-relative overflow-hidden" style={{
        background: 'linear-gradient(135deg,#0891b2 0%,#0369a1 50%,#1d4ed8 100%)',
        borderRadius: 20, padding: '2rem 2.5rem',
      }}>
        <div style={{ position:'absolute',top:-30,right:-30,width:200,height:200,borderRadius:'50%',background:'rgba(255,255,255,0.06)',pointerEvents:'none' }} />
        <div style={{ position:'absolute',bottom:-20,right:100,width:120,height:120,borderRadius:'50%',background:'rgba(255,255,255,0.04)',pointerEvents:'none' }} />
        <div className="position-relative">
          <p style={{ color:'rgba(186,230,253,0.8)',fontSize:'0.85rem',fontWeight:600,marginBottom:4 }}>
            Welcome to PlacementHub 🎓
          </p>
          <h2 style={{ color:'white',fontWeight:800,fontSize:'1.75rem',letterSpacing:'-0.04em',marginBottom:8 }}>
            {user?.username}
          </h2>
          <p style={{ color:'rgba(186,230,253,0.7)',fontSize:'0.875rem',marginBottom:0 }}>
           Explore career opportunities, manage your applications, and stay updated on your placement journey.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-xl-4">
          <Link to="/my-applications" style={{ textDecoration:'none' }}>
            <StatCard title="My Job Applications" value={loading?'…':myApps.length} icon="bi-file-earmark-text-fill" colorClass="stat-card-indigo" />
          </Link>
        </div>
        <div className="col-6 col-xl-4">
          <StatCard title="Open Opportunities" value={loading?'…':activeJobs} icon="bi-briefcase-fill" colorClass="stat-card-sky" />
        </div>
        <div className="col-6 col-xl-4">
          <StatCard title="Scheduled Interviews" value={loading?'…':myInterviews.length} icon="bi-calendar-event-fill" colorClass="stat-card-amber" />
        </div>
      </div>

      <div className="row g-4">
        {/* Latest Jobs */}
        <div className="col-12 col-xl-8">
          <div className="card border-0" style={{ borderRadius:20 }}>
            <div className="card-body p-0">
              <div className="d-flex justify-content-between align-items-center px-4 pt-4 pb-3" style={{ borderBottom:'1px solid #f1f5f9' }}>
                <div>
                  <h5 style={{ fontWeight:700,fontSize:'1rem',color:'#0f172a',marginBottom:2 }}>Recommended Career Opportunities</h5>
                  <p style={{ fontSize:'0.8rem',color:'#94a3b8',marginBottom:0 }}>Explore the latest job opportunities available to students</p>
                </div>
                <Link to="/jobs" style={{ fontSize:'0.8125rem',fontWeight:600,color:'#6366f1',textDecoration:'none',display:'flex',alignItems:'center',gap:4 }}>
                  Explore Jobs <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
              {loading ? (
                <div className="text-center py-5 text-muted">Loading…</div>
              ) : recentJobs.length === 0 ? (
                <div className="text-center py-5"><span className="text-muted">No open opportunities are available right now. Please check back soon.</span></div>
              ) : (
                <table className="table table-hover mb-0">
                  <thead>
                    <tr style={{ background:'#fafbff' }}>
                      <th style={{ padding:'0.75rem 1.25rem' }}>Role</th>
                      <th>Company</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentJobs.map(job => (
                      <tr key={job.id}>
                        <td style={{ padding:'0.875rem 1.25rem' }}>
                          <div style={{ fontWeight:600,color:'#0f172a',fontSize:'0.875rem' }}>{job.title}</div>
                          <div style={{ fontSize:'0.78rem',color:'#94a3b8' }}>{job.location||'Remote'}</div>
                        </td>
                        <td style={{ fontSize:'0.875rem',color:'#475569',fontWeight:500 }}>{job.company?.name||'—'}</td>
                        <td style={{ fontSize:'0.8rem',color:'#94a3b8' }}>{job.employmentType||'Full-time'}</td>
                        <td><StatusBadge status={job.status} /></td>
                        <td>
                          <Link to="/jobs" style={{ fontSize:'0.8rem',fontWeight:600,color:'#6366f1',textDecoration:'none' }}>Apply →</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-12 col-xl-4">
          <div className="card border-0 h-100" style={{ borderRadius:20 }}>
            <div className="card-body p-4">
              <h5 style={{ fontWeight:700,fontSize:'1rem',color:'#0f172a',marginBottom:4 }}>My Placement Activities</h5>
              <p style={{ fontSize:'0.8rem',color:'#94a3b8',marginBottom:'1.25rem' }}>Everything you need to prepare for your career</p>
              <div className="d-flex flex-column gap-2">
                {[
                  { to:'/profile',         icon:'bi-person-fill',             label:'Manage My Profile',    color:'#6366f1' },
                  { to:'/jobs',            icon:'bi-search',                  label:'Browse Jobs',          color:'#0ea5e9' },
                  { to:'/my-applications', icon:'bi-file-earmark-check-fill', label:'View Applications',    color:'#10b981' },
                  { to:'/certificates',    icon:'bi-patch-check-fill',        label:'My Certificates',      color:'#f59e0b' },
                ].map(a => (
                  <Link key={a.to} to={a.to} style={{ textDecoration:'none' }}>
                    <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{
                      border:'1.5px solid #f1f5f9',
                      transition:'all 0.2s',
                    }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=`${a.color}50`;e.currentTarget.style.background=`${a.color}08`;}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='#f1f5f9';e.currentTarget.style.background='transparent';}}>
                      <div style={{ width:38,height:38,borderRadius:10,background:`${a.color}15`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                        <i className={`bi ${a.icon}`} style={{ color:a.color,fontSize:'1rem' }}></i>
                      </div>
                      <span style={{ fontSize:'0.875rem',fontWeight:600,color:'#1e293b' }}>{a.label}</span>
                      <i className="bi bi-arrow-right ms-auto" style={{ color:'#cbd5e1',fontSize:'0.8rem' }}></i>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
