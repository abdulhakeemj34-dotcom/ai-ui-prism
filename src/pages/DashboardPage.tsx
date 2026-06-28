import { Link } from 'react-router-dom';
import {
  MessageSquare,
  CheckSquare,
  StickyNote,
  Target,
  Wallet,
  Calendar,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/use-tasks';
import { useNotes } from '@/hooks/use-notes';
import { useGoals } from '@/hooks/use-goals';
import { useExpenses } from '@/hooks/use-expenses';
import { usePlanner } from '@/hooks/use-planner';
import { getRecentActivity } from '@/lib/user-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const quickActions = [
  { to: '/chat', icon: MessageSquare, label: 'Ask Nexora', color: 'text-blue-500' },
  { to: '/tasks', icon: CheckSquare, label: 'Add Task', color: 'text-green-500' },
  { to: '/notes', icon: StickyNote, label: 'New Note', color: 'text-amber-500' },
  { to: '/goals', icon: Target, label: 'Track Goal', color: 'text-purple-500' },
];

export function DashboardPage() {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const { notes } = useNotes();
  const { goals } = useGoals();
  const { analytics } = useExpenses();
  const { sessions: studySessions } = usePlanner();
  const activity = getRecentActivity(user?.id ?? null, 8);

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <section className="premium-gradient rounded-2xl p-6 text-primary-foreground shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm opacity-90">{greeting},</p>
            <h1 className="text-2xl font-bold md:text-3xl">{user?.name ?? 'User'}</h1>
            <p className="mt-1 text-sm opacity-80">Your AI-powered personal assistant is ready.</p>
          </div>
          <Sparkles className="hidden size-10 opacity-50 md:block" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map(({ to, icon: Icon, label, color }) => (
            <Button key={to} variant="outline" className="h-auto flex-col gap-2 py-4 glass-effect" asChild>
              <Link to={to}>
                <Icon className={color} size={22} />
                <span className="text-xs">{label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <CheckSquare size={16} /> Tasks
              </span>
              <Badge variant="secondary">{pendingTasks.length} pending</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center gap-2 text-sm">
                <div className="size-2 rounded-full bg-primary" />
                <span className="truncate">{task.title}</span>
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <p className="text-sm text-muted-foreground">All caught up!</p>
            )}
            <Button variant="ghost" size="sm" className="mt-2 w-full" asChild>
              <Link to="/tasks">
                View all <ArrowRight size={14} className="ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <StickyNote size={16} /> Notes
              </span>
              <Badge variant="secondary">{notes.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {notes.slice(0, 3).map((note) => (
              <div key={note.id} className="text-sm">
                <p className="truncate font-medium">{note.title}</p>
                <p className="truncate text-xs text-muted-foreground">{note.category}</p>
              </div>
            ))}
            {notes.length === 0 && (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            )}
            <Button variant="ghost" size="sm" className="mt-2 w-full" asChild>
              <Link to="/notes">
                View all <ArrowRight size={14} className="ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target size={16} /> Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {goals.slice(0, 2).map((goal) => {
              const pct = Math.min(100, (goal.currentValue / goal.targetValue) * 100);
              return (
                <div key={goal.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="truncate">{goal.title}</span>
                    <span className="text-muted-foreground">{Math.round(pct)}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
            {goals.length === 0 && (
              <p className="text-sm text-muted-foreground">Set your first goal.</p>
            )}
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link to="/goals">
                View goals <ArrowRight size={14} className="ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet size={16} /> Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Income</p>
                <p className="text-sm font-semibold text-green-500">${analytics.income.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Spent</p>
                <p className="text-sm font-semibold text-red-500">${analytics.totalExpenses.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="text-sm font-semibold">${analytics.balance.toFixed(0)}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="mt-3 w-full" asChild>
              <Link to="/expenses">
                View details <ArrowRight size={14} className="ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar size={16} /> Study Planner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{studySessions.length}</p>
            <p className="text-sm text-muted-foreground">Scheduled sessions this week</p>
            <Button variant="ghost" size="sm" className="mt-3 w-full" asChild>
              <Link to="/planner">
                Open planner <ArrowRight size={14} className="ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-effect md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activity.length === 0 && (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            )}
            {activity.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {completedTasks.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          {completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''} completed · Keep going!
        </p>
      )}
    </div>
  );
}
