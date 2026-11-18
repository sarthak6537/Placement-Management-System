import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchInterviews,
  fetchJobPostings,
  createInterviewSchedule,
  updateInterviewSchedule,
  deleteInterviewSchedule,
} from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Toolbar from '../../components/common/Toolbar';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const EMPTY_FORM = {
  jobPosting: { id: '' },
  roundName: '',
  scheduledDate: '',
  scheduledTime: '',
  mode: 'Online',
  venue: '',
  coordinator: '',
};

const STATUS_MAP = { SCHEDULED: 'info', COMPLETED: 'success', CANCELLED: 'danger' };

function formatDateTime(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ints, jobsData] = await Promise.all([
        fetchInterviews().catch(() => []),
        fetchJobPostings().catch(() => []),
      ]);
      setInterviews(ints);
      setJobs(jobsData);
    } catch {
      setError('Failed to load interview schedules.');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditId(row.id);
    const dt = row.scheduledAt ? new Date(row.scheduledAt) : null;
    setForm({
      jobPosting: { id: String(row.jobPosting?.id || '') },
      roundName: row.roundName || '',
      scheduledDate: dt ? dt.toISOString().split('T')[0] : '',
      scheduledTime: dt ? dt.toTimeString().slice(0, 5) : '',
      mode: row.mode || 'Online',
      venue: row.venue || '',
      coordinator: row.coordinator || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.jobPosting.id || !form.scheduledDate || !form.scheduledTime || !form.roundName) {
      setFormError('Job Posting, Round Name, Date and Time are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const scheduledAt = `${form.scheduledDate}T${form.scheduledTime}:00`;
      const payload = {
        jobPosting: { id: Number(form.jobPosting.id) },
        roundName: form.roundName,
        scheduledAt,
        mode: form.mode,
        venue: form.venue,
        coordinator: form.coordinator,
      };
      if (editId) {
        const updated = await updateInterviewSchedule(editId, payload);
        setInterviews((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      } else {
        const created = await createInterviewSchedule(payload);
        setInterviews((prev) => [created, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      setFormError(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id) => setDeleteModal({ isOpen: true, id });
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteInterviewSchedule(deleteModal.id);
      setInterviews((prev) => prev.filter((i) => i.id !== deleteModal.id));
      setDeleteModal({ isOpen: false, id: null });
    } catch {
      alert('Failed to delete.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    return interviews.filter((i) => {
      const searchStr = `${i.jobPosting?.company?.name || ''} ${i.roundName || ''} ${i.coordinator || ''}`.toLowerCase();
      const matchesSearch = !searchQuery || searchStr.includes(searchQuery.toLowerCase());
      const matchesStatus = !filterStatus || i.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [interviews, searchQuery, filterStatus]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(1); }, [totalPages, currentPage]);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const columns = [
    {
      header: 'Date & Time',
      render: (row) => (
        <span className="text-dark fw-medium">{formatDateTime(row.scheduledAt)}</span>
      ),
    },
    {
      header: 'Company',
      render: (row) => (
        <span className="fw-medium text-dark">{row.jobPosting?.company?.name || '—'}</span>
      ),
    },
    {
      header: 'Job',
      render: (row) => <span className="text-muted">{row.jobPosting?.title || '—'}</span>,
    },
    { header: 'Round', render: (row) => <span className="text-dark">{row.roundName || '—'}</span> },
    {
      header: 'Mode / Venue',
      render: (row) => (
        <div>
          <div className="text-dark">{row.mode || '—'}</div>
          {row.venue && <div className="text-muted" style={{ fontSize: '0.8rem' }}>{row.venue}</div>}
        </div>
      ),
    },
    {
      header: 'Coordinator',
      render: (row) => <span className="text-muted">{row.coordinator || '—'}</span>,
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} customConfig={STATUS_MAP} />,
    },
    {
      header: 'Actions',
      className: 'text-end',
      tdClassName: 'text-end',
      render: (row) => (
        <div className="dropdown">
          <button className="btn btn-light btn-sm rounded-circle p-1" type="button" data-bs-toggle="dropdown" style={{ width: '32px', height: '32px' }}>
            <i className="bi bi-three-dots-vertical"></i>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow border-0" style={{ borderRadius: 'var(--radius-md)' }}>
            <li>
              <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => openEdit(row)}>
                <i className="bi bi-pencil text-secondary"></i> Edit
              </button>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button className="dropdown-item d-flex align-items-center gap-2 text-danger" onClick={() => confirmDelete(row.id)}>
                <i className="bi bi-trash"></i> Delete
              </button>
            </li>
          </ul>
        </div>
      ),
    },
  ];

  const filters = [
    {
      label: 'All Statuses',
      options: [
        { value: '', label: 'All Statuses' },
        { value: 'SCHEDULED', label: 'Scheduled' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CANCELLED', label: 'Cancelled' },
      ],
      onChange: (e) => { setFilterStatus(e.target.value); setCurrentPage(1); },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Interview Schedules"
        subtitle="Coordinate upcoming assessments and interview rounds."
        primaryAction={{ label: 'Schedule Interview', icon: 'bi-plus-lg', onClick: openAdd }}
      />

      <Toolbar
        searchPlaceholder="Search by company, round, or coordinator..."
        onSearch={(val) => { setSearchQuery(val); setCurrentPage(1); }}
        filters={filters}
      />

      <DataTable
        columns={columns}
        data={paginated}
        loading={loading}
        error={error}
        emptyStateIcon="bi-calendar-event"
        emptyStateTitle="No interviews scheduled"
        emptyStateMessage={searchQuery || filterStatus ? 'Try adjusting your filters.' : 'Schedule a new interview to get started.'}
        emptyStateAction={!searchQuery && !filterStatus ? { label: 'Schedule Interview', onClick: openAdd } : null}
        pagination={{ currentPage, totalPages, totalItems, itemsPerPage, onPageChange: setCurrentPage }}
      />

      {/* Schedule / Edit Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }} role="dialog">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 'var(--radius-lg)' }}>
                <div className="modal-header border-bottom pb-3">
                  <h5 className="modal-title fw-bold">{editId ? 'Edit Interview' : 'Schedule New Interview'}</h5>
                  <button type="button" className="btn-close shadow-none" onClick={() => setShowModal(false)} disabled={saving}></button>
                </div>
                <div className="modal-body py-4">
                  {formError && <div className="alert alert-danger py-2">{formError}</div>}
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-medium">Job Posting <span className="text-danger">*</span></label>
                      <select
                        className="form-select shadow-none"
                        value={form.jobPosting.id}
                        onChange={(e) => setForm((f) => ({ ...f, jobPosting: { id: e.target.value } }))}
                      >
                        <option value="">Select a job posting...</option>
                        {jobs.map((j) => (
                          <option key={j.id} value={j.id}>{j.title} — {j.company?.name || 'Unknown'}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium">Round Name <span className="text-danger">*</span></label>
                      <input className="form-control shadow-none" placeholder="e.g. Technical Round, HR Interview"
                        value={form.roundName} onChange={(e) => setForm((f) => ({ ...f, roundName: e.target.value }))} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Date <span className="text-danger">*</span></label>
                      <input type="date" className="form-control shadow-none"
                        value={form.scheduledDate} onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Time <span className="text-danger">*</span></label>
                      <input type="time" className="form-control shadow-none"
                        value={form.scheduledTime} onChange={(e) => setForm((f) => ({ ...f, scheduledTime: e.target.value }))} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Mode</label>
                      <select className="form-select shadow-none" value={form.mode}
                        onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value }))}>
                        <option>Online</option>
                        <option>Offline</option>
                        <option>Hybrid</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Venue / Link</label>
                      <input className="form-control shadow-none" placeholder="Room 201 or Meeting link"
                        value={form.venue} onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium">Coordinator</label>
                      <input className="form-control shadow-none" placeholder="Coordinator name"
                        value={form.coordinator} onChange={(e) => setForm((f) => ({ ...f, coordinator: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
                  <button className="btn btn-primary d-flex align-items-center gap-2" onClick={handleSave} disabled={saving}>
                    {saving && <span className="spinner-border spinner-border-sm"></span>}
                    {editId ? 'Save Changes' : 'Schedule Interview'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Interview"
        message="Are you sure you want to delete this interview schedule?"
        confirmText="Delete"
      />
    </div>
  );
}
