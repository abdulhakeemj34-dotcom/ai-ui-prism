import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  CheckSquare,
  StickyNote,
  Target,
  Wallet,
  Calendar,
  Settings,
  Crown,
  User,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/nexora/UI/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/contexts/SubscriptionContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chat', icon: MessageSquare, label: 'AI Chat' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/notes', icon: StickyNote, label: 'Notes' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/expenses', icon: Wallet, label: 'Expenses' },
  { to: '/planner', icon: Calendar, label: 'Planner' },
];

const bottomItems = [
  { to: '/premium', icon: Crown, label: 'Premium' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const { plan } = useSubscription();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border/60 bg-sidebar">
      <div className="flex h-14 items-center border-b border-border/60 px-4">
        <Logo size={28} />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3 custom-scrollbar">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        <Separator className="my-3" />

        {bottomItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border/60 p-3">
        <div className="mb-3 rounded-lg bg-muted/50 p-3">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          <Badge variant="secondary" className="mt-2 capitalize">
            {plan.replace('_', ' ')}
          </Badge>
        </div>
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleSignOut}>
          <LogOut size={16} />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
