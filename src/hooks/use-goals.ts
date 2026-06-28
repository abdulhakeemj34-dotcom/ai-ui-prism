import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadUserData, saveUserData, logActivity } from '@/lib/user-storage';
import type { Goal, GoalMilestone } from '@/types';

const GOALS_KEY = 'goals';
// Phase 3: migrate goal persistence behind this hook to backend storage.

export function useGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    setGoals(loadUserData<Goal[]>(user?.id ?? null, GOALS_KEY, []));
  }, [user?.id]);

  const persist = useCallback(
    (next: Goal[]) => {
      setGoals(next);
      saveUserData(user?.id ?? null, GOALS_KEY, next);
    },
    [user?.id],
  );

  const addGoal = useCallback(
    (title: string, targetValue: number, unit = '%', milestones: Omit<GoalMilestone, 'id'>[] = []) => {
      const now = new Date().toISOString();
      const goal: Goal = {
        id: crypto.randomUUID(),
        title: title.trim(),
        targetValue,
        currentValue: 0,
        unit,
        milestones: milestones.map((m) => ({ ...m, id: crypto.randomUUID() })),
        createdAt: now,
        updatedAt: now,
      };
      persist([goal, ...goals]);
      logActivity(user?.id ?? null, { type: 'goal', title: 'Goal created', description: goal.title });
      return goal;
    },
    [goals, persist, user?.id],
  );

  const updateGoal = useCallback(
    (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => {
      persist(
        goals.map((g) =>
          g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g,
        ),
      );
    },
    [goals, persist],
  );

  const deleteGoal = useCallback(
    (id: string) => {
      persist(goals.filter((g) => g.id !== id));
    },
    [goals, persist],
  );

  const updateProgress = useCallback(
    (id: string, currentValue: number) => {
      const goal = goals.find((g) => g.id === id);
      if (!goal) return;
      const milestones = goal.milestones.map((m) => ({
        ...m,
        completed: currentValue >= m.value ? true : m.completed,
      }));
      updateGoal(id, { currentValue, milestones });
      logActivity(user?.id ?? null, {
        type: 'goal',
        title: 'Goal progress updated',
        description: `${goal.title}: ${currentValue}${goal.unit}`,
      });
    },
    [goals, updateGoal, user?.id],
  );

  return { goals, addGoal, updateGoal, deleteGoal, updateProgress };
}
