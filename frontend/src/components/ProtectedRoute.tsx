// Enhanced ProtectedRoute.tsx with role-based access
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import type { RootState } from '../store/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'librarian' | 'member';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { token, user } = useSelector((state: RootState) => state.auth);

  // Check if user is authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if required
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to unauthorized page or appropriate dashboard
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;