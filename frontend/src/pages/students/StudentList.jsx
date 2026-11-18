import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchStudents, deleteStudent } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Toolbar from '../../components/common/Toolbar';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, studentId: null });
  const [isDeleting, setIsDeleting] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await fetchStudents();
      setStudents(data);
    } catch (err) {
      console.error("Failed to load students", err);
      setError("Failed to load students from the server.");
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering and searching
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = !searchQuery || 
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.email && student.email.toLowerCase().includes(searchQuery.toLowerCase()));
        
      // Mock filter by batch since API might not have it natively yet, we can pretend college name or some field holds it
      // Let's just always match if filter is empty
      const matchesBatch = !filterBatch || true; // Replace with actual logic if batch data exists

      return matchesSearch && matchesBatch;
    });
  }, [students, searchQuery, filterBatch]);

  // Client-side pagination
  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  // Ensure current page is valid after filter changes
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const confirmDelete = (id) => {
    setDeleteModal({ isOpen: true, studentId: id });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteStudent(deleteModal.studentId);
      setStudents(students.filter(s => s.id !== deleteModal.studentId));
      setDeleteModal({ isOpen: false, studentId: null });
    } catch (err) {
      console.error("Failed to delete student", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    { 
      header: 'ID', 
      field: 'id',
      render: (row) => <span className="text-muted fw-medium">#{row.id}</span>
    },
    { 
      header: 'Name', 
      field: 'firstName',
      render: (row) => <span className="fw-medium text-dark">{row.firstName} {row.lastName}</span>
    },
    { header: 'Email', field: 'email', className: 'text-muted' },
    { 
      header: 'College', 
      field: 'college',
      render: (row) => <span className="text-muted">{row.college ? row.college.name : '—'}</span>
    },
    { 
      header: 'Status', 
      field: 'status',
      render: () => <StatusBadge status="Active" customConfig={{'Active': 'success'}} /> 
    },
    {
      header: 'Actions',
      className: 'text-end',
      tdClassName: 'text-end',
      render: (row) => (
        <div className="dropdown">
          <button className="btn btn-light btn-sm rounded-circle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{width: '32px', height: '32px'}}>
            <i className="bi bi-three-dots-vertical"></i>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow border-0" style={{ borderRadius: 'var(--radius-md)' }}>
            <li><Link className="dropdown-item d-flex align-items-center gap-2" to={`/students/${row.id}`}><i className="bi bi-person text-primary"></i> View Profile</Link></li>
            <li><Link className="dropdown-item d-flex align-items-center gap-2" to={`/students/${row.id}/edit`}><i className="bi bi-pencil text-secondary"></i> Edit Details</Link></li>
            <li><hr className="dropdown-divider" /></li>
            <li><button className="dropdown-item d-flex align-items-center gap-2 text-danger" onClick={() => confirmDelete(row.id)}><i className="bi bi-trash"></i> Delete Student</button></li>
          </ul>
        </div>
      )
    }
  ];

  const filters = [
    {
      label: 'All batches',
      options: [
        { value: '', label: 'All Batches' },
        { value: '2026', label: '2026 Batch' },
        { value: '2025', label: '2025 Batch' }
      ],
      onChange: (e) => setFilterBatch(e.target.value)
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Students" 
        subtitle="Register, maintain and monitor student placement profiles."
        primaryAction={{ label: "Add Student", icon: "bi-plus-lg", onClick: () => navigate('/students/new') }}
      />
      
      <Toolbar 
        searchPlaceholder="Search by name or email..."
        onSearch={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        filters={filters}
      />

      <DataTable 
        columns={columns}
        data={paginatedStudents}
        loading={loading}
        error={error}
        emptyStateIcon="bi-people"
        emptyStateTitle={searchQuery ? "No matching students" : "No students found"}
        emptyStateMessage={searchQuery ? "Try adjusting your search or filters." : "Add a student to get started."}
        emptyStateAction={!searchQuery ? { label: "Add Student", onClick: () => navigate('/students/new') } : null}
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
        onClose={() => setDeleteModal({ isOpen: false, studentId: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
