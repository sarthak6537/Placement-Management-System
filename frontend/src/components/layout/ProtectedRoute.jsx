import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && user.roles) {
    // Check if user has at least one of the required roles
    const hasRequiredRole = user.roles.some(role => allowedRoles.includes(role));
    if (!hasRequiredRole) {
      return <Navigate to="/access-denied" replace />;
    }
  }

  return children ? children : <Outlet />;
}
