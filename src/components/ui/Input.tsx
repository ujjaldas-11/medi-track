import React, { forwardRef } from 'react';

interface BaseInputProps {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & BaseInputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-bold text-zinc-700 dark:text-zinc-400 mb-1.5 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-3 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 border ${
            error 
              ? 'border-rose-500 focus:ring-rose-500' 
              : 'border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 dark:focus:ring-zinc-300'
          } rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs font-semibold text-rose-500">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & BaseInputProps>(
  ({ label, error, children, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-bold text-zinc-700 dark:text-zinc-400 mb-1.5 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-3 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 border ${
            error 
              ? 'border-rose-500 focus:ring-rose-500' 
              : 'border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 dark:focus:ring-zinc-300'
          } rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1 text-xs font-semibold text-rose-500">{error}</p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & BaseInputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-bold text-zinc-700 dark:text-zinc-400 mb-1.5 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={props.rows || 3}
          className={`w-full px-4 py-3 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 border ${
            error 
              ? 'border-rose-500 focus:ring-rose-500' 
              : 'border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 dark:focus:ring-zinc-300'
          } rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs font-semibold text-rose-500">{error}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
