import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantStyles = {
    // Primary: teal-500 bg, navy text (#0B2A4A), hover to teal-600
    primary: 'bg-teal-500 text-[#0B2A4A] hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-500/20 focus:ring-teal-500',
    // Secondary: soft teal/slate
    secondary: 'bg-[#0B2A4A] text-white hover:bg-[#133c66] focus:ring-[#0B2A4A]',
    // Outline: border
    outline: 'border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 focus:ring-slate-400',
    // Danger: critical red
    danger: 'bg-rose-600 text-white hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-600/20 focus:ring-rose-500',
    // Ghost: transparent
    ghost: 'text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-400'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
