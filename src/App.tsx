import React, { useState, lazy, Suspense, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { Layout } from './components/nexora/Layout';
import { Toaster } from '@/components/ui/sonner';
import { User, Settings, LogOut, Bell, Shield } from 'lucide-react';
import { GlassCard } from './components/nexora/UI/GlassCard';
import { Button } from '@/components/ui/button';
import { Logo } from './components/nexora/UI/Logo';
import { AnimatePresence, motion } from 'framer-motion';

const DashboardView = lazy(() => import('./components/nexora/DashboardView').then(m => ({ default: m.DashboardView })));
const TaskView = lazy(() => import('./components/nexora/TaskView').then(m => ({ default: m.TaskView })));
const NoteView = lazy(() => import('./components/nexora/NoteView').then(m => ({ default: m.NoteView })));
const GoalView = lazy(() => import('./components/nexora/GoalView').then(m => ({ default: m.GoalView })));
const ChatView = lazy(() => import('./components/nexora/ChatView').then(m => ({ default: m.ChatView })));
const ProfileView = lazy(() => import('./components/nexora/ProfileView').then(m => ({ default: m.ProfileView })));

function StartupScreen() {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary-foreground)_0%,transparent_70%)] opacity-5" />
      <Logo variant="startup" />
    </motion.div>
  );
}

function LoadingScreen() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Logo variant="loading" />
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isStarting, setIsStarting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsStarting(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView setActiveTab={setActiveTab} />;
      case 'tasks':
        return <TaskView />;
      case 'notes':
        return <NoteView />;
      case 'goals':
        return <GoalView />;
      case 'chat':
        return <ChatView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <DashboardView setActiveTab={setActiveTab} />;
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AnimatePresence>
        {isStarting && <StartupScreen key="startup" />}
      </AnimatePresence>
      
      {!isStarting && (
        <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
          <Suspense fallback={<LoadingScreen />}>
            {renderContent()}
          </Suspense>
        </Layout>
      )}
      
      <Toaster position="top-center" expand={false} richColors />
    </ThemeProvider>
  );
}

export default App;
