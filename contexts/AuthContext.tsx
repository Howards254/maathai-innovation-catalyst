import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: SupabaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updatePasswordWithToken: (token: string, newPassword: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      // Check if email is verified
      if (data.user && !data.user.email_confirmed_at) {
        // Sign out the user immediately if email is not verified
        await supabase.auth.signOut();
        throw new Error('Please verify your email before signing in. Check your inbox for the confirmation link.');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string, username: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username,
          }
        }
      });
      
      if (error) {
        // Provide more helpful error messages for specific cases
        if (error.message.includes('already registered')) {
          throw new Error('This email is already registered. Please sign in or use a different email.');
        }
        if (error.message.includes('password') && error.message.includes('at least')) {
          throw new Error('Password must be at least 6 characters long.');
        }
        // Let other errors pass through as-is from Supabase
        throw error;
      }
      
      // Check if user was created but email confirmation is required
      if (data.user && !data.session) {
        // User created but needs to confirm email - this is expected behavior
        return;
      }
      
      // If user already exists but is unconfirmed, data.user will be null
      if (!data.user) {
        throw new Error('Unable to create account. This email may already be registered.');
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPasswordForEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  };
const updatePasswordWithToken = async (token: string, newPassword: string) => {
    // Set the session using the recovery token
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: token,
    });
    
    if (sessionError) throw new Error('Invalid or expired reset token');

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (updateError) throw updateError;

    // Sign out immediately after password reset
    await supabase.auth.signOut();
  };

  const resendVerificationEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    if (error) throw error;
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPasswordForEmail,
    updatePassword,
    updatePasswordWithToken,
    resendVerificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};