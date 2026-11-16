import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'glow-cyan' | 'glow-violet' | 'glow-pink' | 'glow-emerald' | 'subtle';
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = 'default',
  hoverEffect = false,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-midnight-900/60 border-surface-glass-border shadow-glass-subtle',
    'glow-cyan': 'bg-midnight-900/70 border-cosmic-cyan/30 shadow-glow-cyan',
    'glow-violet': 'bg-midnight-900/70 border-cosmic-violet/30 shadow-glow-violet',
    'glow-pink': 'bg-midnight-900/70 border-cosmic-pink/30 shadow-glow-pink',
    'glow-emerald': 'bg-midnight-900/70 border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.25)]',
    subtle: 'bg-midnight-850/40 border-white/5',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'backdrop-blur-xl border rounded-2xl transition-all duration-300 relative overflow-hidden',
          variantStyles[variant],
          hoverEffect && 'hover:border-white/20 hover:bg-midnight-850/70 hover:translate-y-[-2px]',
          className
        )
      )}
      {...props}
    >
      {/* Subtle top specular highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};
