import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchColleges,
  createCollege,
  updateCollege,
  deleteCollege,
} from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Toolbar from '../../components/common/Toolbar';
import DataTable from '../../components/common/DataTable';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const EMPTY_FORM = { name: '', address: '' };

export default function CollegeList() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { loadColleges(); }, []);

  const loadColleges = async () => {
    try {
      setLoading(true);
      const data = await fetchColleges();
      setColleges(data);
    } catch {
      setError('Failed to load colleges.');
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
    setForm({ name: row.name || '', address: row.address || '' });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.address) {
      setFormError('Name and address are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editId) {
        const updated = await updateCollege(editId, form);
        setColleges((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await createCollege(form);
        setColleges((prev) => [created, ...prev]);
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
      await deleteCollege(deleteModal.id);
      setColleges((prev) => prev.filter((c) => c.id !== deleteModal.id));
      setDeleteModal({ isOpen: false, id: null });
    } catch {
      alert('Failed to delete. The college may have associated students.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    return colleges.filter((c) => {
      const s = `${c.name || ''} ${c.address || ''}`.toLowerCase();
      return !searchQuery || s.includes(searchQuery.toLowerCase());
    });
  }, [colleges, searchQuery]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(1); }, [totalPages, currentPage]);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const columns = [
    { header: '#', render: (row) => <span className="text-muted fw-medium">#{row.id}</span> },
    {
      header: 'College Name',
      render: (row) => (
        <div className="d-flex align-items-center gap-3">
          <div className="bg-info-subtle text-info rounded d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
            style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>
            {(row.name || '?').charAt(0).toUpperCase()}
          </div>
          <span className="fw-medium text-dark">{row.name}</span>
        </div>
      ),
    },
    { header: 'Address', render: (row) => <span className="text-muted">{row.address || '—'}</span> },
    {
      header: 'Students',
      render: (row) => (
        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
          {row.students?.length ?? 0} students
        </span>
      ),
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

  return (
    <div>
      <PageHeader
        title="College Management"
        subtitle="Manage associated colleges and their student enrollment."
        primaryAction={{ label: 'Add College', icon: 'bi-plus-lg', onClick: openAdd }}
      />

      <Toolbar
        searchPlaceholder="Search by college name or address..."
        onSearch={(val) => { setSearchQuery(val); setCurrentPage(1); }}
      />

      <DataTable
        columns={columns}
        data={paginated}
        loading={loading}
        error={error}
        emptyStateIcon="bi-building-fill"
        emptyStateTitle="No colleges found"
        emptyStateMessage={searchQuery ? 'Try adjusting your search.' : 'Add a college to get started.'}
        emptyStateAction={!searchQuery ? { label: 'Add College', onClick: openAdd } : null}
        pagination={{ currentPage, totalPages, totalItems, itemsPerPage, onPageChange: setCurrentPage }}
      />

      {/* Add / Edit Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }} role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 'var(--radius-lg)' }}>
                <div className="modal-header border-bottom pb-3">
                  <h5 className="modal-title fw-bold">{editId ? 'Edit College' : 'Add College'}</h5>
                  <button type="button" className="btn-close shadow-none" onClick={() => setShowModal(false)} disabled={saving}></button>
                </div>
                <div className="modal-body py-4">
                  {formError && <div className="alert alert-danger py-2">{formError}</div>}
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-medium">College Name <span className="text-danger">*</span></label>
                      <input className="form-control shadow-none" placeholder="e.g. IIT Madras"
                        value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium">Address <span className="text-danger">*</span></label>
                      <input className="form-control shadow-none" placeholder="City, State"
                        value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
                  <button className="btn btn-primary d-flex align-items-center gap-2" onClick={handleSave} disabled={saving}>
                    {saving && <span className="spinner-border spinner-border-sm"></span>}
                    {editId ? 'Save Changes' : 'Add College'}
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
        title="Delete College"
        message="Delete this college? Associated students will be unlinked but not deleted."
        confirmText="Delete"
      />
    </div>
  );
}
