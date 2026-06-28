import type { SubscriptionPlan } from './auth.js';

interface UsageBucket {
  minuteWindowStart: number;
  minuteCount: number;
  day: string;
  dayCount: number;
}

const usageByUser = new Map<string, UsageBucket>();

const PLAN_LIMITS: Record<SubscriptionPlan, { perMinute: number; perDay: number }> = {
  free: { perMinute: 8, perDay: 50 },
  premium: { perMinute: 30, perDay: 500 },
  premium_plus: { perMinute: 60, perDay: 2000 },
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export function checkAiRateLimit(userId: string, plan: SubscriptionPlan) {
  const now = Date.now();
  const today = getToday();
  const limits = PLAN_LIMITS[plan];
  const existing = usageByUser.get(userId);

  const bucket: UsageBucket =
    existing && existing.day === today
      ? existing
      : {
          minuteWindowStart: now,
          minuteCount: 0,
          day: today,
          dayCount: 0,
        };

  if (now - bucket.minuteWindowStart >= 60_000) {
    bucket.minuteWindowStart = now;
    bucket.minuteCount = 0;
  }

  if (bucket.minuteCount >= limits.perMinute) {
    return {
      allowed: false,
      statusCode: 429,
      error: 'Too many AI requests. Please wait a minute and try again.',
    };
  }

  if (bucket.dayCount >= limits.perDay) {
    return {
      allowed: false,
      statusCode: 429,
      error: 'Daily AI message limit reached for your current plan.',
    };
  }

  bucket.minuteCount += 1;
  bucket.dayCount += 1;
  usageByUser.set(userId, bucket);

  return {
    allowed: true,
    remainingToday: Math.max(0, limits.perDay - bucket.dayCount),
  };
}
