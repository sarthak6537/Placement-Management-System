import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCompanyById, createCompany, updateCompany } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';

export default function CompanyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    recruiterName: '',
    recruiterEmail: '',
    status: 'ACTIVE'
  });
  const [loading, setLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const loadCompany = async () => {
        try {
          const data = await fetchCompanyById(id);
          setFormData({
            name: data.name || '',
            industry: data.industry || '',
            website: data.website || '',
            recruiterName: data.recruiterName || '',
            recruiterEmail: data.recruiterEmail || '',
            status: data.status || 'ACTIVE'
          });
        } catch (err) {
          setError('Failed to load company details. They might have been removed.');
        } finally {
          setLoading(false);
        }
      };
      loadCompany();
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
        await updateCompany(id, formData);
      } else {
        await createCompany(formData);
      }
      navigate('/companies');
    } catch (err) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} company. Please verify the information and try again.`);
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
        title={isEditMode ? 'Edit Company' : 'Add New Company'} 
        subtitle={isEditMode ? 'Update recruiter details and company status.' : 'Register a new hiring partner in the system.'}
        primaryAction={{ 
          label: "Cancel", 
          icon: "bi-x-lg", 
          onClick: () => navigate('/companies'),
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
            <h5 className="mb-0 fw-semibold text-dark">Company Information</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-4">
              
              <div className="col-12">
                <label htmlFor="name" className="form-label fw-medium text-dark" style={{fontSize: '0.875rem'}}>Company Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-control"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="industry" className="form-label fw-medium text-dark" style={{fontSize: '0.875rem'}}>Industry</label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. IT & Software"
                />
              </div>
              
              <div className="col-12 col-md-6">
                <label htmlFor="website" className="form-label fw-medium text-dark" style={{fontSize: '0.875rem'}}>Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. acmecorp.com"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h5 className="mb-0 fw-semibold text-dark">Recruiter Contact & Status</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-4">
              <div className="col-12 col-md-6">
                <label htmlFor="recruiterName" className="form-label fw-medium text-dark" style={{fontSize: '0.875rem'}}>Recruiter Name</label>
                <input
                  type="text"
                  id="recruiterName"
                  name="recruiterName"
                  value={formData.recruiterName}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. Jane Smith"
                />
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="recruiterEmail" className="form-label fw-medium text-dark" style={{fontSize: '0.875rem'}}>Recruiter Email</label>
                <input
                  type="email"
                  id="recruiterEmail"
                  name="recruiterEmail"
                  value={formData.recruiterEmail}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="jane@acmecorp.com"
                />
              </div>

              <div className="col-12">
                <label htmlFor="status" className="form-label fw-medium text-dark" style={{fontSize: '0.875rem'}}>Partnership Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="ACTIVE">Active Partner</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-3 pt-2 border-top mt-4">
          <button type="button" onClick={() => navigate('/companies')} className="btn btn-light px-4 fw-medium">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary px-4 d-flex align-items-center gap-2" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <i className="bi bi-check2"></i>
            )}
            {isEditMode ? 'Update Company' : 'Save Company'}
          </button>
        </div>
      </form>
    </div>
  );
}
