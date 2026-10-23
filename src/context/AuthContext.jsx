import React, { useEffect, useState, useCallback } from 'react';
import { supabase, isConfigured } from '../lib/supabaseClient';
import { AuthContext } from './authContextInstance';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch or ensure profile exists for the user
  const fetchProfile = useCallback(async (userId, userEmail, userMetaName) => {
    if (!userId || !isConfigured) {
      setProfile(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('[AuthContext] Error fetching profile:', error);
      }

      if (data) {
        setProfile(data);
      } else {
        // Fallback: If database trigger was delayed or bypassed, ensure profile exists
        const defaultName = userMetaName || userEmail?.split('@')[0] || 'Staff Counsellor';
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name: defaultName,
            role: 'counsellor',
          })
          .select()
          .single();

        if (!insertError && newProfile) {
          setProfile(newProfile);
        } else {
          // In case of permission restriction, set local fallback state
          setProfile({
            id: userId,
            full_name: defaultName,
            role: 'counsellor',
          });
        }
      }
    } catch (err) {
      console.error('[AuthContext] Unexpected error resolving profile:', err);
      setProfile({
        id: userId,
        full_name: userMetaName || userEmail?.split('@')[0] || 'Staff Member',
        role: 'counsellor',
      });
    }
  }, []);

  // Initialize session and listen to auth changes
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        if (!isConfigured) {
          // Demo fallback when running without credentials
          setLoading(false);
          return;
        }

        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[AuthContext] Error retrieving session:', error);
        }

        if (mounted) {
          if (initialSession?.user) {
            setSession(initialSession);
            setUser(initialSession.user);
            await fetchProfile(
              initialSession.user.id,
              initialSession.user.email,
              initialSession.user.user_metadata?.full_name
            );
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('[AuthContext] Auth initialization error:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    // Listen to Supabase auth state change events (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(
            currentUser.id,
            currentUser.email,
            currentUser.user_metadata?.full_name
          );
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign In with email & password
  const signInWithPassword = async ({ email, password }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Sign Up with email, password, and full name
  const signUp = async ({ email, password, fullName }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('[AuthContext] Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch active profile from database
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email, user.user_metadata?.full_name);
    }
  };

  const role = profile?.role || 'counsellor';
  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isCounsellor = role === 'counsellor';

  const value = {
    session,
    user,
    profile,
    role,
    isAdmin,
    isManager,
    isCounsellor,
    loading,
    signInWithPassword,
    signUp,
    signOut,
    refreshProfile,
    isConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
