import type { SubscriptionPlan } from './auth';

export interface PlanFeature {
  name: string;
  free: boolean | string;
  premium: boolean | string;
  premiumPlus: boolean | string;
}

export interface SubscriptionLimits {
  dailyMessages: number;
  maxTokens: number;
  memoryEntries: number;
  voiceEnabled: boolean;
  priorityProcessing: boolean;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, SubscriptionLimits> = {
  free: {
    dailyMessages: 50,
    maxTokens: 512,
    memoryEntries: 20,
    voiceEnabled: true,
    priorityProcessing: false,
  },
  premium: {
    dailyMessages: 500,
    maxTokens: 768,
    memoryEntries: 200,
    voiceEnabled: true,
    priorityProcessing: true,
  },
  premium_plus: {
    dailyMessages: 2000,
    maxTokens: 1024,
    memoryEntries: 1000,
    voiceEnabled: true,
    priorityProcessing: true,
  },
};

export const PLAN_FEATURES: PlanFeature[] = [
  { name: 'AI Chat Access', free: true, premium: true, premiumPlus: true },
  { name: 'Daily Messages', free: '50', premium: '500', premiumPlus: '2,000' },
  { name: 'Response Speed', free: 'Standard', premium: 'Fast', premiumPlus: 'Priority' },
  { name: 'AI Model Quality', free: 'Standard', premium: 'Enhanced', premiumPlus: 'Advanced' },
  { name: 'Memory Storage', free: '20 entries', premium: '200 entries', premiumPlus: '1,000 entries' },
  { name: 'Voice Assistant', free: true, premium: true, premiumPlus: true },
  { name: 'Priority Processing', free: false, premium: true, premiumPlus: true },
  { name: 'Advanced AI Tools', free: false, premium: false, premiumPlus: true },
];

export const PLAN_PRICES = {
  free: { monthly: 0, label: 'Free' },
  premium: { monthly: 9.99, label: 'Premium' },
  premium_plus: { monthly: 19.99, label: 'Premium Plus' },
} as const;
