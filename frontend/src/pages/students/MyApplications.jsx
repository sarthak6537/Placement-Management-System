import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchUserByUsername, fetchJobApplicationsByStudentId, fetchInterviews, linkStudentProfile } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

export default function MyApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        let userObj = await fetchUserByUsername(user.username).catch(() => null);

        // Auto-heal legacy accounts with no linked Student
        if (!userObj?.student?.id) {
          try { userObj = await linkStudentProfile(); } catch (e) { console.warn(e); }
        }

        if (userObj?.student?.id) {
           const studentId = userObj.student.id;
           const [myApps, allInts] = await Promise.all([
             fetchJobApplicationsByStudentId(studentId).catch(() => []),
             fetchInterviews().catch(() => [])
           ]);
           
           setApplications(myApps);

           const myJobPostingIds = myApps.map(a => a.jobPosting?.id);
           const myInts = allInts.filter(i => myJobPostingIds.includes(i.jobPosting?.id));
           setInterviews(myInts);
        }
      } catch (err) {
        console.error("Failed to load applications", err);
      } finally {
        setLoading(false);
      }
    }
    if (user?.username) {
      loadData();
    }
  }, [user]);

  return (
    <div className="d-flex flex-column gap-4">
      <PageHeader 
        title="My Applications" 
        subtitle="Track the status of your job applications and upcoming interviews."
      />

      <div className="row g-4">
        {/* Applications Column */}
        <div className="col-12 col-xl-8">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h5 className="fw-semibold mb-4 text-dark">Job Applications</h5>
              
              {loading ? (
                <div className="text-center py-4 text-muted">Loading your applications...</div>
              ) : applications.length === 0 ? (
                <div className="text-center py-5">
                  <div className="text-muted mb-3"><i className="bi bi-briefcase fs-1"></i></div>
                  <h6>No applications yet</h6>
                  <p className="text-muted">You haven't applied to any jobs.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Role</th>
                        <th>Company</th>
                        <th>Applied On</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map(app => (
                        <tr key={app.id}>
                          <td>
                            <div className="fw-medium text-dark">{app.jobPosting?.title || 'Unknown Role'}</div>
                          </td>
                          <td className="text-muted">{app.jobPosting?.company?.name || 'Unknown'}</td>
                          <td className="text-muted">{app.appliedOn || '—'}</td>
                          <td><StatusBadge status={app.status || 'APPLIED'} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interviews Column */}
        <div className="col-12 col-xl-4">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h5 className="fw-semibold mb-4 text-dark">Upcoming Interviews</h5>
              
              {loading ? (
                <div className="text-center py-4 text-muted">Loading interviews...</div>
              ) : interviews.length === 0 ? (
                <div className="text-center py-5">
                  <div className="text-muted mb-3"><i className="bi bi-calendar-x fs-1"></i></div>
                  <h6>No interviews scheduled</h6>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {interviews.map(interview => {
                    let dateStr = '—';
                    let timeStr = '—';
                    if (interview.scheduledAt) {
                      if (Array.isArray(interview.scheduledAt)) {
                        const [y, m, d, h, min] = interview.scheduledAt;
                        dateStr = `${y}-${m.toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`;
                        timeStr = `${h.toString().padStart(2,'0')}:${(min||0).toString().padStart(2,'0')}`;
                      } else if (typeof interview.scheduledAt === 'string') {
                        const parts = interview.scheduledAt.split('T');
                        dateStr = parts[0];
                        timeStr = parts[1] ? parts[1].substring(0,5) : '—';
                      }
                    }
                    return (
                    <div key={interview.id} className="list-group-item px-0 py-3 border-light">
                      <h6 className="fw-medium mb-1 text-dark">{interview.jobPosting?.title}</h6>
                      <div className="text-muted mb-2" style={{fontSize: '0.875rem'}}>{interview.jobPosting?.company?.name}</div>
                      
                      <div className="d-flex align-items-center gap-3 mt-2" style={{fontSize: '0.8125rem'}}>
                        <span className="badge bg-light text-dark border">
                          <i className="bi bi-calendar me-1"></i> {dateStr}
                        </span>
                        <span className="badge bg-light text-dark border">
                          <i className="bi bi-clock me-1"></i> {timeStr}
                        </span>
                      </div>
                      
                      {interview.mode && (
                        <div className="mt-2 text-primary" style={{fontSize: '0.8125rem'}}>
                          <i className={`bi ${interview.mode.toLowerCase() === 'online' ? 'bi-laptop' : 'bi-building'} me-1`}></i> 
                          {interview.mode}
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
