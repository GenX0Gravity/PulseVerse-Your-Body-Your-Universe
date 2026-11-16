import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glow-cyan' | 'glow-violet' | 'glow-pink' | 'glow-emerald' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-sm font-semibold rounded-xl gap-2',
    lg: 'px-6 py-3.5 text-base font-bold rounded-2xl gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-cosmic-cyan to-cosmic-teal text-midnight-950 hover:brightness-110 shadow-glow-cyan font-semibold active:scale-[0.98]',
    'glow-cyan':
      'bg-cosmic-cyan/15 border border-cosmic-cyan/40 text-cosmic-cyan hover:bg-cosmic-cyan/25 hover:border-cosmic-cyan shadow-glow-cyan active:scale-[0.98]',
    'glow-violet':
      'bg-cosmic-violet/20 border border-cosmic-violet/40 text-purple-300 hover:bg-cosmic-violet/30 hover:border-cosmic-purple shadow-glow-violet active:scale-[0.98]',
    'glow-pink':
      'bg-cosmic-pink/20 border border-cosmic-pink/40 text-pink-300 hover:bg-cosmic-pink/30 hover:border-pink-500 shadow-glow-pink active:scale-[0.98]',
    'glow-emerald':
      'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 hover:border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.98]',
    secondary:
      'bg-midnight-800/80 hover:bg-midnight-700/80 border border-white/10 text-slate-200 active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white',
    danger:
      'bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 active:scale-[0.98]',
  };

  return (
    <button
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center transition-all duration-200 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none relative overflow-hidden',
          sizeStyles[size],
          variantStyles[variant],
          className
        )
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!isLoading && icon && iconPosition === 'left' && <span>{icon}</span>}
      <span>{children}</span>
      {!isLoading && icon && iconPosition === 'right' && <span>{icon}</span>}
    </button>
  );
};
