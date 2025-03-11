
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { user, profile, loading, hasPermission } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Você precisa estar logado para acessar essa página");
    } else if (!loading && user && requiredRoles.length > 0 && !hasPermission(requiredRoles)) {
      toast.error("Você não tem permissão para acessar essa página");
    }
  }, [loading, user, requiredRoles, hasPermission]);

  console.log('ProtectedRoute:', { 
    path: location.pathname,
    userId: user?.id,
    profileRole: profile?.role,
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
    return <Navigate to="/" replace />;
  }

  // If authenticated and has required permissions, render children
  console.log('Rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;
