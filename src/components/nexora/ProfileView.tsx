import React from 'react';
import { User, Settings, LogOut, Bell, Shield, Brain, CheckCircle2, Target, BookOpen, Wallet } from 'lucide-react';
import { GlassCard } from './UI/GlassCard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useIntelligence } from '@/hooks/use-intelligence';
import { toast } from 'sonner';

export function ProfileView() {
  const { permissions, togglePermission } = useIntelligence();

  const handleToggle = (key: keyof typeof permissions, label: string) => {
    togglePermission(key);
    toast.info(`${label} access ${!permissions[key] ? 'enabled' : 'disabled'}`);
  };

  const aiPermissions = [
    { key: 'tasks' as const, label: 'Task Intelligence', icon: CheckCircle2, description: 'Allow AI to prioritize and suggest tasks' },
    { key: 'goals' as const, label: 'Goal Intelligence', icon: Target, description: 'Allow AI to track progress and suggest actions' },
    { key: 'notes' as const, label: 'Note Intelligence', icon: BookOpen, description: 'Allow AI to read and summarize your notes' },
    { key: 'expenses' as const, label: 'Expense Intelligence', icon: Wallet, description: 'Allow AI to analyze spending patterns' },
  ];

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center py-8">
        <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center mb-4 relative">
          <User size={40} className="text-primary" />
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-background rounded-full" />
        </div>
        <h2 className="text-xl font-bold">Alex Morgan</h2>
        <p className="text-sm text-muted-foreground">alex.morgan@nexora.ai</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">AI Intelligence Layer</h3>
        <GlassCard className="p-4 space-y-4">
          {aiPermissions.map((perm) => (
            <div key={perm.key} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <perm.icon size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{perm.label}</p>
                  <p className="text-[10px] text-muted-foreground">{perm.description}</p>
                </div>
              </div>
              <Switch 
                checked={permissions[perm.key]} 
                onCheckedChange={() => handleToggle(perm.key, perm.label)}
              />
            </div>
          ))}
        </GlassCard>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Account Settings</h3>
        <GlassCard className="p-4 flex items-center justify-between" hover={true}>
          <div className="flex items-center space-x-3">
            <Bell size={20} className="text-muted-foreground" />
            <span className="text-sm font-medium">Notifications</span>
          </div>
          <span className="text-xs text-muted-foreground">Push & Email</span>
        </GlassCard>
        <GlassCard className="p-4 flex items-center justify-between" hover={true}>
          <div className="flex items-center space-x-3">
            <Shield size={20} className="text-muted-foreground" />
            <span className="text-sm font-medium">Privacy & Security</span>
          </div>
        </GlassCard>
        <GlassCard className="p-4 flex items-center justify-between" hover={true}>
          <div className="flex items-center space-x-3">
            <Settings size={20} className="text-muted-foreground" />
            <span className="text-sm font-medium">System Preferences</span>
          </div>
        </GlassCard>
      </div>

      <Button variant="outline" className="w-full h-12 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10">
        <LogOut size={18} className="mr-2" />
        Sign Out
      </Button>
    </div>
  );
}
