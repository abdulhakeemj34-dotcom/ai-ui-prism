/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { UserProfile, LoginCredentials, SignupCredentials } from '@/types/auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { localAuth } from '@/lib/auth-local';

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSupabaseMode: boolean;
  signIn: (credentials: LoginCredentials) => Promise<{ error: string | null }>;
  signUp: (credentials: SignupCredentials) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<Pick<UserProfile, 'name' | 'avatarUrl'>>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapSupabaseUser(
  authUser: { id: string; email?: string; user_metadata?: Record<string, unknown>; created_at?: string },
  plan: UserProfile['subscriptionPlan'] = 'free',
): UserProfile {
  return {
    id: authUser.id,
    name: (authUser.user_metadata?.name as string) || authUser.email?.split('@')[0] || 'User',
    email: authUser.email ?? '',
    avatarUrl: authUser.user_metadata?.avatar_url as string | undefined,
    joinDate: authUser.created_at ?? new Date().toISOString(),
    subscriptionPlan: plan,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, avatar_url, subscription_plan, join_date')
          .eq('id', data.user.id)
          .maybeSingle();

        setUser(
          mapSupabaseUser(data.user, (profile?.subscription_plan as UserProfile['subscriptionPlan']) ?? 'free'),
        );
        if (profile?.name) {
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  name: profile.name,
                  avatarUrl: profile.avatar_url ?? prev.avatarUrl,
                  subscriptionPlan: (profile.subscription_plan as UserProfile['subscriptionPlan']) ?? prev.subscriptionPlan,
                  joinDate: profile.join_date ?? prev.joinDate,
                }
              : prev,
          );
        }
      } else {
        setUser(null);
      }
      return;
    }

    setUser(localAuth.getSession());
  }, []);

  useEffect(() => {
    const init = async () => {
      await refreshUser();
      setIsLoading(false);
    };
    void init();

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await refreshUser();
        } else {
          setUser(null);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [refreshUser]);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (error) return { error: error.message };
      await refreshUser();
      return { error: null };
    }

    const { user: localUser, error } = await localAuth.signIn(credentials);
    if (error) return { error };
    setUser(localUser);
    return { error: null };
  }, [refreshUser]);

  const signUp = useCallback(async (credentials: SignupCredentials) => {
    if (credentials.password !== credentials.confirmPassword) {
      return { error: 'Passwords do not match.' };
    }
    if (credentials.password.length < 6) {
      return { error: 'Password must be at least 6 characters.' };
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: { name: credentials.name },
        },
      });
      if (error) return { error: error.message };

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name: credentials.name,
          email: credentials.email,
          join_date: new Date().toISOString(),
          subscription_plan: 'free',
        });
        await refreshUser();
      }
      return { error: null };
    }

    const { user: localUser, error: localError } = await localAuth.signUp(credentials);
    if (localError) return { error: localError };
    setUser(localUser);
    return { error: null };
  }, [refreshUser]);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      await localAuth.signOut();
    }
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      return { error: error?.message ?? null };
    }
    return localAuth.resetPassword(email);
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<Pick<UserProfile, 'name' | 'avatarUrl'>>) => {
      if (!user) return;

      if (isSupabaseConfigured && supabase) {
        await supabase.from('profiles').update({
          name: updates.name,
          avatar_url: updates.avatarUrl,
        }).eq('id', user.id);
        await refreshUser();
        return;
      }

      const updated = await localAuth.updateProfile(user.id, updates);
      if (updated) setUser(updated);
    },
    [user, refreshUser],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        isSupabaseMode: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
