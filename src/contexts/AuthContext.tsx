
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

// Define permissions by role
const ROLE_PERMISSIONS = {
  user: [
    'view_productions', 
    'view_clients', 
    'view_equipment', 
    'view_reports', 
    'view_team'
  ],
  admin: [
    'view_productions', 
    'view_clients', 
    'view_equipment', 
    'view_reports', 
    'view_team',
    'add_production', 
    'edit_production', 
    'cancel_production', 
    'add_client', 
    'edit_client'
  ],
  master: [
    'view_productions', 
    'view_clients', 
    'view_equipment', 
    'view_reports', 
    'view_team',
    'add_production', 
    'edit_production', 
    'cancel_production', 
    'add_client', 
    'edit_client',
    'add_equipment',
    'edit_equipment',
    'remove_equipment'
  ],
};

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isMaster: boolean;
  hasPermission: (requiredRole: string[]) => boolean;
  hasAction: (action: string) => boolean;
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
  hasAction: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Fetch profile data
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log('[AUTH] Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AUTH] Error fetching profile:', error.message);
        return null;
      }

      console.log('[AUTH] Profile fetched:', data);
      return data;
    } catch (error) {
      console.error('[AUTH] Unexpected error in fetchProfile:', error);
      return null;
    }
  }, []);

  // Update auth state based on session
  const updateAuthState = useCallback(async (currentSession: Session | null) => {
    try {
      console.log('[AUTH] Updating auth state with session:', currentSession?.user?.id || 'No session');
      
      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        
        const profileData = await fetchProfile(currentSession.user.id);
        setProfile(profileData);
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('[AUTH] Error updating auth state:', error);
    }
  }, [fetchProfile]);

  // Initialize auth once
  useEffect(() => {
    if (initialized) return;
    
    let mounted = true;
    console.log('[AUTH] Initializing auth system');
    
    const initAuth = async () => {
      try {
        // Get initial session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AUTH] Error getting session:', error.message);
          if (mounted) setLoading(false);
          return;
        }
        
        if (mounted) {
          await updateAuthState(data.session);
          setInitialized(true);
          setLoading(false);
          console.log('[AUTH] Auth initialized, loading set to false');
        }
      } catch (error) {
        console.error('[AUTH] Error in auth initialization:', error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };
    
    initAuth();
    
    return () => {
      mounted = false;
    };
  }, [initialized, updateAuthState]);

  // Listen for auth changes
  useEffect(() => {
    if (!initialized) return;
    
    console.log('[AUTH] Setting up auth state change listener');
    
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        console.log('[AUTH] Auth state changed, new session:', newSession?.user?.id || 'No session');
        await updateAuthState(newSession);
      }
    );
    
    return () => {
      console.log('[AUTH] Removing auth state change listener');
      listener.subscription.unsubscribe();
    };
  }, [initialized, updateAuthState]);

  // Sign out function
  const signOut = async () => {
    try {
      console.log('[AUTH] Signing out');
      await supabase.auth.signOut();
      toast.success("Logout realizado com sucesso");
    } catch (error) {
      console.error('[AUTH] Error signing out:', error);
      toast.error("Erro ao fazer logout");
    }
  };

  // Role-based permission checks
  const isAdmin = profile?.role === 'admin';
  const isMaster = profile?.role === 'master';
  
  const hasPermission = useCallback((requiredRoles: string[]) => {
    if (!profile?.role) return false;
    return requiredRoles.includes(profile.role);
  }, [profile]);

  // Action-based permission check
  const hasAction = useCallback((action: string) => {
    if (!profile?.role) return false;
    const role = profile.role as keyof typeof ROLE_PERMISSIONS;
    return ROLE_PERMISSIONS[role]?.includes(action) || false;
  }, [profile]);

  // Auth context value
  const value = {
    session,
    user,
    profile,
    loading,
    signOut,
    isAdmin,
    isMaster,
    hasPermission,
    hasAction,
  };

  console.log('[AUTH] Context state:', { 
    userId: user?.id, 
    profileRole: profile?.role, 
    loading,
    initialized
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
