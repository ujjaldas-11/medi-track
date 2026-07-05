import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'premium' | 'accent';
  roundedSize?: '2xl' | '3xl';
  hoverEffect?: boolean;
}

export function Card({ 
  children, 
  className = '', 
  variant = 'default', 
  roundedSize = '2xl', 
  hoverEffect = false,
  ...props 
}: CardProps) {
  const roundedClass = roundedSize === '3xl' ? 'rounded-3xl' : 'rounded-2xl';
  
  const baseStyles = 'border border-slate-200 dark:border-slate-800 p-6 transition-all duration-300';
  
  const variantStyles = {
    default: 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-md',
    premium: 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 text-slate-800 dark:text-slate-100 shadow-xl border-emerald-500/20 dark:border-emerald-500/10',
    accent: 'bg-gradient-to-br from-teal-500/5 to-transparent border-teal-500/20 dark:bg-slate-800 dark:text-slate-100 shadow-sm'
  };

  const hoverClass = hoverEffect 
    ? 'hover:-translate-y-1 hover:shadow-xl hover:border-emerald-500/30 dark:hover:border-emerald-500/20' 
    : '';

  return (
    <div 
      className={`${baseStyles} ${variantStyles[variant]} ${roundedClass} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
