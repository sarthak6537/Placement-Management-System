import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import {
  fetchJobApplications, fetchInterviews,
  fetchJobPostings, fetchPlacements, fetchStudents,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function isToday(dt) {
  if (!dt) return false;
  const d = new Date(dt), t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

const APP_STATUSES = ['APPLIED','SHORTLISTED','INTERVIEW','SELECTED','REJECTED'];
const APP_COLORS = {
  APPLIED:     { bg:'#eef2ff', color:'#4338ca', bar:'#6366f1' },
  SHORTLISTED: { bg:'#cffafe', color:'#155e75', bar:'#06b6d4' },
  INTERVIEW:   { bg:'#fef3c7', color:'#92400e', bar:'#f59e0b' },
  SELECTED:    { bg:'#d1fae5', color:'#065f46', bar:'#10b981' },
  REJECTED:    { bg:'#ffe4e6', color:'#be123c', bar:'#f43f5e' },
};

export default function PlacementOfficerDashboard({ isAdmin = false }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [apps, ints, jobsData, placesData, stuData] = await Promise.all([
          fetchJobApplications().catch(() => []),
          fetchInterviews().catch(() => []),
          fetchJobPostings().catch(() => []),
          fetchPlacements().catch(() => []),
          fetchStudents().catch(() => []),
        ]);
        setApplications(apps); setInterviews(ints); setJobs(jobsData);
        setPlacements(placesData); setStudents(stuData);
      } finally { setLoading(false); }
    })();
  }, []);

  const totalApps = applications.length;
  const activeJobs = jobs.filter(j => j.status === 'OPEN').length;
  const studentsPlaced = placements.reduce((a, p) => a + (p.students?.length || 0), 0);
  const todayInts = interviews.filter(i => isToday(i.scheduledAt));

  const recentApps = [...applications].reverse().slice(0, 6);

  const companyJobCounts = {};
  jobs.forEach(j => { const n = j.company?.name; if (n) companyJobCounts[n] = (companyJobCounts[n]||0)+1; });
  const topCompanies = Object.entries(companyJobCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);

  // Pipeline donut data
  const pipeline = APP_STATUSES.map(s => ({
    label: s, count: applications.filter(a=>a.status===s).length, ...APP_COLORS[s]
  }));

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div>
      {/* Hero Header */}
      <div className="card border-0 mb-4 position-relative overflow-hidden" style={{
        background:'linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#6d28d9 100%)',
        borderRadius:20, padding:'2rem 2.5rem',
      }}>
        {/* Decorative blobs */}
        <div style={{ position:'absolute',top:-40,right:-40,width:220,height:220,borderRadius:'50%',background:'rgba(255,255,255,0.06)',pointerEvents:'none' }}/>
        <div style={{ position:'absolute',bottom:-30,right:80,width:140,height:140,borderRadius:'50%',background:'rgba(255,255,255,0.04)',pointerEvents:'none' }}/>
        <div style={{ position:'absolute',top:20,right:200,width:80,height:80,borderRadius:'50%',background:'rgba(255,255,255,0.05)',pointerEvents:'none' }}/>

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 position-relative">
          <div>
            <p style={{ color:'rgba(199,210,254,0.8)', fontSize:'0.85rem', fontWeight:600, marginBottom:4, letterSpacing:'0.04em' }}>
              {greeting()}, {user?.username} 👋
            </p>
           <h2 style={{ color:'white', fontWeight:800, fontSize:'1.75rem', letterSpacing:'-0.04em', marginBottom:8 }}>
             {isAdmin ? 'PlacementHub Admin Panel' : 'PlacementHub Officer Dashboard'}
           </h2>
            <p style={{ color:'rgba(199,210,254,0.7)', fontSize:'0.875rem', marginBottom:0 }}>
              {isAdmin
                ? 'Manage users, monitor placement activities, and oversee campus recruitment.'
                : 'Track applications, upcoming interviews, and placement progress in one place.'}
            </p>
          </div>
          <div className="d-flex gap-2 flex-shrink-0">
            <Link to="/interviews" className="btn text-white d-flex align-items-center gap-2"
              style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:12, fontWeight:600, fontSize:'0.875rem', backdropFilter:'blur(8px)' }}>
             <i className="bi bi-calendar-plus"></i> Manage Interviews
            </Link>
            <Link to="/jobs/new" className="btn d-flex align-items-center gap-2"
              style={{ background:'white', color:'#4f46e5', border:'none', borderRadius:12, fontWeight:700, fontSize:'0.875rem', boxShadow:'0 4px 14px rgba(0,0,0,0.15)' }}>
              <i className="bi bi-plus-lg"></i> Create Job Posting
            </Link>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        {[
          { title:'Total Applications', value:loading?'…':totalApps,   icon:'bi-file-earmark-text-fill', cls:'stat-card-indigo',  link:'/applications' },
          { title:'Active Job Postings', value:loading?'…':activeJobs, icon:'bi-briefcase-fill',          cls:'stat-card-cyan',    link:'/jobs' },
          { title:'Students Placed',    value:loading?'…':studentsPlaced,icon:'bi-award-fill',            cls:'stat-card-emerald', link:'/placements' },
          { title:"Today's Interviews", value:loading?'…':todayInts.length,icon:'bi-calendar-event-fill',cls:'stat-card-amber',   link:'/interviews' },
          ...(isAdmin ? [{ title:'Total Students', value:loading?'…':students.length, icon:'bi-people-fill', cls:'stat-card-violet', link:'/students' }] : []),
        ].map((s,i) => (
          <div key={i} className={`col-6 ${isAdmin ? 'col-xl-20pct' : 'col-xl-3'}`}>
            <Link to={s.link} style={{ textDecoration:'none' }}>
              <StatCard title={s.title} value={s.value} icon={s.icon} colorClass={s.cls} />
            </Link>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Left col */}
        <div className="col-12 col-xl-8 d-flex flex-column gap-4">

          {/* Recent Applications */}
          <div className="card border-0" style={{ borderRadius:20 }}>
            <div className="card-body p-0">
              <div className="d-flex justify-content-between align-items-center px-4 pt-4 pb-3"
                style={{ borderBottom:'1px solid #f1f5f9' }}>
                <div>
                  <h5 style={{ fontWeight:700, fontSize:'1rem', color:'#0f172a', marginBottom:2 }}>
                    Latest Placement Applications
                  </h5>
                  <p style={{ fontSize:'0.8rem', color:'#94a3b8', marginBottom:0 }}>
                    Monitor the latest applications submitted by students
                  </p>
                </div>
                <Link to="/applications" style={{ fontSize:'0.8125rem', fontWeight:600, color:'#6366f1', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                  View all <i className="bi bi-arrow-right"></i>
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-5 text-muted">Loading…</div>
              ) : recentApps.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-file-earmark-x fs-1 d-block mb-2 text-muted"></i>
                  <span className="text-muted">No applications yet</span>
                </div>
              ) : (
                <table className="table table-hover mb-0">
                  <thead>
                    <tr style={{ background:'#fafbff' }}>
                      <th style={{ padding:'0.75rem 1.25rem' }}>Student</th>
                      <th>Job</th>
                      <th>Company</th>
                      <th>Applied</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApps.map(app => {
                      const init = app.student ? `${app.student.firstName?.[0]||''}${app.student.lastName?.[0]||''}`.toUpperCase() : '?';
                      const name = app.student ? `${app.student.firstName} ${app.student.lastName}` : 'Unknown';
                      return (
                        <tr key={app.id}>
                          <td style={{ padding:'0.875rem 1.25rem' }}>
                            <div className="d-flex align-items-center gap-3">
                              <div style={{ width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:'0.78rem',flexShrink:0 }}>
                                {init}
                              </div>
                              <span style={{ fontWeight:600, color:'#0f172a', fontSize:'0.875rem' }}>{name}</span>
                            </div>
                          </td>
                          <td style={{ fontSize:'0.875rem', color:'#475569' }}>{app.jobPosting?.title||'—'}</td>
                          <td style={{ fontSize:'0.875rem', color:'#475569' }}>{app.jobPosting?.company?.name||'—'}</td>
                          <td style={{ fontSize:'0.8rem', color:'#94a3b8' }}>{app.appliedOn||'—'}</td>
                          <td><StatusBadge status={app.status} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Today's Interviews */}
          <div className="card border-0" style={{ borderRadius:20 }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 style={{ fontWeight:700, fontSize:'1rem', color:'#0f172a', marginBottom:2 }}>
                    Interview Schedule
                  </h5>
                  <p style={{ fontSize:'0.8rem', color:'#94a3b8', marginBottom:0 }}>
                    Today's scheduled interviews · {new Date().toLocaleDateString('en-IN',{dateStyle:'medium'})}
                  </p>
                </div>
                <Link to="/interviews" style={{ fontSize:'0.8125rem', fontWeight:600, color:'#6366f1', textDecoration:'none' }}>View all</Link>
              </div>
              {loading ? <p className="text-muted">Loading…</p> :
               todayInts.length === 0 ? (
                <div className="text-center py-4">
                  <div style={{ width:52,height:52,borderRadius:'50%',background:'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 0.75rem' }}>
                    <i className="bi bi-calendar-x" style={{ fontSize:'1.5rem',color:'#94a3b8' }}></i>
                  </div>
                  <p style={{ color:'#94a3b8', fontSize:'0.875rem', marginBottom:0 }}>No interviews today</p>
                </div>
               ) : (
                <div className="d-flex flex-column gap-3">
                  {todayInts.map(iv => (
                    <div key={iv.id} className="d-flex align-items-center gap-3 p-3 rounded-3"
                      style={{ background:'#fafbff', border:'1px solid #e2e8f0' }}>
                      <div style={{ textAlign:'center', minWidth:72, paddingRight:12, borderRight:'2px solid #e2e8f0' }}>
                        <div style={{ fontWeight:700, color:'#0f172a', fontSize:'0.875rem' }}>
                          {iv.scheduledAt ? new Date(iv.scheduledAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : '—'}
                        </div>
                        <div style={{ fontSize:'0.72rem', color:'#94a3b8' }}>Today</div>
                      </div>
                      <div className="flex-grow-1">
                        <div style={{ fontWeight:600, color:'#0f172a', fontSize:'0.875rem' }}>
                          {iv.jobPosting?.company?.name||'—'} · {iv.roundName||'Interview'}
                        </div>
                        <div style={{ fontSize:'0.78rem', color:'#94a3b8', display:'flex', gap:8, marginTop:2 }}>
                          <span><i className="bi bi-geo-alt me-1"></i>{iv.mode||'TBD'}</span>
                          {iv.venue && <span>· {iv.venue}</span>}
                        </div>
                      </div>
                      <StatusBadge status={iv.status||'SCHEDULED'} />
                    </div>
                  ))}
                </div>
               )}
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="col-12 col-xl-4 d-flex flex-column gap-4">
          {/* Application Pipeline */}
          <div className="card border-0" style={{ borderRadius:20 }}>
            <div className="card-body p-4">
              <h5 style={{ fontWeight:700, fontSize:'1rem', color:'#0f172a', marginBottom:4 }}>Placement Progress Overview</h5>
              <p style={{ fontSize:'0.8rem', color:'#94a3b8', marginBottom:'1.25rem' }}>Track student applications across each recruitment stage    </p>
              <div className="d-flex flex-column gap-3">
                {pipeline.map(p => (
                  <div key={p.label}>
                    <div className="d-flex justify-content-between mb-1">
                      <span style={{ fontSize:'0.8rem', fontWeight:600, color:'#475569' }}>
                        {p.label.charAt(0)+p.label.slice(1).toLowerCase()}
                      </span>
                      <span style={{ fontSize:'0.8rem', fontWeight:700, color:'#0f172a' }}>{p.count}</span>
                    </div>
                    <div style={{ height:6, borderRadius:99, background:'#f1f5f9', overflow:'hidden' }}>
                      <div style={{
                        height:'100%', borderRadius:99,
                        background: p.bar,
                        width: totalApps > 0 ? `${(p.count/totalApps)*100}%` : '0%',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Recruiters */}
          <div className="card border-0" style={{ borderRadius:20 }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 style={{ fontWeight:700, fontSize:'1rem', color:'#0f172a', marginBottom:0 }}>Recruitment Partners</h5>
                <Link to="/companies" style={{ fontSize:'0.8125rem', fontWeight:600, color:'#6366f1', textDecoration:'none' }}>View all</Link>
              </div>
              {loading ? <p className="text-muted">Loading…</p> :
               topCompanies.length === 0 ? <p style={{ color:'#94a3b8', fontSize:'0.875rem' }}>
                                             No recruitment partners available yet
                                           </p> : (
                <div className="d-flex flex-column gap-3">
                  {topCompanies.map(([name, count], i) => {
                    const colors = ['#6366f1','#06b6d4','#10b981','#f59e0b','#f43f5e'];
                    const c = colors[i % colors.length];
                    return (
                      <div key={name} className="d-flex align-items-center gap-3">
                        <div style={{ width:36,height:36,borderRadius:10,background:`${c}18`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'0.875rem',color:c,flexShrink:0 }}>
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-grow-1">
                          <div style={{ fontWeight:600, color:'#0f172a', fontSize:'0.875rem' }}>{name}</div>
                          <div style={{ height:4, borderRadius:99, background:'#f1f5f9', marginTop:4 }}>
                            <div style={{ height:'100%', borderRadius:99, background:c, width:`${Math.min((count/activeJobs)*100||30,100)}%`, transition:'width 0.5s ease' }} />
                          </div>
                        </div>
                        <span style={{ fontSize:'0.78rem', fontWeight:700, color:c, flexShrink:0 }}>{count} job{count>1?'s':''}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Admin Quick Actions */}
          {isAdmin && (
            <div className="card border-0" style={{ borderRadius:20, background:'linear-gradient(135deg,#0f172a,#1e1b4b)' }}>
              <div className="card-body p-4">
                <h5 style={{ fontWeight:700, fontSize:'1rem', color:'white', marginBottom:4 }}>PlacementHub Administration</h5>
                <p style={{ fontSize:'0.8rem', color:'rgba(148,163,184,0.7)', marginBottom:'1.25rem' }}>Manage platform users, colleges, students, and job postings</p>
                <div className="d-flex flex-column gap-2">
                  {[
                    { to:'/users',       icon:'bi-shield-fill-check', label:'Manage Users',    color:'#8b5cf6' },
                    { to:'/colleges',    icon:'bi-mortarboard-fill',  label:'Manage Colleges', color:'#06b6d4' },
                    { to:'/students/new', icon:'bi-person-plus-fill', label:'Register New Student', color:'#10b981' },
                    { to:'/jobs/new',    icon:'bi-briefcase-fill',    label:'Post a Job',      color:'#f59e0b' },
                  ].map(a => (
                    <Link key={a.to} to={a.to} style={{ textDecoration:'none' }}>
                      <div className="d-flex align-items-center gap-3 p-2 rounded-3"
                        style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)', transition:'background 0.2s' }}
                        onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}
                        onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                        <div style={{ width:32,height:32,borderRadius:8,background:`${a.color}20`,display:'flex',alignItems:'center',justifyContent:'center' }}>
                          <i className={`bi ${a.icon}`} style={{ color:a.color, fontSize:'0.875rem' }}></i>
                        </div>
                        <span style={{ fontSize:'0.8125rem', fontWeight:600, color:'#e2e8f0' }}>{a.label}</span>
                        <i className="bi bi-arrow-right ms-auto" style={{ color:'rgba(148,163,184,0.5)', fontSize:'0.75rem' }}></i>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
