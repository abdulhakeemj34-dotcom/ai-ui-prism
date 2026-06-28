import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useGoals } from '@/hooks/use-goals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';

export function GoalsPage() {
  const { goals, addGoal, deleteGoal, updateProgress } = useGoals();
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('100');

  const handleAdd = () => {
    if (!title.trim()) return;
    addGoal(title, Number(target) || 100);
    setTitle('');
    setTarget('100');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Goals</h1>
        <p className="text-sm text-muted-foreground">Track progress toward your milestones</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Goal title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="Target"
          type="number"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="w-24"
        />
        <Button onClick={handleAdd} size="icon">
          <Plus size={18} />
        </Button>
      </div>

      <div className="space-y-4">
        {goals.map((goal) => {
          const pct = Math.min(100, (goal.currentValue / goal.targetValue) * 100);
          return (
            <Card key={goal.id} className="glass-effect">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">{goal.title}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => deleteGoal(goal.id)}>
                  <Trash2 size={16} />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>{goal.currentValue}{goal.unit} / {goal.targetValue}{goal.unit}</span>
                  <span className="font-semibold">{Math.round(pct)}%</span>
                </div>
                <Progress value={pct} className="h-3" />
                <Slider
                  value={[goal.currentValue]}
                  min={0}
                  max={goal.targetValue}
                  step={1}
                  onValueChange={([v]) => updateProgress(goal.id, v)}
                />
                {goal.milestones.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {goal.milestones.map((m) => (
                      <span
                        key={m.id}
                        className={`rounded-full px-2 py-0.5 text-xs ${m.completed ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}
                      >
                        {m.title}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {goals.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">Set your first goal to get started.</p>
        )}
      </div>
    </div>
  );
}
