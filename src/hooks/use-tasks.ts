import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadUserData, saveUserData, logActivity } from '@/lib/user-storage';
import type { Task } from '@/types';

const TASKS_KEY = 'tasks';
// Phase 3: migrate task persistence behind this hook to backend storage.

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTasks(loadUserData<Task[]>(user?.id ?? null, TASKS_KEY, []));
  }, [user?.id]);

  const persist = useCallback(
    (next: Task[]) => {
      setTasks(next);
      saveUserData(user?.id ?? null, TASKS_KEY, next);
    },
    [user?.id],
  );

  const addTask = useCallback(
    (title: string, options?: Partial<Pick<Task, 'description' | 'priority' | 'dueDate'>>) => {
      const now = new Date().toISOString();
      const task: Task = {
        id: crypto.randomUUID(),
        title: title.trim(),
        description: options?.description,
        completed: false,
        priority: options?.priority ?? 'medium',
        dueDate: options?.dueDate,
        createdAt: now,
        updatedAt: now,
      };
      persist([task, ...tasks]);
      logActivity(user?.id ?? null, { type: 'task', title: 'Task created', description: task.title });
      return task;
    },
    [tasks, persist, user?.id],
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
      persist(
        tasks.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t,
        ),
      );
    },
    [tasks, persist],
  );

  const deleteTask = useCallback(
    (id: string) => {
      persist(tasks.filter((t) => t.id !== id));
    },
    [tasks, persist],
  );

  const toggleComplete = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        updateTask(id, { completed: !task.completed });
        logActivity(user?.id ?? null, {
          type: 'task',
          title: task.completed ? 'Task reopened' : 'Task completed',
          description: task.title,
        });
      }
    },
    [tasks, updateTask, user?.id],
  );

  return { tasks, addTask, updateTask, deleteTask, toggleComplete };
}
