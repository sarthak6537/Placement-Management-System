import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchStudentById, createStudent, updateStudent } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';

export default function StudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: ''
  });
  const [loading, setLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const loadStudent = async () => {
        try {
          const data = await fetchStudentById(id);
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            department: data.department || ''
          });
        } catch (err) {
          setError('Failed to load student details. They might have been removed.');
        } finally {
          setLoading(false);
        }
      };
      loadStudent();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      if (isEditMode) {
        await updateStudent(id, formData);
      } else {
        await createStudent(formData);
      }
      navigate('/students');
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} student. Please verify the information and try again.`);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 text-primary">
        <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
      </div>
    );
  }

  return (
    <div className="max-w-100" style={{maxWidth: '800px', margin: '0 auto'}}>
      <PageHeader 
        title={isEditMode ? 'Edit Student Profile' : 'Add New Student'} 
        subtitle={isEditMode ? 'Update the student record and placement information.' : 'Register a new student for placement activities.'}
        primaryAction={{ 
          label: "Cancel", 
          icon: "bi-x-lg", 
          onClick: () => navigate('/students'),
          variant: "outline-secondary"
        }}
      />

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 border-0 mb-4 py-2" role="alert">
          <i className="bi bi-exclamation-circle-fill"></i>
          <div style={{fontSize: '0.875rem'}}>{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h5 className="mb-0 fw-semibold text-dark">Personal Information</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-4">
              <div className="col-12 col-md-6">
                <label className="form-label fw-medium text-dark" style={{fontSize: '0.875rem'}}>First Name <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  className="form-control"
                  placeholder="e.g. John"
                  required 
                />
              </div>
              
              <div className="col-12 col-md-6">
                <label className="form-label fw-medium text-dark" style={{fontSize: '0.875rem'}}>Last Name <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  className="form-control"
                  placeholder="e.g. Doe"
                  required 
                />
              </div>
              
              <div className="col-12 col-md-6">
                <label className="form-label fw-medium text-dark" style={{fontSize: '0.875rem'}}>Email Address <span className="text-danger">*</span></label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="form-control"
                  placeholder="student@college.edu"
                  required 
                />
              </div>
              
              <div className="col-12 col-md-6">
                <label className="form-label fw-medium text-dark" style={{fontSize: '0.875rem'}}>Department</label>
                <select 
                  className="form-select" 
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="">Select a department...</option>
                  <option value="CS">Computer Science</option>
                  <option value="IT">Information Technology</option>
                  <option value="EC">Electronics</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-3 pt-2 border-top mt-4">
          <button type="button" onClick={() => navigate('/students')} className="btn btn-light px-4 fw-medium">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary px-4 d-flex align-items-center gap-2" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <i className="bi bi-check2"></i>
            )}
            {isEditMode ? 'Update Student' : 'Save Student'}
          </button>
        </div>
      </form>
    </div>
  );
}
