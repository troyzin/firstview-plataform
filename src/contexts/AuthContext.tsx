
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
}

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isMaster: boolean;
  hasPermission: (requiredRole: string[]) => boolean;
}

const AuthContext = createContext<AuthContextProps>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  isAdmin: false,
  isMaster: false,
  hasPermission: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para buscar o perfil do usuário
  const fetchProfile = useCallback(async (userId: string) => {
    if (!userId) return null;
    
    try {
      console.log('[AUTH] Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AUTH] Error fetching user profile:', error);
        return null;
      }

      console.log('[AUTH] Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('[AUTH] Error in fetchProfile:', error);
      return null;
    }
  }, []);

  // Inicializar autenticação
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('[AUTH] Initializing auth...');
        
        // Obter sessão inicial
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        console.log('[AUTH] Initial session:', currentSession?.user?.id || 'No session');
        
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Buscar perfil apenas se houver um usuário autenticado
          const profileData = await fetchProfile(currentSession.user.id);
          if (mounted) {
            setProfile(profileData);
          }
        } else {
          // Sem sessão, definir tudo como nulo
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('[AUTH] Error in authentication initialization:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          console.log('[AUTH] Auth initialization complete, loading set to false');
        }
      }
    };

    // Configurar listener para mudanças de estado de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('[AUTH] Auth state changed:', event, newSession?.user?.id);
        
        if (!mounted) return;
        
        if (newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          
          const profileData = await fetchProfile(newSession.user.id);
          if (mounted) {
            setProfile(profileData);
          }
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
        
        setLoading(false);
        console.log('[AUTH] Auth state change complete, loading set to false');
      }
    );

    // Inicializar autenticação
    initializeAuth();

    // Limpeza ao desmontar
    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Função de logout
  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      toast.success("Logout realizado com sucesso");
    } catch (error) {
      console.error('[AUTH] Error logging out:', error);
      toast.error("Erro ao fazer logout");
    } finally {
      setLoading(false);
    }
  };

  // Verificações de permissão
  const isAdmin = profile?.role === 'admin';
  const isMaster = profile?.role === 'master';
  
  const hasPermission = useCallback((requiredRoles: string[]) => {
    if (!profile || !profile.role) return false;
    return requiredRoles.includes(profile.role);
  }, [profile]);

  // Valor do contexto
  const value = {
    session,
    user,
    profile,
    loading,
    signOut,
    isAdmin,
    isMaster,
    hasPermission,
  };

  console.log('[AUTH] Auth context state:', { 
    userId: user?.id, 
    profileRole: profile?.role, 
    loading
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
