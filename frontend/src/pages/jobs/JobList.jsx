import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchJobPostings, deleteJobPosting, fetchUserByUsername, createJobApplication, linkStudentProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import Toolbar from '../../components/common/Toolbar';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const isStudent = user?.roles?.includes('ROLE_STUDENT');
  const [studentId, setStudentId] = useState(null);
  
  // Filtering & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, jobId: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const [applyState, setApplyState] = useState({}); // { [jobId]: 'loading'|'done'|'error'|'duplicate' }
  const [applyStateError, setApplyStateError] = useState({});

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await fetchJobPostings();
      setJobs(data);
      if (isStudent && user?.username) {
        const u = await fetchUserByUsername(user.username).catch(() => null);
        let sid = null;
        if (u?.student?.id) {
          sid = u.student.id;
        } else {
          try {
            const linked = await linkStudentProfile();
            if (linked?.student?.id) sid = linked.student.id;
          } catch (e) {
            console.warn('Could not auto-link student profile:', e.message);
          }
        }
        
        if (sid) {
          setStudentId(sid);
          try {
            const { fetchJobApplicationsByStudentId } = await import('../../services/api');
            const myApps = await fetchJobApplicationsByStudentId(sid).catch(() => []);
            const initialApplyState = {};
            myApps.forEach(app => {
              if (app.jobPosting && app.jobPosting.id) {
                initialApplyState[app.jobPosting.id] = 'done';
              }
            });
            setApplyState(s => ({ ...s, ...initialApplyState }));
          } catch (err) {
            console.warn("Could not fetch user's applications", err);
          }
        }
      }
    } catch (err) {
      setError('Failed to load job postings from server.');
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering and searching
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const searchStr = `${job.title || ''} ${job.company?.name || ''}`.toLowerCase();
      const matchesSearch = !searchQuery || searchStr.includes(searchQuery.toLowerCase());
        
      const matchesStatus = !filterStatus || job.status === filterStatus;
      const matchesType = !filterType || job.employmentType === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [jobs, searchQuery, filterStatus, filterType]);

  // Client-side pagination
  const totalItems = filteredJobs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredJobs.slice(start, start + itemsPerPage);
  }, [filteredJobs, currentPage]);

  const confirmDelete = (id) => setDeleteModal({ isOpen: true, jobId: id });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteJobPosting(deleteModal.jobId);
      setJobs(jobs.filter(j => j.id !== deleteModal.jobId));
      setDeleteModal({ isOpen: false, jobId: null });
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApply = async (jobId) => {
    if (!studentId) {
      setApplyState(s => ({ ...s, [jobId]: 'no-profile' }));
      setTimeout(() => setApplyState(s => ({ ...s, [jobId]: null })), 4000);
      return;
    }
    setApplyState(s => ({ ...s, [jobId]: 'loading' }));
    try {
      await createJobApplication({
        jobPosting: { id: jobId },
        student: { id: studentId },
        status: 'APPLIED',
        appliedOn: new Date().toISOString().split('T')[0]
      });
      setApplyState(s => ({ ...s, [jobId]: 'done' }));
    } catch (err) {
      const isDuplicate = err.message?.toLowerCase().includes('already') || err.message?.includes('409');
      setApplyState(s => ({ ...s, [jobId]: isDuplicate ? 'duplicate' : 'error' }));
      setApplyStateError(s => ({ ...s, [jobId]: err.message }));
      setTimeout(() => setApplyState(s => ({ ...s, [jobId]: null })), 4000);
    }
  };

  const columns = [
    { 
      header: 'Position', 
      field: 'title',
      render: (row) => (
        <div>
          <div className="fw-medium text-dark">{row.title}</div>
          <div className="text-muted" style={{fontSize: '0.8125rem'}}>{row.employmentType || 'Full-time'} · {row.location || 'Remote'}</div>
        </div>
      )
    },
    { 
      header: 'Company', 
      field: 'company',
      render: (row) => <span className="fw-medium text-dark">{row.company ? row.company.name : 'Unknown'}</span>
    },
    { 
      header: 'Eligibility', 
      field: 'eligibility',
      render: (row) => (
        <div>
          <div className="text-dark">{row.eligibleBatch || 'All Batches'}</div>
          <div className="text-muted" style={{fontSize: '0.8125rem'}}>{row.eligibleBranches || 'All Branches'}</div>
        </div>
      )
    },
    { 
      header: 'Deadline', 
      field: 'deadline',
      render: (row) => row.applicationDeadline ? (
        <span className="text-muted d-flex align-items-center gap-2">
          <i className="bi bi-calendar-event"></i> {row.applicationDeadline}
        </span>
      ) : '—'
    },
    { 
      header: 'Status', 
      field: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      className: 'text-end',
      tdClassName: 'text-end',
      render: (row) => isStudent ? (() => {
        const state = applyState[row.id];
        if (state === 'done') {
          return (
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, color:'#065f46', fontWeight:700, fontSize:'0.8rem', background:'#d1fae5', borderRadius:20, padding:'0.3em 0.8em' }}>
              <i className="bi bi-check-circle-fill"></i> Applied!
            </span>
          );
        }
        if (state === 'duplicate') {
          return (
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, color:'#92400e', fontWeight:600, fontSize:'0.8rem', background:'#fef3c7', borderRadius:20, padding:'0.3em 0.8em' }}>
              <i className="bi bi-info-circle-fill"></i> Already applied
            </span>
          );
        }
        if (state === 'error') {
          return (
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, color:'#be123c', fontWeight:600, fontSize:'0.8rem', background:'#ffe4e6', borderRadius:20, padding:'0.3em 0.8em' }} title={applyStateError[row.id]}>
              <i className="bi bi-x-circle-fill"></i> Failed (Hover for reason)
            </span>
          );
        }
        if (state === 'no-profile') {
          return (
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, color:'#be123c', fontWeight:600, fontSize:'0.8rem', background:'#ffe4e6', borderRadius:20, padding:'0.3em 0.8em' }}>
              <i className="bi bi-exclamation-circle-fill"></i> Profile not linked
            </span>
          );
        }
        return (
          <button
            className="btn btn-sm btn-primary fw-semibold d-flex align-items-center gap-2"
            style={{ borderRadius: 8, fontSize:'0.8125rem' }}
            disabled={state === 'loading'}
            onClick={() => handleApply(row.id)}
          >
            {state === 'loading'
              ? <><span className="spinner-border spinner-border-sm"></span> Applying…</>
              : <><i className="bi bi-send-fill"></i> Apply</>
            }
          </button>
        );
      })() : (
        <div className="dropdown">
          <button className="btn btn-light btn-sm rounded-circle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{width: '32px', height: '32px'}}>
            <i className="bi bi-three-dots-vertical"></i>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow border-0" style={{ borderRadius: 'var(--radius-md)' }}>
            <li><Link className="dropdown-item d-flex align-items-center gap-2" to={`/jobs/${row.id}/edit`}><i className="bi bi-pencil text-secondary"></i> Edit Job</Link></li>
            <li><hr className="dropdown-divider" /></li>
            <li><button className="dropdown-item d-flex align-items-center gap-2 text-danger" onClick={() => confirmDelete(row.id)}><i className="bi bi-trash"></i> Delete</button></li>
          </ul>
        </div>
      )
    }
  ];

  const filters = [
    { 
      label: 'Status', 
      options: [
        {value: '', label: 'All Statuses'},
        {value: 'OPEN', label: 'Open'}, 
        {value: 'CLOSED', label: 'Closed'}
      ], 
      onChange: (e) => setFilterStatus(e.target.value) 
    },
    { 
      label: 'Type', 
      options: [
        {value: '', label: 'All Types'},
        {value: 'Full-time', label: 'Full-time'}, 
        {value: 'Internship', label: 'Internship'},
        {value: 'Contract', label: 'Contract'}
      ], 
      onChange: (e) => setFilterType(e.target.value) 
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Job Postings" 
        subtitle="Track campus roles published by your hiring partners."
        primaryAction={!isStudent ? { label: "Post a Job", icon: "bi-plus-lg", onClick: () => navigate('/jobs/new') } : undefined}
      />
      
      <Toolbar 
        searchPlaceholder="Search job title or company..."
        onSearch={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        filters={filters}
      />

      <DataTable 
        columns={columns}
        data={paginatedJobs}
        loading={loading}
        error={error}
        emptyStateIcon="bi-briefcase"
        emptyStateTitle={searchQuery || filterStatus || filterType ? "No matching jobs" : "No job postings available"}
        emptyStateMessage={searchQuery || filterStatus || filterType ? "Try adjusting your search or filters." : "Add a job posting to get started."}
        emptyStateAction={(!searchQuery && !filterStatus && !filterType && !isStudent) ? { label: "Post a Job", onClick: () => navigate('/jobs/new') } : null}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
          onPageChange: setCurrentPage
        }}
      />

      <ConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, jobId: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Job Posting"
        message="Are you sure you want to delete this job posting? Applications may be affected."
        confirmText="Delete"
      />
    </div>
  );
}
