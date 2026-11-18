import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Auth pages
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));

// Placeholder components for routes (will create files next)
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const StudentList = React.lazy(() => import('./pages/students/StudentList'));
const StudentForm = React.lazy(() => import('./pages/students/StudentForm'));
const StudentProfile = React.lazy(() => import('./pages/students/StudentProfile'));
const StudentProfilePage = React.lazy(() => import('./pages/students/StudentProfilePage'));
const MyApplications = React.lazy(() => import('./pages/students/MyApplications'));
const CollegeList = React.lazy(() => import('./pages/colleges/CollegeList'));
const PlacementList = React.lazy(() => import('./pages/placements/PlacementList'));
const CertificateList = React.lazy(() => import('./pages/certificates/CertificateList'));
const UserList = React.lazy(() => import('./pages/users/UserList'));
const ManagementPage = React.lazy(() => import('./pages/ManagementPage'));

// Real feature pages
const ApplicationsPage = React.lazy(() => import('./pages/applications/ApplicationsPage'));
const InterviewsPage = React.lazy(() => import('./pages/interviews/InterviewsPage'));

// New dynamic pages for Companies and Jobs
const CompanyList = React.lazy(() => import('./pages/companies/CompanyList'));
const CompanyForm = React.lazy(() => import('./pages/companies/CompanyForm'));
const JobList = React.lazy(() => import('./pages/jobs/JobList'));
const JobForm = React.lazy(() => import('./pages/jobs/JobForm'));
const RecommendedJobs = React.lazy(() => import('./pages/jobs/RecommendedJobs'));

const AccessDenied = React.lazy(() => import('./pages/AccessDenied'));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <React.Suspense fallback={<div style={{padding: '20px', color: 'white', backgroundColor: 'var(--bg-dark)', height: '100vh'}}>Loading...</div>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/access-denied" element={<AccessDenied />} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              {/* Dashboard is dynamically rendered based on role inside Dashboard.jsx */}
              <Route index element={<Dashboard />} />
              
              {/* Admin & Placement Officer Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_PLACEMENT_OFFICER']} />}>
                <Route path="students" element={<StudentList />} />
                <Route path="students/new" element={<StudentForm />} />
                <Route path="students/:id/edit" element={<StudentForm />} />
                
                <Route path="companies/new" element={<CompanyForm />} />
                <Route path="companies/:id/edit" element={<CompanyForm />} />
                
                <Route path="jobs/new" element={<JobForm />} />
                <Route path="jobs/:id/edit" element={<JobForm />} />
                
                <Route path="applications" element={<ApplicationsPage />} />
                <Route path="interviews" element={<InterviewsPage />} />
                <Route path="placements" element={<PlacementList />} />
                <Route path="colleges" element={<CollegeList />} />
                <Route path="statistics" element={<ManagementPage type="statistics" />} />
                <Route path="reports" element={<ManagementPage type="reports" />} />
              </Route>
              
              {/* Admin Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
                <Route path="users" element={<UserList />} />
                <Route path="settings" element={<ManagementPage type="settings" />} />
              </Route>
              
              {/* Routes available to all roles */}
              <Route path="companies" element={<CompanyList />} />
              <Route path="jobs" element={<JobList />} />
              <Route path="recommended-jobs" element={<RecommendedJobs />} />
              <Route path="students/:id" element={<StudentProfile />} />
              <Route path="profile" element={<StudentProfilePage />} />
              <Route path="my-applications" element={<MyApplications />} />
              <Route path="certificates" element={<CertificateList />} />
              <Route path="profile" element={<ManagementPage type="profile" />} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
