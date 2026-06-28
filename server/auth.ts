import type { Request } from 'express';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type SubscriptionPlan = 'free' | 'premium' | 'premium_plus';

export interface AuthenticatedRequestContext {
  userId: string;
  email?: string;
  plan: SubscriptionPlan;
  authMode: 'supabase' | 'local-dev';
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export const isServerSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'your_supabase_project_url' &&
    supabaseAnonKey !== 'your_supabase_anon_key',
);

const supabase: SupabaseClient | null = isServerSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

function getBearerToken(req: Request): string | null {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim() || null;
}

function toPlan(value: unknown): SubscriptionPlan {
  return value === 'premium' || value === 'premium_plus' ? value : 'free';
}

async function getPlanForUser(userId: string): Promise<SubscriptionPlan> {
  if (!supabase) return 'free';

  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_plan')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn(`Could not load subscription plan for ${userId}: ${error.message}`);
    return 'free';
  }

  return toPlan(data?.subscription_plan);
}

export async function authenticateRequest(req: Request): Promise<AuthenticatedRequestContext> {
  if (!supabase) {
    return {
      userId: 'local-dev-user',
      plan: 'free',
      authMode: 'local-dev',
    };
  }

  const token = getBearerToken(req);
  if (!token) {
    throw Object.assign(new Error('Authentication required.'), { statusCode: 401 });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw Object.assign(new Error('Invalid or expired session.'), { statusCode: 401 });
  }

  return {
    userId: data.user.id,
    email: data.user.email,
    plan: await getPlanForUser(data.user.id),
    authMode: 'supabase',
  };
}
