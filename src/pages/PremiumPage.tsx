import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { PLAN_FEATURES, PLAN_PRICES } from '@/types/subscription';
import type { SubscriptionPlan } from '@/types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const plans: { id: SubscriptionPlan; icon: typeof Crown; highlight?: boolean }[] = [
  { id: 'free', icon: Sparkles },
  { id: 'premium', icon: Zap, highlight: true },
  { id: 'premium_plus', icon: Crown },
];

export function PremiumPage() {
  const { user } = useAuth();
  const { plan, dailyMessagesUsed, limits, upgradePlan } = useSubscription();

  const handleUpgrade = async (newPlan: SubscriptionPlan) => {
    if (!user) return;
    try {
      await upgradePlan(newPlan);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Payment integration is not configured.');
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Choose Your Plan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Unlock the full power of Nexora AI
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {dailyMessagesUsed} / {limits.dailyMessages} messages used today
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map(({ id, icon: Icon, highlight }) => (
          <Card
            key={id}
            className={cn(
              'relative glass-effect',
              highlight && 'border-primary shadow-lg shadow-primary/10',
              plan === id && 'ring-2 ring-primary',
            )}
          >
            {plan === id && (
              <Badge className="absolute -top-2 right-4">Current</Badge>
            )}
            <CardHeader className="text-center">
              <Icon className="mx-auto mb-2 size-8 text-primary" />
              <CardTitle>{PLAN_PRICES[id].label}</CardTitle>
              <CardDescription>
                {PLAN_PRICES[id].monthly === 0 ? (
                  'Free forever'
                ) : (
                  <>${PLAN_PRICES[id].monthly}/month</>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                {PLAN_FEATURES.slice(0, 5).map((feature) => {
                  const val =
                    id === 'free'
                      ? feature.free
                      : id === 'premium'
                        ? feature.premium
                        : feature.premiumPlus;
                  return (
                    <li key={feature.name} className="flex items-center gap-2">
                      {val === false ? (
                        <span className="size-4 text-muted-foreground">—</span>
                      ) : (
                        <Check size={14} className="text-green-500" />
                      )}
                      <span className="text-muted-foreground">
                        {feature.name}: {typeof val === 'string' ? val : val ? '✓' : '—'}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <Button
                className={cn('w-full', highlight && 'premium-gradient')}
                variant={plan === id ? 'outline' : 'default'}
                disabled={plan === id}
                onClick={() => handleUpgrade(id)}
              >
                {plan === id ? 'Current Plan' : id === 'free' ? 'Downgrade' : 'Upgrade'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Feature</th>
                <th className="py-2 text-center">Free</th>
                <th className="py-2 text-center">Premium</th>
                <th className="py-2 text-center">Premium Plus</th>
              </tr>
            </thead>
            <tbody>
              {PLAN_FEATURES.map((f) => (
                <tr key={f.name} className="border-b border-border/50">
                  <td className="py-2">{f.name}</td>
                  <td className="py-2 text-center">{String(f.free)}</td>
                  <td className="py-2 text-center">{String(f.premium)}</td>
                  <td className="py-2 text-center">{String(f.premiumPlus)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Payment integration is not configured yet. Plan changes must be verified by the backend.
      </p>
    </div>
  );
}
