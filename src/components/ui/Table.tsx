import React from 'react';

export function Table({ children, className = '', ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
      <table className={`w-full text-left border-collapse ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = '', ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={`bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 ${className}`} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '', ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={`divide-y divide-slate-100 dark:divide-slate-800/50 ${className}`} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = '', onClick, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr 
      onClick={onClick}
      className={`group transition-colors duration-150 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '', ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ${className}`} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-6 py-4 text-sm text-slate-650 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-150 ${className}`} {...props}>
      {children}
    </td>
  );
}
