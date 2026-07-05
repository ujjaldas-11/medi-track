import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <svg className="animate-spin h-10 w-10 text-teal-500 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest font-mono">Routing...</span>
      </div>
    );
  }

  // Redirect based on role
  switch (role) {
    case 'cmo':
      return <Navigate to="/command" replace />;
    case 'mo':
      return <Navigate to="/centres" replace />;
    case 'pharmacist':
      return <Navigate to="/stock" replace />;
    case 'frontdesk':
      return <Navigate to="/registration" replace />;
    case 'staff':
      return <Navigate to="/doctors" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}