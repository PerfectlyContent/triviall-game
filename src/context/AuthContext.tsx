import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, getProfile } from '../services/supabase';
import type { UserProfile } from '../types';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  canPlay: boolean;
  gamesRemaining: number;
  isPro: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const FREE_GAME_LIMIT = 3;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const p = await getProfile(userId);
      setProfile(p);
    } catch {
      // Profile may not exist yet (trigger hasn't fired), retry once after delay
      await new Promise(r => setTimeout(r, 1000));
      try {
        const p = await getProfile(userId);
        setProfile(p);
      } catch {
        // Create a default profile object for display until DB syncs
        setProfile({
          id: userId,
          display_name: null,
          avatar_url: null,
          games_played: 0,
          subscription_status: 'free',
          stripe_customer_id: null,
          created_at: new Date().toISOString(),
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!supabase || initializedRef.current) {
      setLoading(false);
      return;
    }
    initializedRef.current = true;

    // Handle OAuth code exchange before getSession
    // This is critical: when Supabase redirects back with ?code=..., we must
    // exchange it before the router strips the params or redirects away.
    const initSession = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code) {
        console.log('[Auth] OAuth code detected, exchanging for session...');
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error('[Auth] Code exchange failed:', exchangeError.message);
        } else {
          console.log('[Auth] Code exchange succeeded:', data.session?.user?.email);
        }
        // Clean the code from the URL to prevent re-exchange
        window.history.replaceState({}, '', window.location.pathname);
      }

      const { data: { session: s }, error } = await supabase.auth.getSession();
      console.log('[Auth] getSession result:', { user: s?.user?.email, error: error?.message });
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        await fetchProfile(s.user.id);
      }
      setLoading(false);
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        console.error('[Auth] onAuthStateChange:', _event, s?.user?.email);
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          fetchProfile(s.user.id);
        } else {
          setProfile(null);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: displayName } },
    });
    return { error: error?.message ?? null };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  const gamesPlayed = profile?.games_played ?? 0;
  const isPro = profile?.subscription_status === 'active';
  const canPlay = gamesPlayed < FREE_GAME_LIMIT || isPro;
  const gamesRemaining = isPro ? Infinity : Math.max(0, FREE_GAME_LIMIT - gamesPlayed);

  const value: AuthContextValue = {
    user,
    profile,
    session,
    loading,
    canPlay,
    gamesRemaining,
    isPro,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
