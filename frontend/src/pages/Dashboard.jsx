import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import { fetchStudents, fetchCompanies, fetchJobPostings, fetchJobApplications, fetchInterviews, fetchPlacements } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from './dashboards/StudentDashboard';
import PlacementOfficerDashboard from './dashboards/PlacementOfficerDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  
  const isStudent = user?.roles?.includes('ROLE_STUDENT');
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const isOfficer = user?.roles?.includes('ROLE_PLACEMENT_OFFICER');

  if (isStudent) return <StudentDashboard />;
  if (isAdmin) return <PlacementOfficerDashboard isAdmin={true} />;
  if (isOfficer) return <PlacementOfficerDashboard isAdmin={false} />;

  // Fallback: generic dashboard with real API data
  // State for real API data
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [studentsData, companiesData, jobsData, appsData, intsData, placesData] = await Promise.all([
          fetchStudents().catch(() => []),
          fetchCompanies().catch(() => []),
          fetchJobPostings().catch(() => []),
          fetchJobApplications().catch(() => []),
          fetchInterviews().catch(() => []),
          fetchPlacements().catch(() => []),
        ]);
        setStudents(studentsData);
        setCompanies(companiesData);
        setJobs(jobsData);
        setApplications(appsData);
        setInterviews(intsData);
        setPlacements(placesData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Calculated Metrics
  const totalStudents = students.length;
  const totalCompanies = companies.length;
  const activeJobs = jobs.filter(j => j.status === 'OPEN').length;
  const totalApplications = applications.length;
  const studentsPlaced = placements.reduce((a, p) => a + (p.students?.length || 0), 0);
  const placementPct = totalStudents > 0
    ? ((studentsPlaced / totalStudents) * 100).toFixed(1)
    : '0.0';
  
  // Top recruiting companies based on active jobs (simple grouping)
  const companyJobCounts = {};
  jobs.forEach(j => {
    if (j.company && j.company.name) {
      companyJobCounts[j.company.name] = (companyJobCounts[j.company.name] || 0) + 1;
    }
  });
  const topCompanies = Object.entries(companyJobCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Recent jobs (last 4)
  const recentJobs = [...jobs].reverse().slice(0, 4);

  return (
    <div>
      <PageHeader 
        title={`Welcome back, ${user ? user.username : 'Placement Team'}`} 
        subtitle="Here's a snapshot of your campus recruitment activity."
        primaryAction={{ label: "View schedule", icon: "bi-calendar-range" }}
      />

      {/* Primary Statistics Grid */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-4">
          <StatCard 
            title="Total Students"
            value={loading ? "..." : totalStudents}
            icon="bi-people"
            colorClass="stat-card-indigo"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-4">
          <StatCard 
            title="Total Companies"
            value={loading ? "..." : totalCompanies}
            icon="bi-building"
            colorClass="stat-card-cyan"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-4">
          <StatCard 
            title="Active Job Posts"
            value={loading ? "..." : activeJobs}
            icon="bi-briefcase"
            colorClass="stat-card-amber"
          />
        </div>
        
        {/* Mock Data Stats */}
        <div className="col-12 col-sm-6 col-xl-4">
          <StatCard 
            title="Total Applications"
            value={loading ? "..." : totalApplications}
            icon="bi-file-earmark-text"
            colorClass="stat-card-violet"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-4">
          <StatCard 
            title="Students Placed"
            value={loading ? "..." : studentsPlaced}
            icon="bi-award"
            colorClass="stat-card-emerald"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-4">
          <StatCard 
            title="Placement Percentage"
            value={loading ? "..." : `${placementPct}%`}
            icon="bi-graph-up-arrow"
            colorClass="stat-card-rose"
          />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="row g-4">
        {/* Left Column (Larger) */}
        <div className="col-12 col-xl-8 d-flex flex-column gap-4">
          
          {/* Chart */}
          <div className="card border-0">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h5 className="fw-semibold mb-1 text-dark">Placement Performance</h5>
                  <p className="text-muted mb-0" style={{fontSize: '0.875rem'}}>Monthly placement progress for 2025–26</p>
                </div>
                <select className="form-select form-select-sm w-auto shadow-none">
                  <option>2025-26 Academic Year</option>
                  <option>2024-25 Academic Year</option>
                </select>
              </div>

              <div className="d-flex align-items-center gap-4 mb-4" style={{fontSize: '0.8125rem'}}>
                <div className="d-flex align-items-center gap-2">
                  <span className="bg-primary rounded-circle" style={{width: '10px', height: '10px'}}></span>
                  <span className="text-muted">Placed</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="bg-secondary-subtle rounded-circle" style={{width: '10px', height: '10px'}}></span>
                  <span className="text-muted">Target</span>
                </div>
              </div>

              {/* Simple CSS Bar Chart with modern styling */}
              <div className="d-flex justify-content-between align-items-end border-bottom pb-2 mt-4" style={{height: '220px'}}>
                {[['Aug',45],['Sep',58],['Oct',48],['Nov',70],['Dec',61],['Jan',86],['Feb',75],['Mar',95]].map(([m,v])=>(
                  <div className="d-flex flex-column align-items-center justify-content-end h-100" style={{flex: 1}} key={m}>
                    <div className="d-flex align-items-end gap-1 w-100 justify-content-center" style={{height: '85%'}}>
                      <div className="bg-secondary-subtle rounded-top" style={{width: '12px', height: '85%', transition: 'height 0.3s ease'}}></div>
                      <div className="bg-primary rounded-top" style={{width: '12px', height: `${v}%`, transition: 'height 0.3s ease'}}></div>
                    </div>
                    <span className="text-muted mt-2" style={{fontSize: '0.75rem', fontWeight: '500'}}>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Job Postings (Real Data) */}
          <div className="card border-0">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-semibold mb-0 text-dark">Recent Job Postings</h5>
                <Link to="/jobs" className="text-decoration-none fw-medium" style={{fontSize: '0.875rem'}}>View all <i className="bi bi-arrow-right ms-1"></i></Link>
              </div>
              
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Role</th>
                      <th>Company</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="3" className="text-center py-4 text-muted">Loading...</td></tr>
                    ) : recentJobs.length === 0 ? (
                      <tr><td colSpan="3" className="text-center py-4 text-muted">No recent jobs</td></tr>
                    ) : (
                      recentJobs.map(job => (
                        <tr key={job.id}>
                          <td>
                            <div className="fw-medium text-dark">{job.title}</div>
                            <div className="text-muted" style={{fontSize: '0.8125rem'}}>{job.employmentType || 'Full-time'}</div>
                          </td>
                          <td className="text-muted">{job.company?.name || 'Unknown'}</td>
                          <td><StatusBadge status={job.status} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Applications (Real Data) */}
          <div className="card border-0">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-semibold mb-0 text-dark">Recent Applications</h5>
                <Link to="/applications" className="text-decoration-none fw-medium" style={{fontSize: '0.875rem'}}>View all <i className="bi bi-arrow-right ms-1"></i></Link>
              </div>
              
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Student</th>
                      <th>Role</th>
                      <th>Company</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="4" className="text-center py-4 text-muted">Loading...</td></tr>
                    ) : applications.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-4 text-muted">No applications yet</td></tr>
                    ) : (
                      [...applications].reverse().slice(0, 4).map(app => {
                        const name = app.student ? `${app.student.firstName} ${app.student.lastName}` : 'Unknown';
                        const init = app.student ? `${app.student.firstName?.[0] || ''}${app.student.lastName?.[0] || ''}`.toUpperCase() : '?';
                        return (
                          <tr key={app.id}>
                            <td>
                              <div className="d-flex align-items-center gap-3">
                                <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-semibold" style={{width: '32px', height: '32px', fontSize: '0.8rem'}}>
                                  {init}
                                </div>
                                <span className="fw-medium text-dark">{name}</span>
                              </div>
                            </td>
                            <td className="text-muted">{app.jobPosting?.title || '—'}</td>
                            <td className="text-muted">{app.jobPosting?.company?.name || '—'}</td>
                            <td><StatusBadge status={app.status} /></td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Smaller) */}
        <div className="col-12 col-xl-4 d-flex flex-column gap-4">
          
          {/* Upcoming Interviews (Real Data) */}
          <div className="card border-0">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-semibold mb-0 text-dark">Upcoming Interviews</h5>
                <Link to="/interviews" className="text-decoration-none fw-medium" style={{fontSize: '0.875rem'}}>View all</Link>
              </div>
              
              {loading ? (
                <div className="text-center py-4 text-muted">Loading...</div>
              ) : interviews.length === 0 ? (
                <div className="text-center py-4 text-muted">No upcoming interviews</div>
              ) : (
                <div className="list-group list-group-flush">
                  {[...interviews].slice(0, 3).map(iv => (
                    <div className="list-group-item px-0 py-3 d-flex align-items-center gap-3 border-light bg-transparent" key={iv.id}>
                      <div className="text-center pe-3 border-end border-light" style={{minWidth: '80px'}}>
                        <div className="fw-semibold text-dark" style={{fontSize: '0.9rem'}}>
                          {iv.scheduledAt ? new Date(iv.scheduledAt).toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'}) : '—'}
                        </div>
                        <small className="text-muted" style={{fontSize: '0.75rem'}}>
                          {iv.scheduledAt ? new Date(iv.scheduledAt).toLocaleDateString('en-IN', {day: 'numeric', month: 'short'}) : '—'}
                        </small>
                      </div>
                      <div className="flex-grow-1 ps-2">
                        <div className="fw-medium text-dark mb-1" style={{fontSize: '0.9rem'}}>
                          {iv.jobPosting?.company?.name || '—'} · {iv.roundName || 'Interview'}
                        </div>
                        <small className="text-muted d-flex align-items-center gap-1" style={{fontSize: '0.8rem'}}>
                          <i className="bi bi-geo-alt"></i> {iv.mode || 'TBD'}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Recruiting Companies (Real Data) */}
          <div className="card border-0">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-semibold mb-0 text-dark">Top Recruiters</h5>
                <Link to="/companies" className="text-decoration-none fw-medium" style={{fontSize: '0.875rem'}}>View all</Link>
              </div>
              
              <div className="list-group list-group-flush">
                {loading ? (
                  <div className="text-center py-4 text-muted">Loading...</div>
                ) : topCompanies.length === 0 ? (
                  <div className="text-center py-4 text-muted">No data available</div>
                ) : (
                  topCompanies.map(([name, count], idx) => (
                    <div className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center border-light bg-transparent" key={idx}>
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-light rounded d-flex align-items-center justify-content-center text-primary fw-bold" style={{width: '36px', height: '36px'}}>
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <span className="fw-medium text-dark">{name}</span>
                      </div>
                      <span className="badge bg-secondary-subtle text-secondary rounded-pill">
                        {count} {count === 1 ? 'Job' : 'Jobs'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
