import React, { useState, useEffect } from 'react';
import { BottomNav } from './BottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './UI/Logo';
import { WifiOff, Zap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const isChatTab = activeTab === 'chat';
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isWeakConnection, setIsWeakConnection] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      const updateConnection = () => {
        setIsWeakConnection(conn.effectiveType === '2g' || conn.saveData);
      };
      conn.addEventListener('change', updateConnection);
      updateConnection();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="h-[100dvh] flex flex-col bg-background text-foreground transition-colors duration-500 overflow-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Logo variant="watermark" size={300} />
        </div>
      </div>

      {!isChatTab && (
        <header className="sticky top-0 z-40 bg-background/60 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-border/40">
          <div className="flex items-center space-x-3">
            <Logo className={isWeakConnection ? 'animate-pulse' : ''} />
            <AnimatePresence>
              {!isOnline && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="flex items-center space-x-1 text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full"
                >
                  <WifiOff size={10} />
                  <span className="text-[8px] font-bold uppercase tracking-wider">Offline</span>
                </motion.div>
              )}
              {isOnline && isWeakConnection && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="flex items-center space-x-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full"
                >
                  <Zap size={10} />
                  <span className="text-[8px] font-bold uppercase tracking-wider">Optimizing</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <ThemeToggle />
        </header>
      )}

      <main className={`flex-1 ${isChatTab ? 'overflow-hidden p-0' : 'overflow-y-auto custom-scrollbar max-w-md mx-auto px-6 py-6'} transition-all duration-300 relative z-10`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`h-full ${isChatTab ? 'w-full' : ''} relative z-10`}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="shrink-0 relative z-20">
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
