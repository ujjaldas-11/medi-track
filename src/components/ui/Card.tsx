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
  
  const baseStyles = 'border border-zinc-200 dark:border-zinc-800/80 p-6 transition-all duration-300';
  
  const variantStyles = {
    default: 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm',
    premium: 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-md border-zinc-200 dark:border-zinc-800',
    accent: 'bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
  };

  const hoverClass = hoverEffect 
    ? 'hover:-translate-y-0.5 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700' 
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
