import React, { useState, useEffect, useMemo } from 'react';
import { fetchUsers, deleteUser, registerUser } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Toolbar from '../../components/common/Toolbar';
import DataTable from '../../components/common/DataTable';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const ROLE_BADGE = {
  ROLE_ADMIN: { label: 'Admin', cls: 'danger' },
  ROLE_PLACEMENT_OFFICER: { label: 'Placement Officer', cls: 'warning' },
  ROLE_STUDENT: { label: 'Student', cls: 'primary' },
};

const EMPTY_FORM = {
  username: '',
  password: '',
  email: '',
  role: 'ROLE_STUDENT',
  fullName: '',
  department: '',
};

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users. Ensure you are logged in as Admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.username || !form.password || !form.email) {
      setFormError('Username, password and email are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await registerUser({
        username: form.username,
        password: form.password,
        email: form.email,
        role: form.role,
        fullName: form.role === 'ROLE_ADMIN' ? form.fullName : undefined,
        department: form.role === 'ROLE_PLACEMENT_OFFICER' ? form.department : undefined,
      });
      setShowModal(false);
      setForm(EMPTY_FORM);
      await loadUsers();
    } catch (err) {
      setFormError(err.message || 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id) => setDeleteModal({ isOpen: true, userId: id });
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteUser(deleteModal.userId);
      setUsers((prev) => prev.filter((u) => u.id !== deleteModal.userId));
      setDeleteModal({ isOpen: false, userId: null });
    } catch {
      alert('Failed to delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const searchStr = `${u.username || ''} ${u.email || ''}`.toLowerCase();
      const matchesSearch = !searchQuery || searchStr.includes(searchQuery.toLowerCase());
      const matchesRole = !filterRole || u.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, filterRole]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(1); }, [totalPages, currentPage]);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const columns = [
    {
      header: '#',
      render: (row) => <span className="text-muted fw-medium">#{row.id}</span>,
    },
    {
      header: 'User',
      render: (row) => (
        <div className="d-flex align-items-center gap-3">
          <div
            className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
            style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}
          >
            {(row.username || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="fw-medium text-dark">{row.username}</div>
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>{row.email || '—'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Full Name',
      render: (row) => <span className="text-muted">{row.fullName || row.department || '—'}</span>,
    },
    {
      header: 'Role',
      render: (row) => {
        const cfg = ROLE_BADGE[row.role] || { label: row.role || '—', cls: 'secondary' };
        return (
          <span className={`badge bg-${cfg.cls}-subtle text-${cfg.cls} border border-${cfg.cls}-subtle px-2 py-1`} style={{ fontSize: '0.75rem' }}>
            {cfg.label}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      className: 'text-end',
      tdClassName: 'text-end',
      render: (row) => (
        <button
          className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
          onClick={() => confirmDelete(row.id)}
        >
          <i className="bi bi-trash"></i> Delete
        </button>
      ),
    },
  ];

  const filters = [
    {
      label: 'All Roles',
      options: [
        { value: '', label: 'All Roles' },
        { value: 'ROLE_ADMIN', label: 'Admin' },
        { value: 'ROLE_PLACEMENT_OFFICER', label: 'Placement Officer' },
        { value: 'ROLE_STUDENT', label: 'Student' },
      ],
      onChange: (e) => { setFilterRole(e.target.value); setCurrentPage(1); },
    },
  ];

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Manage administrator and user accounts for the portal."
        primaryAction={{ label: 'Create User', icon: 'bi-plus-lg', onClick: () => { setForm(EMPTY_FORM); setFormError(''); setShowModal(true); } }}
      />

      <Toolbar
        searchPlaceholder="Search by username or email..."
        onSearch={(val) => { setSearchQuery(val); setCurrentPage(1); }}
        filters={filters}
      />

      <DataTable
        columns={columns}
        data={paginated}
        loading={loading}
        error={error}
        emptyStateIcon="bi-people-fill"
        emptyStateTitle="No users found"
        emptyStateMessage={searchQuery || filterRole ? 'Try adjusting your filters.' : 'Create a user to get started.'}
        emptyStateAction={!searchQuery && !filterRole ? { label: 'Create User', onClick: () => setShowModal(true) } : null}
        pagination={{ currentPage, totalPages, totalItems, itemsPerPage, onPageChange: setCurrentPage }}
      />

      {/* Create User Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }} role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 'var(--radius-lg)' }}>
                <div className="modal-header border-bottom pb-3">
                  <h5 className="modal-title fw-bold">Create New User</h5>
                  <button type="button" className="btn-close shadow-none" onClick={() => setShowModal(false)} disabled={saving}></button>
                </div>
                <div className="modal-body py-4">
                  {formError && <div className="alert alert-danger py-2">{formError}</div>}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Username <span className="text-danger">*</span></label>
                      <input className="form-control shadow-none" placeholder="username"
                        value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Password <span className="text-danger">*</span></label>
                      <input type="password" className="form-control shadow-none" placeholder="••••••••"
                        value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium">Email <span className="text-danger">*</span></label>
                      <input type="email" className="form-control shadow-none" placeholder="user@example.com"
                        value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium">Role</label>
                      <select className="form-select shadow-none" value={form.role}
                        onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                        <option value="ROLE_STUDENT">Student</option>
                        <option value="ROLE_PLACEMENT_OFFICER">Placement Officer</option>
                        <option value="ROLE_ADMIN">Admin</option>
                      </select>
                    </div>
                    {form.role === 'ROLE_ADMIN' && (
                      <div className="col-12">
                        <label className="form-label fw-medium">Full Name</label>
                        <input className="form-control shadow-none" placeholder="Full name"
                          value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
                      </div>
                    )}
                    {form.role === 'ROLE_PLACEMENT_OFFICER' && (
                      <div className="col-12">
                        <label className="form-label fw-medium">Department</label>
                        <input className="form-control shadow-none" placeholder="e.g. Placement Cell"
                          value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
                  <button className="btn btn-primary d-flex align-items-center gap-2" onClick={handleSave} disabled={saving}>
                    {saving && <span className="spinner-border spinner-border-sm"></span>}
                    Create User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, userId: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete User"
        message="Are you sure you want to delete this user? This cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
