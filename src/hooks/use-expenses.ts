import { usePersistence } from './use-persistence';

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: number;
}

export function useExpenses() {
  const [transactions, setTransactions] = usePersistence<Transaction[]>('nexora-expenses', [
    { id: '1', amount: 45.50, type: 'expense', category: 'Food', date: Date.now() },
    { id: '2', amount: 1200, type: 'income', category: 'Salary', date: Date.now() - 86400000 },
    { id: '3', amount: 15.99, type: 'expense', category: 'Streaming', date: Date.now() - 172800000 },
  ]);

  const addTransaction = (amount: number, type: 'income' | 'expense', category: string) => {
    const tx: Transaction = {
      id: Date.now().toString(),
      amount,
      type,
      category,
      date: Date.now(),
    };
    setTransactions([tx, ...transactions]);
    return tx;
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const totalBalance = transactions.reduce((acc, tx) => 
    tx.type === 'income' ? acc + tx.amount : acc - tx.amount, 0
  );

  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalExpenses = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    totalBalance,
    totalIncome,
    totalExpenses
  };
}
