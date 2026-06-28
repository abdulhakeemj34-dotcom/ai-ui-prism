/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { MemoryEntry, UserMemory } from '@/types/memory';
import { DEFAULT_MEMORY } from '@/types/memory';
import { useAuth } from '@/contexts/AuthContext';
import { loadUserData, saveUserData } from '@/lib/user-storage';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface MemoryContextValue {
  memory: UserMemory;
  addEntry: (entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEntry: (id: string, updates: Partial<Pick<MemoryEntry, 'key' | 'value' | 'category'>>) => void;
  removeEntry: (id: string) => void;
  setPreference: (key: string, value: string) => void;
  getContextForAi: () => string;
}

const MemoryContext = createContext<MemoryContextValue | null>(null);
const MEMORY_KEY = 'user_memory';

export function MemoryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { limits } = useSubscription();
  const [memory, setMemory] = useState<UserMemory>(DEFAULT_MEMORY);

  useEffect(() => {
    setMemory(loadUserData(user?.id ?? null, MEMORY_KEY, DEFAULT_MEMORY));
  }, [user?.id]);

  const persist = useCallback(
    (next: UserMemory) => {
      setMemory(next);
      saveUserData(user?.id ?? null, MEMORY_KEY, next);
    },
    [user?.id],
  );

  const addEntry = useCallback(
    (entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (memory.entries.length >= limits.memoryEntries) return;

      const now = new Date().toISOString();
      const newEntry: MemoryEntry = {
        ...entry,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      persist({ ...memory, entries: [newEntry, ...memory.entries] });
    },
    [memory, persist, limits.memoryEntries],
  );

  const updateEntry = useCallback(
    (id: string, updates: Partial<Pick<MemoryEntry, 'key' | 'value' | 'category'>>) => {
      persist({
        ...memory,
        entries: memory.entries.map((e) =>
          e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e,
        ),
      });
    },
    [memory, persist],
  );

  const removeEntry = useCallback(
    (id: string) => {
      persist({ ...memory, entries: memory.entries.filter((e) => e.id !== id) });
    },
    [memory, persist],
  );

  const setPreference = useCallback(
    (key: string, value: string) => {
      persist({
        ...memory,
        preferences: { ...memory.preferences, [key]: value },
      });
    },
    [memory, persist],
  );

  const getContextForAi = useCallback(() => {
    const parts: string[] = [];
    if (Object.keys(memory.preferences).length) {
      parts.push(`User preferences: ${JSON.stringify(memory.preferences)}`);
    }
    if (memory.entries.length) {
      parts.push(
        'User memory:\n' +
          memory.entries
            .slice(0, 10)
            .map((e) => `- ${e.key}: ${e.value}`)
            .join('\n'),
      );
    }
    return parts.join('\n');
  }, [memory]);

  return (
    <MemoryContext.Provider
      value={{ memory, addEntry, updateEntry, removeEntry, setPreference, getContextForAi }}
    >
      {children}
    </MemoryContext.Provider>
  );
}

export function useMemory() {
  const ctx = useContext(MemoryContext);
  if (!ctx) throw new Error('useMemory must be used within MemoryProvider');
  return ctx;
}
