
import React from "react";
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

  console.log('[PROTECTED] Route check:', { 
    path: location.pathname,
    userId: user?.id,
    profileRole: profile?.role,
    loading,
    requiredRoles
  });

  // Mostrar estado de carregamento
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Redirecionar para login se não estiver autenticado
  if (!user) {
    console.log('[PROTECTED] User not authenticated, redirecting to /auth');
    toast.error("Você precisa estar logado para acessar essa página");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Verificar permissões baseadas em papel se especificadas
  if (requiredRoles.length > 0 && !hasPermission(requiredRoles)) {
    console.log('[PROTECTED] Access denied, redirecting to /');
    toast.error("Você não tem permissão para acessar essa página");
    return <Navigate to="/" replace />;
  }

  // Se autenticado e com permissões necessárias, renderizar filhos
  console.log('[PROTECTED] Rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;
