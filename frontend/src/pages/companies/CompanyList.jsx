import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchCompanies, deleteCompany } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Toolbar from '../../components/common/Toolbar';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export default function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, companyId: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const { user } = useAuth();
  const isStudent = user?.roles?.includes('ROLE_STUDENT');

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await fetchCompanies();
      setCompanies(data);
    } catch (err) {
      setError('Failed to load companies from server.');
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering and searching
  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const matchesSearch = !searchQuery || 
        (company.name && company.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (company.industry && company.industry.toLowerCase().includes(searchQuery.toLowerCase()));
        
      const matchesIndustry = !filterIndustry || 
        (company.industry && company.industry.toLowerCase() === filterIndustry.toLowerCase());

      return matchesSearch && matchesIndustry;
    });
  }, [companies, searchQuery, filterIndustry]);

  // Client-side pagination
  const totalItems = filteredCompanies.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCompanies.slice(start, start + itemsPerPage);
  }, [filteredCompanies, currentPage]);

  const confirmDelete = (id) => setDeleteModal({ isOpen: true, companyId: id });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCompany(deleteModal.companyId);
      setCompanies(companies.filter(c => c.id !== deleteModal.companyId));
      setDeleteModal({ isOpen: false, companyId: null });
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    { 
      header: 'Company', 
      field: 'name',
      render: (row) => (
        <div>
          <div className="fw-medium text-dark">{row.name}</div>
          {row.website && (
            <div style={{fontSize: '0.8125rem'}}>
              <a href={row.website.startsWith('http') ? row.website : `https://${row.website}`} target="_blank" rel="noopener noreferrer" className="text-muted d-flex align-items-center gap-1 text-decoration-none">
                {row.website} <i className="bi bi-box-arrow-up-right" style={{fontSize: '0.7rem'}}></i>
              </a>
            </div>
          )}
        </div>
      )
    },
    { 
      header: 'Industry', 
      field: 'industry',
      render: (row) => <span className="text-muted">{row.industry || '—'}</span> 
    },
    { 
      header: 'Recruiter', 
      field: 'recruiter',
      render: (row) => (
        <div>
          <div className="fw-medium text-dark">{row.recruiterName || '—'}</div>
          <div className="text-muted" style={{fontSize: '0.8125rem'}}>{row.recruiterEmail}</div>
        </div>
      )
    },
    { 
      header: 'Status', 
      field: 'status',
      render: (row) => <StatusBadge status={row.status === 'ACTIVE' ? 'Active' : 'Inactive'} />
    }
  ];

  if (!isStudent) {
    columns.push({
      header: 'Actions',
      className: 'text-end',
      tdClassName: 'text-end',
      render: (row) => (
        <div className="dropdown">
          <button className="btn btn-light btn-sm rounded-circle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{width: '32px', height: '32px'}}>
            <i className="bi bi-three-dots-vertical"></i>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow border-0" style={{ borderRadius: 'var(--radius-md)' }}>
            <li><Link className="dropdown-item d-flex align-items-center gap-2" to={`/companies/${row.id}/edit`}><i className="bi bi-pencil text-secondary"></i> Edit Company</Link></li>
            <li><hr className="dropdown-divider" /></li>
            <li><button className="dropdown-item d-flex align-items-center gap-2 text-danger" onClick={() => confirmDelete(row.id)}><i className="bi bi-trash"></i> Delete</button></li>
          </ul>
        </div>
      )
    });
  }

  // Derive unique industries for filter
  const uniqueIndustries = [...new Set(companies.map(c => c.industry).filter(Boolean))];
  const filters = [
    {
      label: 'All Industries',
      options: [
        { value: '', label: 'All Industries' },
        ...uniqueIndustries.map(ind => ({ value: ind, label: ind }))
      ],
      onChange: (e) => setFilterIndustry(e.target.value)
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Company Management" 
        subtitle="Manage recruiting partners and their hiring activity."
        primaryAction={!isStudent ? { label: "Add Company", icon: "bi-plus-lg", onClick: () => navigate('/companies/new') } : null}
      />
      
      <Toolbar 
        searchPlaceholder="Search by company name or industry..."
        onSearch={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        filters={filters}
      />

      <DataTable 
        columns={columns}
        data={paginatedCompanies}
        loading={loading}
        error={error}
        emptyStateIcon="bi-building"
        emptyStateTitle={searchQuery || filterIndustry ? "No matching companies" : "No companies found"}
        emptyStateMessage={searchQuery || filterIndustry ? "Try adjusting your search or filters." : (isStudent ? "No companies are currently available." : "Add a company to start managing partners.")}
        emptyStateAction={(!searchQuery && !filterIndustry && !isStudent) ? { label: "Add Company", onClick: () => navigate('/companies/new') } : null}
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
        onClose={() => setDeleteModal({ isOpen: false, companyId: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Company"
        message="Are you sure you want to delete this company? Associated jobs might be affected."
        confirmText="Delete"
      />
    </div>
  );
}
