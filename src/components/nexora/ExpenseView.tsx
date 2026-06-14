import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Wallet, ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';
import { useExpenses } from '@/hooks/use-expenses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from './UI/GlassCard';
import { BarChart, Bar, ResponsiveContainer, Cell, Tooltip } from 'recharts';

const chartData = [
  { name: 'Mon', value: 45 },
  { name: 'Tue', value: 30 },
  { name: 'Wed', value: 65 },
  { name: 'Thu', value: 20 },
  { name: 'Fri', value: 85 },
  { name: 'Sat', value: 50 },
  { name: 'Sun', value: 40 },
];

export function ExpenseView() {
  const { transactions, addTransaction, totalBalance, totalIncome, totalExpenses } = useExpenses();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  const handleAdd = () => {
    if (!amount || !category) return;
    addTransaction(parseFloat(amount), 'expense', category);
    setAmount('');
    setCategory('');
  };

  return (
    <div className="space-y-6 pb-24">
      <GlassCard className="p-6 bg-gradient-to-br from-primary/20 to-blue-600/10 border-primary/30">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Total Balance</p>
            <h2 className="text-3xl font-bold tracking-tighter">${totalBalance.toFixed(2)}</h2>
          </div>
          <Wallet className="text-primary opacity-50" size={24} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background/40 backdrop-blur-sm rounded-2xl p-3 border border-white/5">
            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Income</p>
            <p className="text-sm font-bold text-emerald-500">+${totalIncome.toFixed(2)}</p>
          </div>
          <div className="bg-background/40 backdrop-blur-sm rounded-2xl p-3 border border-white/5">
            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Expenses</p>
            <p className="text-sm font-bold text-rose-500">-${totalExpenses.toFixed(2)}</p>
          </div>
        </div>
      </GlassCard>

      <div className="h-48 w-full bg-card/40 backdrop-blur-md rounded-3xl border border-border/50 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
              cursor={{ fill: 'transparent' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={index === 4 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/0.3)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm">Quick Entry</h3>
          <Button variant="ghost" size="sm" className="text-[10px] text-primary h-7 px-2">Manage All</Button>
        </div>
        <div className="flex space-x-2">
          <Input 
            type="number" 
            placeholder="$0.00" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-card/40 border-border/60 rounded-xl text-sm"
          />
          <Input 
            placeholder="Category" 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 bg-card/40 border-border/60 rounded-xl text-sm"
          />
          <Button onClick={handleAdd} size="icon" className="shrink-0 rounded-xl bg-primary">
            <Plus size={20} />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-sm flex items-center">
          Recent Activity
          <Filter size={14} className="ml-2 text-muted-foreground" />
        </h3>
        {transactions.slice(0, 5).map((tx) => (
          <GlassCard key={tx.id} className="p-4 flex items-center justify-between" hover={false}>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${
                tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
              }`}>
                {tx.type === 'income' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
              </div>
              <div>
                <p className="text-sm font-bold">{tx.category}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
              </div>
            </div>
            <p className={`font-bold text-sm ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
              {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
            </p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
