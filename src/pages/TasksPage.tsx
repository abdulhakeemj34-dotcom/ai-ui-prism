import { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { useTasks } from '@/hooks/use-tasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function TasksPage() {
  const { tasks, addTask, deleteTask, toggleComplete } = useTasks();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleAdd = () => {
    if (!title.trim()) return;
    addTask(title, { priority });
    setTitle('');
  };

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Tasks</h1>
        <p className="text-sm text-muted-foreground">Manage your to-do list</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Add a new task…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1"
        />
        <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleAdd} size="icon" aria-label="Add task">
          <Plus size={18} />
        </Button>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Pending ({pending.length})</h2>
        {pending.map((task) => (
          <Card key={task.id} className="glass-effect">
            <CardContent className="flex items-center gap-3 p-4">
              <button
                onClick={() => toggleComplete(task.id)}
                className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-primary transition-colors hover:bg-primary/10"
                aria-label="Complete task"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{task.title}</p>
                <Badge
                  variant="outline"
                  className={cn(
                    'mt-1 text-[10px] capitalize',
                    task.priority === 'high' && 'border-red-500 text-red-500',
                    task.priority === 'medium' && 'border-amber-500 text-amber-500',
                  )}
                >
                  {task.priority}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                <Trash2 size={16} className="text-muted-foreground" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {pending.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No pending tasks.</p>
        )}
      </section>

      {completed.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Completed ({completed.length})</h2>
          {completed.map((task) => (
            <Card key={task.id} className="opacity-60">
              <CardContent className="flex items-center gap-3 p-4">
                <button
                  onClick={() => toggleComplete(task.id)}
                  className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  aria-label="Reopen task"
                >
                  <Check size={14} />
                </button>
                <p className="min-w-0 flex-1 truncate line-through">{task.title}</p>
                <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                  <Trash2 size={16} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
