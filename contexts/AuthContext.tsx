import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signUpAdmin: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const user = session?.user || null;
  const isAdmin = user?.user_metadata?.role === 'admin';

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined, // Disable email confirmation
      },
    });
    return { error };
  };

  const signUpAdmin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined, // Disable email confirmation
        data: {
          role: 'admin', // Set admin role in user metadata
        },
      },
    });
    return { error };
  };

  const deleteAccount = async () => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    try {
      // Delete user's posts first (due to foreign key constraints)
      const { error: lostFoundError } = await supabase
        .from('lost_found_posts')
        .delete()
        .eq('user_id', user.id);

      if (lostFoundError) throw lostFoundError;

      const { error: jobPostsError } = await supabase
        .from('job_posts')
        .delete()
        .eq('user_id', user.id);

      if (jobPostsError) throw jobPostsError;

      // Delete news posts if user is admin
      if (isAdmin) {
        const { error: newsPostsError } = await supabase
          .from('news_posts')
          .delete()
          .eq('author_id', user.id);

        if (newsPostsError) throw newsPostsError;
      }

      // Finally, delete the user account
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteUserError) {
        // If admin delete fails, try user delete (for self-deletion)
        const { error: userDeleteError } = await supabase.rpc('delete_user');
        if (userDeleteError) throw userDeleteError;
      }

      // Sign out after successful deletion
      await supabase.auth.signOut();
      
      return { error: null };
    } catch (error) {
      console.error('Error deleting account:', error);
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    isAdmin,
    loading,
    signIn,
    signUp,
    signUpAdmin,
    signOut,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}