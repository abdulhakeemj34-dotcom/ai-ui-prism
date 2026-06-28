import { Moon, Sun, Eye, Trash2, Plus } from 'lucide-react';
import { useNexoraTheme } from '@/contexts/NexoraThemeProvider';
import { useMemory } from '@/contexts/MemoryContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const themes = [
  { id: 'dark' as const, label: 'Dark Mode', icon: Moon },
  { id: 'light' as const, label: 'Light Mode', icon: Sun },
  { id: 'colorblind' as const, label: 'Color Blind Mode', icon: Eye },
];

export function SettingsPage() {
  const { theme, setTheme } = useNexoraTheme();
  const { memory, addEntry, removeEntry } = useMemory();
  const { isSupabaseMode } = useAuth();
  const [memKey, setMemKey] = useState('');
  const [memValue, setMemValue] = useState('');
  const [memCategory, setMemCategory] = useState<'preference' | 'context' | 'fact'>('preference');

  const handleAddMemory = () => {
    if (!memKey.trim() || !memValue.trim()) return;
    addEntry({ key: memKey, value: memValue, category: memCategory });
    setMemKey('');
    setMemValue('');
    toast.success('Memory saved');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Customize your Nexora experience</p>
      </div>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-base">Theme</CardTitle>
          <CardDescription>Choose your preferred appearance</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {themes.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                theme === id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40',
              )}
            >
              <Icon size={24} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI Memory</CardTitle>
          <CardDescription>
            Personal context stored for your AI assistant ({memory.entries.length} entries)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input placeholder="Key" value={memKey} onChange={(e) => setMemKey(e.target.value)} className="flex-1" />
            <Input placeholder="Value" value={memValue} onChange={(e) => setMemValue(e.target.value)} className="flex-1" />
            <Select value={memCategory} onValueChange={(v) => setMemCategory(v as typeof memCategory)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preference">Preference</SelectItem>
                <SelectItem value="context">Context</SelectItem>
                <SelectItem value="fact">Fact</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddMemory} size="icon">
              <Plus size={16} />
            </Button>
          </div>
          <div className="space-y-2">
            {memory.entries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{entry.key}</p>
                  <p className="text-xs text-muted-foreground">{entry.value}</p>
                  <Badge variant="outline" className="mt-1 text-[10px]">{entry.category}</Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeEntry(entry.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
            {memory.entries.length === 0 && (
              <p className="text-sm text-muted-foreground">No memory entries yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auth provider</Label>
              <p className="text-sm text-muted-foreground">
                {isSupabaseMode ? 'Supabase (cloud)' : 'Local (development mode)'}
              </p>
            </div>
            <Badge variant={isSupabaseMode ? 'default' : 'secondary'}>
              {isSupabaseMode ? 'Connected' : 'Local'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
