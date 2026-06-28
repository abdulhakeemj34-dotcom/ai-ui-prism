import { useState, useCallback } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { NexoraThemeProvider } from '@/contexts/NexoraThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { MemoryProvider } from '@/contexts/MemoryContext';
import { StartupSplash } from '@/components/nexora/StartupSplash';
import { AppRoutes } from '@/routes';

const queryClient = new QueryClient();

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    const seen = sessionStorage.getItem('nexora_splash_seen');
    return !seen;
  });

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem('nexora_splash_seen', '1');
    setShowSplash(false);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NexoraThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <MemoryProvider>
              <BrowserRouter>
                {showSplash && <StartupSplash onComplete={handleSplashComplete} />}
                <AppRoutes />
                <Toaster position="top-center" expand={false} richColors />
              </BrowserRouter>
            </MemoryProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </NexoraThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
