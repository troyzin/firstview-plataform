
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredActions?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [],
  requiredActions = []
}) => {
  const { user, profile, loading, hasPermission, hasAction } = useAuth();
  const location = useLocation();

  console.log('[PROTECTED] Route check:', { 
    path: location.pathname,
    userId: user?.id,
    profileRole: profile?.role,
    loading,
    requiredRoles,
    requiredActions
  });

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        <p className="ml-2 text-white">Carregando autenticação...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('[PROTECTED] User not authenticated, redirecting to /auth');
    toast.error("Você precisa estar logado para acessar essa página");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role-based permissions if specified
  if (requiredRoles.length > 0 && !hasPermission(requiredRoles)) {
    console.log('[PROTECTED] Role access denied, redirecting to /');
    toast.error("Você não tem permissão para acessar essa página");
    return <Navigate to="/" replace />;
  }

  // Check action-based permissions if specified
  if (requiredActions.length > 0 && !requiredActions.every(action => hasAction(action))) {
    console.log('[PROTECTED] Action access denied, redirecting to /');
    toast.error("Você não tem permissão para realizar esta ação");
    return <Navigate to="/" replace />;
  }

  // If authenticated and has required permissions, render children
  console.log('[PROTECTED] Rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;
