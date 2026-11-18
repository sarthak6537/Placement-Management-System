import React from 'react';
import { Link } from 'react-router-dom';

export default function AccessDenied() {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="text-center p-5 bg-white rounded shadow-sm" style={{ maxWidth: '500px' }}>
        <div className="text-danger mb-4">
          <i className="bi bi-shield-lock-fill" style={{ fontSize: '4rem' }}></i>
        </div>
        <h1 className="h3 fw-bold mb-3 text-dark">Access Denied</h1>
        <p className="text-muted mb-4">
          You do not have the required permissions to view this page. If you believe this is an error, please contact your administrator.
        </p>
        <Link to="/" className="btn btn-primary px-4 py-2 fw-medium">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
