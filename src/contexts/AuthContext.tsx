import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** Signed in, but with no email yet — a guest. Drives the soft wall. */
  isAnonymous: boolean;
  /** Holds the admin role. Every visitor is signed in, so "is there a user"
   *  stopped being a meaningful check the moment anonymous sign-in landed. */
  isAdmin: boolean;
  adminChecked: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        // Nobody is signed in, so sign this browser in anonymously. The visitor
        // sees nothing — no form, no email — but they now hold a real auth.uid(),
        // which is what lets RLS scope their submissions and progress to them
        // instead of leaving those tables world-readable.
        //
        // supabase-js persists the session, so this creates one anonymous user
        // per browser, not one per page load. signUp() below upgrades that same
        // user in place, which is why signing up never loses progress.
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          // Anonymous sign-in disabled or rate-limited: fall back to a signed-out
          // session rather than blocking the page. Reads scoped to auth.uid()
          // return nothing, which degrades progress tracking but keeps the site up.
          console.error('Anonymous sign-in failed:', error.message);
          setLoading(false);
        }
        // On success onAuthStateChange fires with the new session.
        return;
      }
      setSession(session);
      setUser(session.user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Asked of the database, not inferred from the session: is_admin() is the same
  // function the RLS policies use, so the UI and the data agree by construction.
  useEffect(() => {
    let cancelled = false;

    // Invalidate the previous answer BEFORE asking again. Without this, the
    // moment a sign-in replaces the anonymous user the context still reports
    // `adminChecked: true, isAdmin: false` from the anonymous check — and every
    // consumer acts on it. That is what sent a real admin to the home page
    // straight after a successful sign-in: the redirect ran on the previous
    // user's answer.
    setAdminChecked(false);
    setIsAdmin(false);

    const check = async () => {
      if (!user || user.is_anonymous) {
        if (!cancelled) { setIsAdmin(false); setAdminChecked(true); }
        return;
      }
      const { data, error } = await supabase.rpc('is_admin' as never);
      if (!cancelled) {
        setIsAdmin(!error && data === true);
        setAdminChecked(true);
      }
    };
    void check();
    return () => { cancelled = true; };
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    // An anonymous visitor is upgraded in place: updateUser attaches credentials
    // to the SAME auth.uid(), so every solve, streak and XP row they already own
    // stays theirs. Calling signUp() here instead would mint a second user and
    // silently abandon everything they did before signing up.
    if (user?.is_anonymous) {
      const { error } = await supabase.auth.updateUser({ email, password });
      return { error };
    }

    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    isAnonymous: user?.is_anonymous === true,
    isAdmin,
    adminChecked,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};