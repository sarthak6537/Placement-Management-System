import React, { useState, useMemo, useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import Toolbar from '../components/common/Toolbar';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import StudentProfilePage from './students/StudentProfilePage';

const content = {
  applications: {
    title: 'Applications',
    subtitle: 'Review and move student applications through the hiring pipeline.',
    button: 'Export report',
    icon: 'bi-download',
    headers: ['Student', 'Role', 'Company', 'Applied on', 'Stage'],
    rows: [
      { id: 1, student: 'Priya Sharma', role: 'Frontend Engineer', company: 'Zoho', applied: '08 Aug 2026', stage: 'Shortlisted' },
      { id: 2, student: 'Arjun Kumar', role: 'Software Developer', company: 'Infosys', applied: '08 Aug 2026', stage: 'Interview' },
      { id: 3, student: 'Nisha Patel', role: 'Data Analyst', company: 'Deloitte', applied: '07 Aug 2026', stage: 'Applied' },
      { id: 4, student: 'Rahul Verma', role: 'Graduate Engineer', company: 'Wipro', applied: '06 Aug 2026', stage: 'Selected' },
      { id: 5, student: 'Anjali Desai', role: 'Backend Engineer', company: 'TCS', applied: '05 Aug 2026', stage: 'Interview' },
      { id: 6, student: 'Vikram Singh', role: 'System Admin', company: 'TechMahindra', applied: '04 Aug 2026', stage: 'Applied' },
      { id: 7, student: 'Sneha Reddy', role: 'UI/UX Designer', company: 'Zoho', applied: '03 Aug 2026', stage: 'Selected' }
    ]
  },
  interviews: {
    title: 'Interview schedules',
    subtitle: 'Coordinate upcoming assessments and interview rounds.',
    button: 'Schedule interview',
    icon: 'bi-plus-lg',
    headers: ['Date & time', 'Company', 'Round', 'Students', 'Coordinator'],
    rows: [
      { id: 1, date: 'Today · 10:00 AM', company: 'TCS', round: 'Technical interview', students: '12', coordinator: 'K. Srinivas' },
      { id: 2, date: 'Today · 01:30 PM', company: 'Accenture', round: 'HR interview', students: '8', coordinator: 'M. Sangeeta' },
      { id: 3, date: '12 Aug · 11:00 AM', company: 'NVIDIA', round: 'Online assessment', students: '26', coordinator: 'K. Srinivas' },
      { id: 4, date: '14 Aug · 03:00 PM', company: 'Deloitte', round: 'Group discussion', students: '18', coordinator: 'P. Anjali' },
      { id: 5, date: '15 Aug · 09:30 AM', company: 'Wipro', round: 'Coding Test', students: '40', coordinator: 'K. Srinivas' },
      { id: 6, date: '16 Aug · 10:00 AM', company: 'Infosys', round: 'Technical interview', students: '15', coordinator: 'M. Sangeeta' }
    ]
  },
  certificates: {
    title: 'Certificates & achievements',
    subtitle: 'Verify student credentials and campus accomplishments.',
    button: 'Add certificate',
    icon: 'bi-plus-lg',
    headers: ['Student', 'Certificate', 'Issuer', 'Issued date', 'Verification'],
    rows: [
      { id: 1, student: 'Nisha Patel', cert: 'Google Data Analytics', issuer: 'Google', date: '02 Aug 2026', verification: 'Verified' },
      { id: 2, student: 'Arjun Kumar', cert: 'AWS Cloud Practitioner', issuer: 'AWS', date: '28 Jul 2026', verification: 'Verified' },
      { id: 3, student: 'Priya Sharma', cert: 'React Developer', issuer: 'Meta', date: '20 Jul 2026', verification: 'Pending' },
      { id: 4, student: 'Rahul Verma', cert: 'Java Foundations', issuer: 'Oracle', date: '15 Jul 2026', verification: 'Verified' }
    ]
  },
  statistics: {
    title: 'Placement statistics',
    subtitle: 'Measure outcomes, performance and hiring trends for your institution.',
    button: 'Download report',
    icon: 'bi-download',
    headers: ['Department', 'Eligible', 'Placed', 'Placement rate', 'Top recruiter'],
    rows: [
      { id: 1, dept: 'Computer Science', eligible: '286', placed: '251', rate: '87.8%', top: 'TCS' },
      { id: 2, dept: 'Information Technology', eligible: '214', placed: '174', rate: '81.3%', top: 'Infosys' },
      { id: 3, dept: 'Electronics & Comm.', eligible: '190', placed: '126', rate: '66.3%', top: 'Wipro' },
      { id: 4, dept: 'Mechanical Eng.', eligible: '151', placed: '87', rate: '57.6%', top: 'L&T' }
    ]
  },
  settings: {
    title: 'Portal settings',
    subtitle: 'Manage placement cell preferences and administrator access.',
    button: 'Save changes',
    icon: 'bi-check-lg',
    headers: ['Setting', 'Current value', 'Owner', 'Updated', 'Status'],
    rows: [
      { id: 1, setting: 'Student registration', val: 'Open for 2026 batch', owner: 'Admin staff', updated: 'Today', status: 'Enabled' },
      { id: 2, setting: 'Company approvals', val: 'Manual review', owner: 'Placement cell', updated: '06 Aug 2026', status: 'Enabled' },
      { id: 3, setting: 'App notifications', val: 'Email + portal', owner: 'Admin staff', updated: '04 Aug 2026', status: 'Enabled' },
      { id: 4, setting: 'Profile completion rule', val: '80% minimum', owner: 'Placement cell', updated: '01 Aug 2026', status: 'Enabled' }
    ]
  },
  reports: {
    title: 'Custom Reports',
    subtitle: 'Generate and export custom analytics and compliance data.',
    button: 'Create report',
    icon: 'bi-plus-lg',
    headers: ['Report name', 'Type', 'Generated on', 'Author', 'Status'],
    rows: [
      { id: 1, name: '2026 Batch Placement Roster', type: 'CSV Export', generated: 'Today', author: 'Admin System', status: 'Ready' },
      { id: 2, name: 'Top 10 Recruiting Companies Analytics', type: 'PDF Summary', generated: '09 Aug 2026', author: 'Placement cell', status: 'Ready' },
      { id: 3, name: 'Unplaced Students Outreach List', type: 'Excel Sheet', generated: '07 Aug 2026', author: 'K. Srinivas', status: 'Pending' },
      { id: 4, name: 'Department-wise Salary Averages', type: 'PDF Analytics', generated: '01 Aug 2026', author: 'Admin System', status: 'Ready' }
    ]
  },
  profile: {
    title: 'My Profile',
    subtitle: 'Manage your personal information and account security.',
    button: 'Edit profile',
    icon: 'bi-pencil',
    headers: ['Field', 'Information', 'Visibility', 'Last updated'],
    rows: [
      { id: 1, field: 'Full Name', info: 'Admin User', vis: 'Public', updated: 'Jan 2026' },
     { id: 2, field: 'Email Address', info: 'admin@placementhub.edu', vis: 'Private', updated: 'Jan 2026' },
      { id: 3, field: 'Role', info: 'System Administrator', vis: 'Public', updated: 'Jan 2026' },
      { id: 4, field: 'Department', info: 'Placement Cell', vis: 'Public', updated: 'Jan 2026' }
    ]
  }
};

export default function ManagementPage({ type }) {
  const { user } = useAuth();
  const d = content[type];

  // Students get a real editable profile page instead of the generic table
  const isStudent = user?.roles?.includes('ROLE_STUDENT');
  if (type === 'profile' && isStudent) {
    return <StudentProfilePage />;
  }
  
  // State for search and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset page and search when type changes
  useEffect(() => {
    setSearchQuery('');
    setCurrentPage(1);
  }, [type]);

  if (!d) return <div className="p-4 text-center">Not found</div>;

  // Client-side generic search logic
  const filteredRows = useMemo(() => {
    if (!searchQuery) return d.rows;
    return d.rows.filter(row => {
      // Search across all string values in the row
      return Object.values(row).some(val => 
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [d.rows, searchQuery]);

  // Client-side pagination logic
  const totalItems = filteredRows.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, currentPage]);

  // Dynamically generate columns based on the type
  const columns = d.headers.map((h, idx) => {
    // The last column is usually a status or something we can badge
    const isLastCol = idx === d.headers.length - 1;
    
    // We map header names to object keys for this generic implementation
    const keys = Object.keys(d.rows[0]).filter(k => k !== 'id');
    const field = keys[idx];

    return {
      header: h,
      field: field,
      className: idx === 0 ? 'fw-medium text-dark' : 'text-muted',
      render: (row) => {
        const val = row[field];
        if (isLastCol && ['Active', 'On hold', 'Shortlisted', 'Interview', 'Applied', 'Selected', 'Verified', 'Pending', 'Enabled'].includes(val)) {
          return <StatusBadge status={val} />;
        }
        if (type === 'statistics' && field === 'rate') {
          return (
            <div className="d-flex align-items-center gap-2">
              <span className="fw-medium">{val}</span>
              <div className="progress flex-grow-1" style={{height: '6px', maxWidth: '80px'}}>
                <div className="progress-bar bg-primary" style={{width: val}}></div>
              </div>
            </div>
          );
        }
        return val;
      }
    };
  });

  // Add Action column
  columns.push({
    header: 'Actions',
    className: 'text-end',
    tdClassName: 'text-end',
    render: () => (
      <button className="btn btn-light btn-sm rounded-circle p-1" type="button" style={{width: '32px', height: '32px'}}>
        <i className="bi bi-three-dots-vertical"></i>
      </button>
    )
  });

  return (
    <div>
      <PageHeader 
        title={d.title} 
        subtitle={d.subtitle}
        primaryAction={{ label: d.button, icon: d.icon, onClick: () => {} }}
      />
      
      <Toolbar 
        searchPlaceholder={`Search ${d.title.toLowerCase()}...`}
        onSearch={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        filters={[{ label: 'All records', options: [{value: '', label: 'All records'}], onChange: () => {} }]}
      />

      <DataTable 
        columns={columns}
        data={paginatedRows}
        emptyStateIcon="bi-folder2-open"
        emptyStateTitle={`No ${d.title.toLowerCase()} found`}
        emptyStateMessage={searchQuery ? "Try adjusting your search terms." : "There are currently no records to display here."}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
          onPageChange: setCurrentPage
        }}
      />
    </div>
  );
}
