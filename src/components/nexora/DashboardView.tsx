import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, FileText, TrendingUp, PieChart, ChevronRight, BookOpen } from 'lucide-react';
import { useNotes } from '@/hooks/use-notes';
import { useTasks } from '@/hooks/use-tasks';
import { useGoals } from '@/hooks/use-goals';
import { GlassCard } from './UI/GlassCard';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useIntelligence } from '@/hooks/use-intelligence';
import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

export function DashboardView({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { notes } = useNotes();
  const { tasks, toggleTask } = useTasks();
  const { goals } = useGoals();
  const { insights } = useIntelligence();
  const [currentTip, setCurrentTip] = useState(0);
  
  const displayInsights = insights.length > 0 ? insights : ["Nexora Intelligence Layer active."];

  const expenseData = [
    { name: 'Food', value: 35, color: '#ec4899' },
    { name: 'Transport', value: 25, color: '#3b82f6' },
    { name: 'Utilities', value: 20, color: '#10b981' },
    { name: 'Other', value: 20, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6 pb-4">
      {/* Daily AI Recommendation */}
      <GlassCard className="p-4 bg-primary/5 border-primary/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Sparkles size={64} />
        </div>
        <div className="flex items-start space-x-3 relative z-10">
          <div className="p-2 bg-primary/20 rounded-xl text-primary">
            <Sparkles size={18} />
          </div>
          <div className="flex-1">
            <div className="flex items-center text-xs font-semibold text-primary uppercase tracking-wider mb-2">
              <Sparkles size={14} className="mr-2" />
              AI Insights
            </div>
            <AnimatePresence mode="wait">
              <motion.p 
                key={displayInsights[currentTip % displayInsights.length]}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-xs text-muted-foreground leading-relaxed italic"
              >
                "{displayInsights[currentTip % displayInsights.length]}"
              </motion.p>
            </AnimatePresence>
            <div className="flex space-x-1 mt-3">
              {displayInsights.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTip(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === (currentTip % displayInsights.length) ? 'bg-primary w-4' : 'bg-muted-foreground/30'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Today's Tasks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-sm flex items-center">
            <CheckCircle2 size={16} className="mr-2 text-primary" />
            Today's Tasks
          </h3>
          <span className="text-[10px] text-muted-foreground font-medium">{tasks.filter(t => !t.completed).length} remaining</span>
        </div>
        <div className="space-y-2">
          {tasks.slice(0, 3).map((task) => (
            <GlassCard key={task.id} className="p-3 flex items-center space-x-3" hover={false}>
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                className="w-5 h-5 rounded-full border-2 border-primary data-[state=checked]:bg-primary"
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {task.text}
                </p>
              </div>
            </GlassCard>
          ))}
          {tasks.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2 italic">No tasks yet.</p>
          )}
        </div>
      </div>

      {/* Goals Progress */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm flex items-center px-1">
          <TrendingUp size={16} className="mr-2 text-blue-500" />
          Goals Progress
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {goals.slice(0, 2).map((goal) => {
             const progressValue = (goal.current / goal.target) * 100;
             return (
              <GlassCard key={goal.id} className="p-4" hover={false}>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2 truncate">{goal.title}</p>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-2xl font-bold">{Math.round(progressValue)}%</span>
                </div>
                <Progress value={progressValue} className="h-1.5" />
              </GlassCard>
            );
          })}
          {goals.length === 0 && (
             <GlassCard className="p-4 col-span-2 text-center" hover={false}>
               <p className="text-xs text-muted-foreground italic">No goals set.</p>
             </GlassCard>
          )}
        </div>
      </div>

      {/* Expense Summary */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm flex items-center px-1">
          <PieChart size={16} className="mr-2 text-emerald-500" />
          Weekly Expenses
        </h3>
        <GlassCard className="p-4" hover={false}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Total Spent</p>
              <p className="text-xl font-bold">$342.50</p>
            </div>
            <div className="h-16 w-16">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={expenseData}
                    innerRadius={20}
                    outerRadius={28}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {expenseData.slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] text-muted-foreground">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Recent Notes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-sm flex items-center">
            <FileText size={16} className="mr-2 text-amber-500" />
            Recent Notes
          </h3>
          <button 
            onClick={() => setActiveTab('notes')}
            className="text-[10px] font-bold text-primary hover:underline"
          >
            View All
          </button>
        </div>
        <div className="space-y-2">
          {notes.slice(0, 3).map((note) => (
            <GlassCard key={note.id} className="p-3 cursor-pointer" hover={true} onClick={() => setActiveTab('notes')}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold truncate">{note.title}</h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                    {note.content}
                  </p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground/50 ml-2 mt-1" />
              </div>
            </GlassCard>
          ))}
          {notes.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2 italic">No notes created.</p>
          )}
        </div>
      </div>
    </div>
  );
}
