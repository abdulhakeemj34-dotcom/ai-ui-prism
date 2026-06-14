import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, MessageSquare, CheckSquare, FileText, Target, Calendar, CreditCard, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
  { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
  { id: 'notes', icon: FileText, label: 'Notes' },
  { id: 'goals', icon: Target, label: 'Goals' },
  { id: 'chat', icon: MessageSquare, label: 'AI' },
  { id: 'profile', icon: Settings, label: 'Profile' },
];

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <div className="w-full px-4 pb-6 pt-2 bg-background/80 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="relative flex flex-col items-center justify-center p-1.5 min-h-[48px] rounded-xl transition-all duration-300"
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </AnimatePresence>
              <Icon 
                size={20} 
                className={`transition-colors duration-300 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} 
              />
              <span className={`text-[9px] mt-0.5 font-medium transition-colors duration-300 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="indicator"
                  className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
