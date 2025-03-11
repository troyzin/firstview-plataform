
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { user, loading, hasPermission } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute:', { 
    path: location.pathname,
    user: user?.id,
    loading,
    requiredRoles,
    hasPermission: requiredRoles.length > 0 ? hasPermission(requiredRoles) : 'N/A'
  });

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('Not authenticated, redirecting to /auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (requiredRoles.length > 0 && !hasPermission(requiredRoles)) {
    console.log('Access denied, redirecting to /');
    // Redirect to dashboard with access denied message
    return <Navigate to="/" replace />;
  }

  // If authenticated and has required permissions, render children
  console.log('Rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;
