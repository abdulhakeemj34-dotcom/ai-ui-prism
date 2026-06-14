import { useTasks } from './use-tasks';
import { useGoals } from './use-goals';
import { useNotes } from './use-notes';
import { usePersistence } from './use-persistence';
import { useMemo } from 'react';

export interface AIPermissions {
  tasks: boolean;
  goals: boolean;
  notes: boolean;
  expenses: boolean;
}

export function useIntelligence() {
  const { tasks, addTask } = useTasks();
  const { goals } = useGoals();
  const { notes, updateNote } = useNotes();
  const [expenses] = usePersistence<any[]>('nexora-expenses', []);
  const [permissions, setPermissions] = usePersistence<AIPermissions>('nexora_ai_permissions', {
    tasks: true,
    goals: true,
    notes: true,
    expenses: true,
  });

  const togglePermission = (key: keyof AIPermissions) => {
    setPermissions({ ...permissions, [key]: !permissions[key] });
  };

  const systemSnapshot = useMemo(() => ({
    tasks: permissions.tasks ? tasks : [],
    goals: permissions.goals ? goals : [],
    notes: permissions.notes ? notes : [],
    expenses: permissions.expenses ? {
      totalExpenses: expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0),
      totalIncome: expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0),
      recentCount: expenses.length
    } : null,
  }), [tasks, goals, notes, expenses, permissions]);

  const insights = useMemo(() => {
    const list: string[] = [];
    
    if (permissions.tasks) {
      const pending = tasks.filter(t => !t.completed);
      if (pending.length > 5) list.push(`You have ${pending.length} pending tasks. Time to prioritize?`);
      const urgent = pending.find(t => t.urgent);
      if (urgent) list.push(`Don't forget: "${urgent.text}" is marked as urgent.`);
    }

    if (permissions.goals) {
      const active = goals.filter(g => (g.current / g.target) < 1);
      if (active.length > 0) {
        const closest = [...active].sort((a, b) => (b.current / b.target) - (a.current / a.target))[0];
        list.push(`You're ${Math.round((closest.current / closest.target) * 100)}% of the way to "${closest.title}".`);
      }
    }

    if (permissions.expenses && expenses.length > 0) {
      const total = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
      if (total > 1000) list.push(`You've spent over $1,000 this month. Want to review your savings?`);
    }

    if (permissions.notes && notes.length > 0) {
      const lastNote = notes[0];
      if (!lastNote.summary) list.push(`Your latest note "${lastNote.title}" is ready for an AI summary.`);
    }

    if (list.length === 0) {
      list.push("Welcome to Nexora. Add some tasks or goals to get personalized insights!");
      list.push("Productivity Tip: Break big goals into small daily tasks.");
    }

    return list;
  }, [tasks, goals, expenses, notes, permissions]);

  return {
    systemSnapshot,
    insights,
    permissions,
    togglePermission,
    actions: {
      addTask,
      updateNote,
    }
  };
}
