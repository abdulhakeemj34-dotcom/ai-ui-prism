import type { SubscriptionPlan } from '@/types/auth';

/**
 * Billing service — architecture ready for Stripe/payment gateway integration.
 * Currently applies plan changes locally without payment processing.
 */

export interface BillingSubscription {
  userId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface CheckoutSession {
  id: string;
  url: string;
  plan: SubscriptionPlan;
}

export const billingService = {
  async getSubscription(_userId: string): Promise<BillingSubscription | null> {
    void _userId;
    // Future: fetch from payment provider
    return null;
  },

  async createCheckoutSession(_userId: string, _plan: SubscriptionPlan): Promise<CheckoutSession> {
    void _userId;
    void _plan;
    // Future: Stripe checkout session
    throw new Error('Payment integration not yet configured.');
  },

  async cancelSubscription(_userId: string): Promise<void> {
    void _userId;
    // Future: cancel via payment provider
  },

  async handleWebhook(_payload: unknown, _signature: string): Promise<void> {
    void _payload;
    void _signature;
    // Future: process payment webhooks
  },
};
