import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadUserData, saveUserData, logActivity } from '@/lib/user-storage';
import type { Expense } from '@/types';

const EXPENSES_KEY = 'expenses';
// Phase 3: migrate expense persistence behind this hook to backend storage.

export function useExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    setExpenses(loadUserData<Expense[]>(user?.id ?? null, EXPENSES_KEY, []));
  }, [user?.id]);

  const persist = useCallback(
    (next: Expense[]) => {
      setExpenses(next);
      saveUserData(user?.id ?? null, EXPENSES_KEY, next);
    },
    [user?.id],
  );

  const addExpense = useCallback(
    (data: Omit<Expense, 'id' | 'createdAt'>) => {
      const expense: Expense = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      persist([expense, ...expenses]);
      logActivity(user?.id ?? null, {
        type: 'expense',
        title: data.type === 'income' ? 'Income added' : 'Expense added',
        description: `${data.title}: $${data.amount.toFixed(2)}`,
      });
      return expense;
    },
    [expenses, persist, user?.id],
  );

  const deleteExpense = useCallback(
    (id: string) => {
      persist(expenses.filter((e) => e.id !== id));
    },
    [expenses, persist],
  );

  const analytics = useMemo(() => {
    const income = expenses.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const totalExpenses = expenses.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
    const byCategory = expenses
      .filter((e) => e.type === 'expense')
      .reduce<Record<string, number>>((acc, e) => {
        acc[e.category] = (acc[e.category] ?? 0) + e.amount;
        return acc;
      }, {});

    return {
      income,
      totalExpenses,
      balance: income - totalExpenses,
      byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
    };
  }, [expenses]);

  return { expenses, addExpense, deleteExpense, analytics };
}
