/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { SubscriptionPlan } from '@/types/auth';
import { PLAN_LIMITS } from '@/types/subscription';
import { useAuth } from '@/contexts/AuthContext';
import { loadUserData } from '@/lib/user-storage';
import { billingService } from '@/services/billing.service';

interface SubscriptionContextValue {
  plan: SubscriptionPlan;
  limits: (typeof PLAN_LIMITS)[SubscriptionPlan];
  dailyMessagesUsed: number;
  canSendMessage: boolean;
  incrementUsage: () => void;
  upgradePlan: (plan: SubscriptionPlan) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

function getUsageKey() {
  const today = new Date().toISOString().slice(0, 10);
  return `message_usage_${today}`;
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const plan = user?.subscriptionPlan ?? 'free';
  const limits = PLAN_LIMITS[plan];

  const [dailyMessagesUsed, setDailyMessagesUsed] = useState(() =>
    loadUserData<number>(user?.id ?? null, getUsageKey(), 0),
  );

  useEffect(() => {
    setDailyMessagesUsed(loadUserData<number>(user?.id ?? null, getUsageKey(), 0));
  }, [user?.id]);

  const incrementUsage = useCallback(() => {
    setDailyMessagesUsed((prev) => prev);
  }, []);

  const canSendMessage = true;

  const upgradePlan = useCallback(
    async (newPlan: SubscriptionPlan) => {
      if (!user) return;
      await billingService.createCheckoutSession(user.id, newPlan);
    },
    [user],
  );

  const value = useMemo(
    () => ({
      plan,
      limits,
      dailyMessagesUsed,
      canSendMessage,
      incrementUsage,
      upgradePlan,
    }),
    [plan, limits, dailyMessagesUsed, canSendMessage, incrementUsage, upgradePlan],
  );

  return (
    <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
