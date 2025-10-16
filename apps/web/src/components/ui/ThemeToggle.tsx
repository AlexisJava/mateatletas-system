'use client';

import { useTheme } from '@/lib/theme/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-12 h-12 rounded-full flex items-center justify-center
                 bg-[var(--docente-bg-card)] border border-[var(--docente-border)]
                 hover:bg-[var(--docente-bg-hover)] transition-smooth
                 shadow-md hover:shadow-lg"
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Sol (Modo Claro) */}
      <Sun
        className={`absolute w-5 h-5 text-orange-500 transition-all duration-500 ${
          theme === 'light'
            ? 'rotate-0 scale-100 opacity-100'
            : 'rotate-90 scale-0 opacity-0'
        }`}
      />

      {/* Luna (Modo Oscuro) */}
      <Moon
        className={`absolute w-5 h-5 text-indigo-400 transition-all duration-500 ${
          theme === 'dark'
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-90 scale-0 opacity-0'
        }`}
      />
    </button>
  );
}
