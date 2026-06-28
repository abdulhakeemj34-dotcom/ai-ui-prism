/* eslint-disable react-refresh/only-export-components */
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { NexoraTheme } from '@/types';

interface NexoraThemeContextValue {
  theme: NexoraTheme;
  setTheme: (theme: NexoraTheme) => void;
  resolvedTheme: 'light' | 'dark';
}

const NexoraThemeContext = createContext<NexoraThemeContextValue | null>(null);
const THEME_KEY = 'nexora_theme';

export function NexoraThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<NexoraTheme>(() => {
    const saved = localStorage.getItem(THEME_KEY) as NexoraTheme | null;
    return saved ?? 'dark';
  });

  const resolvedTheme: 'light' | 'dark' =
    theme === 'light' ? 'light' : 'dark';

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'colorblind');
    root.classList.add(resolvedTheme);
    if (theme === 'colorblind') {
      root.classList.add('colorblind');
    }
  }, [theme, resolvedTheme]);

  const setTheme = (next: NexoraTheme) => setThemeState(next);

  return (
    <NexoraThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="dark"
        forcedTheme={resolvedTheme}
        enableSystem={false}
      >
        {children}
      </NextThemesProvider>
    </NexoraThemeContext.Provider>
  );
}

export function useNexoraTheme() {
  const ctx = useContext(NexoraThemeContext);
  if (!ctx) throw new Error('useNexoraTheme must be used within NexoraThemeProvider');
  return ctx;
}
