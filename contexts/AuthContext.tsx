
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { Tables } from '@/app/integrations/supabase/types';
import { Alert } from 'react-native';

type Profile = Tables<'profiles'>;

interface AuthContextType {
  user: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string; mustChangePassword?: boolean }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; message: string }>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile data for authenticated user
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session ? 'Found' : 'Not found');
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id).then(profile => {
          setUser(profile);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session ? 'Session exists' : 'No session');
      setSession(session);
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string; mustChangePassword?: boolean }> => {
    try {
      console.log('Attempting login for username:', username);
      
      // First, get the email from the username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email, must_change_password, is_active')
        .eq('username', username)
        .single();

      if (profileError || !profileData) {
        console.error('Profile lookup error:', profileError);
        return { success: false, message: 'Invalid username or password' };
      }

      if (!profileData.is_active) {
        return { success: false, message: 'Account is inactive. Please contact your manager.' };
      }

      // Attempt to sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password: password,
      });

      if (error) {
        console.error('Login error:', error);
        return { success: false, message: error.message || 'Invalid username or password' };
      }

      if (data.user) {
        const profile = await fetchProfile(data.user.id);
        setUser(profile);
        setSession(data.session);
        
        return { 
          success: true, 
          message: 'Login successful',
          mustChangePassword: profileData.must_change_password 
        };
      }

      return { success: false, message: 'Login failed' };
    } catch (error) {
      console.error('Login exception:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshProfile = async () => {
    if (session?.user) {
      const profile = await fetchProfile(session.user.id);
      setUser(profile);
    }
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'No user logged in' };
    }

    try {
      // Employees cannot update username or full_name
      if (user.role === 'employee') {
        const { username, full_name, role, ...allowedUpdates } = updates;
        updates = allowedUpdates;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Update profile error:', error);
        return { success: false, message: error.message };
      }

      await refreshProfile();
      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      console.error('Update profile exception:', error);
      return { success: false, message: 'An error occurred while updating profile' };
    }
  };

  const changePassword = async (newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Change password error:', error);
        return { success: false, message: error.message };
      }

      // Update must_change_password flag
      if (user?.must_change_password) {
        await supabase
          .from('profiles')
          .update({ must_change_password: false })
          .eq('id', user.id);
        
        await refreshProfile();
      }

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      console.error('Change password exception:', error);
      return { success: false, message: 'An error occurred while changing password' };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      isAuthenticated: !!user, 
      isLoading,
      login, 
      logout,
      refreshProfile,
      updateProfile,
      changePassword
    }}>
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
