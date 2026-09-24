import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading financial data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <div className="relative">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
      </div>
      <p className="text-sm font-medium text-slate-400">{message}</p>
    </div>
  );
};
