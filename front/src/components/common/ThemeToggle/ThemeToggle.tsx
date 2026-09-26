'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isHome?: boolean;
}

export function ThemeToggle({ isHome = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-full border border-transparent" />;
  }

  const isDark = theme === 'dark';

  const buttonStyles = isHome
    ? 'border-white/30 text-white hover:bg-white/10 hover:border-white/50'
    : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`p-2 rounded-full border transition-all duration-200 shadow-sm focus:outline-none cursor-pointer flex items-center justify-center ${buttonStyles}`}
      aria-label="Cambiar tema"
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400 animate-in spin-in-90 duration-300" />
      ) : (
        <Moon className={`w-5 h-5 transition-colors ${isHome ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`} />
      )}
    </button>
  );
}