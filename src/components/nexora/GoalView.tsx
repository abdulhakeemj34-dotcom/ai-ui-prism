import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, TrendingUp, MoreVertical, Trophy } from 'lucide-react';
import { useGoals } from '@/hooks/use-goals';
import { Button } from '@/components/ui/button';
import { GlassCard } from './UI/GlassCard';
import { Progress } from '@/components/ui/progress';

export function GoalView() {
  const { goals, updateGoalProgress } = useGoals();

  const handleUpdate = (id: string, increment: number) => {
    updateGoalProgress(id, increment);
  };

  const avgProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + (g.current / g.target) * 100, 0) / goals.length)
    : 0;

  const completedGoals = goals.filter(g => g.current >= g.target).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-4 bg-primary/10 border-primary/20">
          <Trophy className="text-primary mb-2" size={20} />
          <h4 className="text-2xl font-bold">{completedGoals}</h4>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Completed</p>
        </GlassCard>
        <GlassCard className="p-4 bg-blue-500/10 border-blue-500/20">
          <TrendingUp className="text-blue-500 mb-2" size={20} />
          <h4 className="text-2xl font-bold">{avgProgress}%</h4>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Avg Progress</p>
        </GlassCard>
      </div>

      <div className="space-y-4">
        {goals.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          return (
            <GlassCard key={goal.id} className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{goal.category}</span>
                  <h3 className="font-bold text-lg">{goal.title}</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <MoreVertical size={16} />
                </Button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{goal.current} / {goal.target}</span>
                  <span className="text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 rounded-xl h-9 text-xs"
                  onClick={() => handleUpdate(goal.id, -1)}
                >
                  -1
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 rounded-xl h-9 text-xs"
                  onClick={() => handleUpdate(goal.id, 1)}
                >
                  +1
                </Button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <Button className="w-full h-14 rounded-2xl bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all font-bold">
        <Plus size={20} className="mr-2" />
        Create New Goal
      </Button>
    </div>
  );
}
