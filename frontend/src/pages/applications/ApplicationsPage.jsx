import React, { useState, useEffect, useMemo } from 'react';
import { fetchJobApplications, fetchJobPostings, updateJobApplication } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Toolbar from '../../components/common/Toolbar';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';

const APPLICATION_STATUSES = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'];

const STATUS_BADGE_MAP = {
  APPLIED: 'primary',
  SHORTLISTED: 'info',
  INTERVIEW: 'warning',
  SELECTED: 'success',
  REJECTED: 'danger',
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterJobId, setFilterJobId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [apps, jobsData] = await Promise.all([
        fetchJobApplications().catch(() => []),
        fetchJobPostings().catch(() => []),
      ]);
      setApplications(apps);
      setJobs(jobsData);
    } catch (err) {
      setError('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (app, newStatus) => {
    setUpdatingId(app.id);
    try {
      const updated = await updateJobApplication(app.id, {
        ...app,
        status: newStatus,
        student: { id: app.student?.id },
        jobPosting: { id: app.jobPosting?.id },
      });
      setApplications((prev) =>
        prev.map((a) => (a.id === updated.id ? { ...a, status: updated.status } : a))
      );
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update application status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const name = `${app.student?.firstName || ''} ${app.student?.lastName || ''}`.toLowerCase();
      const jobTitle = (app.jobPosting?.title || '').toLowerCase();
      const company = (app.jobPosting?.company?.name || '').toLowerCase();
      const matchesSearch =
        !searchQuery ||
        name.includes(searchQuery.toLowerCase()) ||
        jobTitle.includes(searchQuery.toLowerCase()) ||
        company.includes(searchQuery.toLowerCase());

      const matchesStatus = !filterStatus || app.status === filterStatus;
      const matchesJob = !filterJobId || String(app.jobPosting?.id) === filterJobId;

      return matchesSearch && matchesStatus && matchesJob;
    });
  }, [applications, searchQuery, filterStatus, filterJobId]);

  const totalItems = filteredApps.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const paginatedApps = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredApps.slice(start, start + itemsPerPage);
  }, [filteredApps, currentPage]);

  const columns = [
    {
      header: 'Student',
      render: (row) => {
        const initial = row.student
          ? `${row.student.firstName?.[0] || ''}${row.student.lastName?.[0] || ''}`.toUpperCase()
          : '?';
        const name = row.student
          ? `${row.student.firstName} ${row.student.lastName}`
          : 'Unknown';
        return (
          <div className="d-flex align-items-center gap-3">
            <div
              className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-semibold flex-shrink-0"
              style={{ width: '34px', height: '34px', fontSize: '0.8rem' }}
            >
              {initial}
            </div>
            <div>
              <div className="fw-medium text-dark">{name}</div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>{row.student?.email || ''}</div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Job Posting',
      render: (row) => (
        <div>
          <div className="fw-medium text-dark">{row.jobPosting?.title || '—'}</div>
          <div className="text-muted" style={{ fontSize: '0.8125rem' }}>
            {row.jobPosting?.company?.name || ''}
          </div>
        </div>
      ),
    },
    {
      header: 'Applied On',
      render: (row) => (
        <span className="text-muted">{row.appliedOn || '—'}</span>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <StatusBadge status={row.status} customConfig={STATUS_BADGE_MAP} />
      ),
    },
    {
      header: 'Update Status',
      render: (row) => (
        <select
          className="form-select form-select-sm shadow-none"
          style={{ minWidth: '140px' }}
          value={row.status}
          disabled={updatingId === row.id}
          onChange={(e) => handleStatusChange(row, e.target.value)}
        >
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      ),
    },
    {
      header: 'Notes',
      render: (row) => (
        <span className="text-muted" style={{ fontSize: '0.8125rem' }}>
          {row.notes || '—'}
        </span>
      ),
    },
  ];

  const uniqueJobs = jobs.map((j) => ({ value: String(j.id), label: `${j.title} — ${j.company?.name || ''}` }));

  const filters = [
    {
      label: 'All Jobs',
      options: [{ value: '', label: 'All Jobs' }, ...uniqueJobs],
      onChange: (e) => {
        setFilterJobId(e.target.value);
        setCurrentPage(1);
      },
    },
    {
      label: 'All Statuses',
      options: [
        { value: '', label: 'All Statuses' },
        ...APPLICATION_STATUSES.map((s) => ({ value: s, label: s.charAt(0) + s.slice(1).toLowerCase() })),
      ],
      onChange: (e) => {
        setFilterStatus(e.target.value);
        setCurrentPage(1);
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Applications"
        subtitle="Review and move student applications through the hiring pipeline."
        primaryAction={{ label: 'Export', icon: 'bi-download', onClick: () => {} }}
      />

      <Toolbar
        searchPlaceholder="Search by student, job, or company..."
        onSearch={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        filters={filters}
      />

      <DataTable
        columns={columns}
        data={paginatedApps}
        loading={loading}
        error={error}
        emptyStateIcon="bi-file-earmark-text"
        emptyStateTitle="No applications found"
        emptyStateMessage={
          searchQuery || filterStatus || filterJobId
            ? 'Try adjusting your search or filters.'
            : 'No applications have been submitted yet.'
        }
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
          onPageChange: setCurrentPage,
        }}
      />
    </div>
  );
}
