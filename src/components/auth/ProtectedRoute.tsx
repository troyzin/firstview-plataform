
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
  const { user, profile, loading } = useAuth();
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

  // All permissions checks are temporarily disabled
  // Always render children for authenticated users
  console.log('[PROTECTED] Rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;
