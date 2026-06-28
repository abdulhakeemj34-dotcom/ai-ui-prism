import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { plan } = useSubscription();
  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ name: name.trim() });
    setSaving(false);
    toast.success('Profile updated');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'U';

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account details</p>
      </div>

      <Card className="glass-effect">
        <CardContent className="flex flex-col items-center gap-4 p-6">
          <Avatar className="size-20">
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback className="text-lg premium-gradient text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Badge className="mt-2 capitalize">{plan.replace('_', ' ')}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email ?? ''} disabled />
          </div>
          <div className="space-y-2">
            <Label>Member since</Label>
            <Input
              value={user?.joinDate ? format(new Date(user.joinDate), 'MMMM d, yyyy') : ''}
              disabled
            />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full" asChild>
        <Link to="/premium">
          <Crown size={16} className="mr-2" />
          Manage subscription
        </Link>
      </Button>
    </div>
  );
}
