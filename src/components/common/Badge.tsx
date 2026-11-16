import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'violet' | 'pink' | 'emerald' | 'amber' | 'slate';
  pulse?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  pulse = false,
  className,
  size = 'md',
}) => {
  const variantStyles = {
    cyan: 'bg-cosmic-cyan/15 text-cosmic-cyan border-cosmic-cyan/30 shadow-glow-cyan/50',
    violet: 'bg-cosmic-violet/20 text-purple-300 border-cosmic-violet/30 shadow-glow-violet/50',
    pink: 'bg-cosmic-pink/15 text-rose-300 border-cosmic-pink/30 shadow-glow-pink/50',
    emerald: 'bg-cosmic-emerald/15 text-emerald-300 border-cosmic-emerald/30 shadow-glow-emerald/50',
    amber: 'bg-cosmic-amber/15 text-amber-300 border-cosmic-amber/30',
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
  };

  const dotColors = {
    cyan: 'bg-cosmic-cyan',
    violet: 'bg-purple-400',
    pink: 'bg-rose-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    slate: 'bg-slate-400',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 font-medium border rounded-full uppercase tracking-wider',
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
          variantStyles[variant],
          className
        )
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={clsx(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              dotColors[variant]
            )}
          />
          <span
            className={clsx('relative inline-flex rounded-full h-2 w-2', dotColors[variant])}
          />
        </span>
      )}
      {children}
    </span>
  );
};
