import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useAppStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-midnight-800/80 hover:bg-midnight-700/80 border border-white/10 text-slate-300 hover:text-white transition-all duration-200"
      title={`Switch to ${theme === 'dark' ? 'Light Sanctuary' : 'Cosmic Midnight'} mode (T)`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 animate-pulse-slow" />
      ) : (
        <Moon className="w-4 h-4 text-purple-400" />
      )}
    </button>
  );
};
