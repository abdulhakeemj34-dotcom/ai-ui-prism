import { usePersistence } from './use-persistence';

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  category: string;
  color: string;
}

export function useGoals() {
  const [goals, setGoals] = usePersistence<Goal[]>('nexora-goals', [
    { 
      id: '1', 
      title: 'Weekly Reading', 
      target: 10, 
      current: 7, 
      category: 'Education', 
      color: '#3b82f6' 
    },
    { 
      id: '2', 
      title: 'Fitness Target', 
      target: 5, 
      current: 4, 
      category: 'Health', 
      color: '#10b981' 
    },
  ]);

  const updateGoalProgress = (id: string, increment: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        return { 
          ...g, 
          current: Math.min(g.target, Math.max(0, g.current + increment)) 
        };
      }
      return g;
    }));
  };

  return {
    goals,
    updateGoalProgress
  };
}
