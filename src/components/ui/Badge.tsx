import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'healthy' | 'warning' | 'critical' | 'info' | 'neutral';
}

export function Badge({ 
  children, 
  variant = 'neutral', 
  className = '', 
  ...props 
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider';

  const variantStyles = {
    // Green - healthy
    healthy: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30',
    // Amber - warning
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30',
    // Red - critical
    critical: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30',
    // Blue - info
    info: 'bg-sky-100 text-sky-850 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-200 dark:border-sky-900/30',
    // Neutral
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50'
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
