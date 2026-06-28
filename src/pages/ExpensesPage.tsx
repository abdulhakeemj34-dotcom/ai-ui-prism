import { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useExpenses } from '@/hooks/use-expenses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Salary', 'Other'];

export function ExpensesPage() {
  const { expenses, addExpense, deleteExpense, analytics } = useExpenses();
  const [form, setForm] = useState({
    title: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: 'Food',
  });

  const handleAdd = () => {
    if (!form.title.trim() || !form.amount) return;
    addExpense({
      title: form.title,
      amount: parseFloat(form.amount),
      type: form.type,
      category: form.category,
      date: new Date().toISOString(),
    });
    setForm({ ...form, title: '', amount: '' });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Expenses</h1>
        <p className="text-sm text-muted-foreground">Track income and spending</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="glass-effect">
          <CardContent className="p-4 text-center">
            <TrendingUp className="mx-auto mb-1 size-5 text-green-500" />
            <p className="text-xs text-muted-foreground">Income</p>
            <p className="text-xl font-bold text-green-500">${analytics.income.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardContent className="p-4 text-center">
            <TrendingDown className="mx-auto mb-1 size-5 text-red-500" />
            <p className="text-xs text-muted-foreground">Expenses</p>
            <p className="text-xl font-bold text-red-500">${analytics.totalExpenses.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className={`text-xl font-bold ${analytics.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${analytics.balance.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {analytics.byCategory.length > 0 && (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-base">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.byCategory}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Description"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="min-w-[140px] flex-1"
        />
        <Input
          placeholder="Amount"
          type="number"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="w-28"
        />
        <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as typeof form.type })}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="income">Income</SelectItem>
          </SelectContent>
        </Select>
        <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAdd}>
          <Plus size={16} />
        </Button>
      </div>

      <div className="space-y-2">
        {expenses.map((expense) => (
          <Card key={expense.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{expense.title}</p>
                <p className="text-xs text-muted-foreground">
                  {expense.category} · {new Date(expense.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-semibold ${expense.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                  {expense.type === 'income' ? '+' : '-'}${expense.amount.toFixed(2)}
                </span>
                <Button variant="ghost" size="icon" onClick={() => deleteExpense(expense.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {expenses.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">No transactions yet.</p>
        )}
      </div>
    </div>
  );
}
