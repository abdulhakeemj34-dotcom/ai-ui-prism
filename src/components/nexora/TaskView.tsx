import React, { useState } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle2, Trash2, Star } from 'lucide-react';
import { useTasks } from '@/hooks/use-tasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from './UI/GlassCard';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export function TaskView() {
  const { tasks, addTask, toggleTask, deleteTask, reorderTasks, toggleImportant } = useTasks();
  const [newTask, setNewTask] = useState('');

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    addTask(newTask);
    setNewTask('');
    toast.success('Task added');
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-2">
        <Input 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          placeholder="New task..."
          className="h-12 bg-card/40 border-border/60 rounded-2xl"
        />
        <Button onClick={handleAddTask} size="icon" className="h-12 w-12 rounded-2xl shrink-0 shadow-lg shadow-primary/10">
          <Plus size={24} />
        </Button>
      </div>

      <Reorder.Group axis="y" values={tasks} onReorder={reorderTasks} className="space-y-3 pb-24">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <Reorder.Item
              key={task.id}
              value={task}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              layout
            >
              <GlassCard className={`p-4 flex items-center group relative overflow-hidden ${task.completed ? 'opacity-60' : ''}`}>
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="w-5 h-5 rounded-full border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <span className={`flex-1 ml-4 text-sm font-medium transition-all ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {task.text}
                </span>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => toggleImportant(task.id)}
                    className={`p-1.5 rounded-lg transition-colors ${task.important ? 'text-amber-500 bg-amber-500/10' : 'text-muted-foreground hover:bg-secondary'}`}
                  >
                    <Star size={18} fill={task.important ? 'currentColor' : 'none'} />
                  </button>
                  <button 
                    onClick={() => {
                      deleteTask(task.id);
                      toast.error('Task deleted');
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </GlassCard>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>
      
      {tasks.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center text-muted-foreground opacity-50">
          <CheckCircle2 size={48} strokeWidth={1} className="mb-2" />
          <p className="text-sm">All clear! Relax or add a task.</p>
        </div>
      )}
    </div>
  );
}
