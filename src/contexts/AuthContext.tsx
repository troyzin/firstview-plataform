
import React, { createContext, useContext, useState, useEffect } from "react";
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
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const fetchProfile = async (userId: string) => {
    if (!userId) return null;
    
    try {
      setFetchingProfile(true);
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      console.log('Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    } finally {
      setFetchingProfile(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        setLoading(true);
        
        const { data } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        console.log('Initial session:', data.session?.user?.id || 'No session');
        setSession(data.session);
        
        if (data.session?.user) {
          setUser(data.session.user);
          const profileData = await fetchProfile(data.session.user.id);
          if (mounted) {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Error in initial authentication:', error);
        toast.error("Erro ao carregar dados do usuário");
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialLoadComplete(true);
          console.log('Initial load complete');
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.id);
        
        if (!mounted) return;
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          const profileData = await fetchProfile(newSession.user.id);
          if (mounted) {
            setProfile(profileData);
          }
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      toast.success("Logout realizado com sucesso");
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error("Erro ao fazer logout");
    } finally {
      setLoading(false);
    }
  };

  // Check if user has admin role
  const isAdmin = profile?.role === 'admin';
  
  // Check if user has master role
  const isMaster = profile?.role === 'master';
  
  // Function to check if user has permission based on required roles
  const hasPermission = (requiredRoles: string[]) => {
    if (!profile || !profile.role) return false;
    return requiredRoles.includes(profile.role);
  };

  const value = {
    session,
    user,
    profile,
    loading: loading || fetchingProfile,
    signOut,
    isAdmin,
    isMaster,
    hasPermission,
  };

  console.log('Auth context value:', { 
    userId: user?.id, 
    profileRole: profile?.role, 
    loading, 
    fetchingProfile,
    initialLoadComplete
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
