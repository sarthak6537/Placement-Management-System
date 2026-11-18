import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchPlacements,
  fetchStudents,
  createPlacement,
  deletePlacement,
} from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Toolbar from '../../components/common/Toolbar';
import DataTable from '../../components/common/DataTable';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const EMPTY_FORM = { companyName: '', date: '' };

export default function PlacementList() {
  const [placements, setPlacements] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [placesData, stuData] = await Promise.all([
        fetchPlacements().catch(() => []),
        fetchStudents().catch(() => []),
      ]);
      setPlacements(placesData);
      setStudents(stuData);
    } catch {
      setError('Failed to load placement records.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.companyName || !form.date) {
      setFormError('Company name and date are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const created = await createPlacement({ companyName: form.companyName, date: form.date });
      setPlacements((prev) => [created, ...prev]);
      setShowModal(false);
      setForm(EMPTY_FORM);
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
      await deletePlacement(deleteModal.id);
      setPlacements((prev) => prev.filter((p) => p.id !== deleteModal.id));
      setDeleteModal({ isOpen: false, id: null });
    } catch {
      alert('Failed to delete.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    return placements.filter((p) =>
      !searchQuery || (p.companyName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [placements, searchQuery]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(1); }, [totalPages, currentPage]);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  // Batch statistics by company
  const stats = useMemo(() => {
    const map = {};
    placements.forEach((p) => {
      const name = p.companyName || 'Unknown';
      map[name] = (map[name] || 0) + (p.students?.length || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [placements]);

  const totalPlaced = useMemo(
    () => placements.reduce((acc, p) => acc + (p.students?.length || 0), 0),
    [placements]
  );

  const columns = [
    { header: '#', render: (row) => <span className="text-muted fw-medium">#{row.id}</span> },
    {
      header: 'Company',
      render: (row) => <span className="fw-medium text-dark">{row.companyName}</span>,
    },
    {
      header: 'Drive Date',
      render: (row) => <span className="text-muted">{row.date || '—'}</span>,
    },
    {
      header: 'Students Placed',
      render: (row) => (
        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
          {row.students?.length || 0} students
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-end',
      tdClassName: 'text-end',
      render: (row) => (
        <button className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1" onClick={() => confirmDelete(row.id)}>
          <i className="bi bi-trash"></i> Delete
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Placement Records"
        subtitle="Track students placed through the campus recruitment drives."
        primaryAction={{ label: 'Add Placement Record', icon: 'bi-plus-lg', onClick: () => { setForm(EMPTY_FORM); setFormError(''); setShowModal(true); } }}
      />

      {/* Batch Statistics */}
      {!loading && (
        <div className="row g-4 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-success-subtle text-success rounded d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                    <i className="bi bi-award fs-5"></i>
                  </div>
                  <div>
                    <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>Total Placed</p>
                    <h4 className="fw-bold mb-0">{totalPlaced}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary-subtle text-primary rounded d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                    <i className="bi bi-building fs-5"></i>
                  </div>
                  <div>
                    <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>Companies</p>
                    <h4 className="fw-bold mb-0">{placements.length}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-xl-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <p className="text-muted fw-semibold mb-3" style={{ fontSize: '0.8rem' }}>TOP RECRUITERS</p>
                <div className="d-flex flex-wrap gap-2">
                  {stats.length === 0 ? (
                    <span className="text-muted">No data</span>
                  ) : (
                    stats.map(([name, count]) => (
                      <span key={name} className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2" style={{ fontSize: '0.8rem' }}>
                        {name} · {count}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toolbar
        searchPlaceholder="Search by company name..."
        onSearch={(val) => { setSearchQuery(val); setCurrentPage(1); }}
      />

      <DataTable
        columns={columns}
        data={paginated}
        loading={loading}
        error={error}
        emptyStateIcon="bi-award"
        emptyStateTitle="No placement records"
        emptyStateMessage={searchQuery ? 'Try adjusting your search.' : 'Add a placement record to get started.'}
        emptyStateAction={!searchQuery ? { label: 'Add Record', onClick: () => setShowModal(true) } : null}
        pagination={{ currentPage, totalPages, totalItems, itemsPerPage, onPageChange: setCurrentPage }}
      />

      {/* Add Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }} role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 'var(--radius-lg)' }}>
                <div className="modal-header border-bottom pb-3">
                  <h5 className="modal-title fw-bold">Add Placement Record</h5>
                  <button type="button" className="btn-close shadow-none" onClick={() => setShowModal(false)} disabled={saving}></button>
                </div>
                <div className="modal-body py-4">
                  {formError && <div className="alert alert-danger py-2">{formError}</div>}
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-medium">Company Name <span className="text-danger">*</span></label>
                      <input className="form-control shadow-none" placeholder="e.g. TCS, Infosys"
                        value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium">Drive Date <span className="text-danger">*</span></label>
                      <input type="date" className="form-control shadow-none"
                        value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
                  <button className="btn btn-primary d-flex align-items-center gap-2" onClick={handleSave} disabled={saving}>
                    {saving && <span className="spinner-border spinner-border-sm"></span>}
                    Add Record
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
        title="Delete Placement Record"
        message="Are you sure you want to delete this placement record?"
        confirmText="Delete"
      />
    </div>
  );
}
