import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabase';
import { Profile, UserRole } from '@/src/types/database';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  userRole: UserRole | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (data: { full_name?: string; phone?: string; avatar_url?: string }) => Promise<{ error: Error | null }>;
  uploadAvatar: (uri: string) => Promise<{ url: string | null; error: Error | null }>;
  // RBAC helpers
  canAccessTeam: boolean;
  canRecordAttendance: boolean;
  canSendNotifications: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userRole = profile?.role ?? null;

  // RBAC computed properties
  const canAccessTeam = userRole !== null &&
    ['socio_deportivo', 'dt', 'delegado'].includes(userRole);

  const canRecordAttendance = userRole !== null &&
    ['dt', 'delegado', 'admin'].includes(userRole);

  const canSendNotifications = userRole !== null &&
    ['dt', 'delegado', 'admin'].includes(userRole);

  const isAdmin = userRole === 'admin';

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as Profile;
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }

        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone }
      }
    });

    if (error) {
      console.error('Signup error:', error.message, error);
      return { error };
    }

    // Profile is created automatically by database trigger (handle_new_user)
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'csapp://reset-password',
    });
    return { error };
  };

  const updateProfile = async (data: { full_name?: string; phone?: string; avatar_url?: string }) => {
    if (!user?.id) {
      return { error: new Error('No user logged in') };
    }

    const { error } = await (supabase
      .from('profiles') as any)
      .update(data)
      .eq('id', user.id);

    if (!error) {
      await refreshProfile();
    }

    return { error };
  };

  const uploadAvatar = async (uri: string): Promise<{ url: string | null; error: Error | null }> => {
    if (!user?.id) {
      return { url: null, error: new Error('No user logged in') };
    }

    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { url: null, error: uploadError };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return { url: publicUrl, error: null };
    } catch (err) {
      console.error('Avatar upload error:', err);
      return { url: null, error: err as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        userRole,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        resetPassword,
        updateProfile,
        uploadAvatar,
        canAccessTeam,
        canRecordAttendance,
        canSendNotifications,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
