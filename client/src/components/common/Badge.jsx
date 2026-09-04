import React from 'react';

export const Badge = ({ children, variant = 'neutral', size = 'sm', dot = false }) => {
  const variantClasses = {
    neutral: 'bg-slate-100/90 text-slate-700 dark:bg-slate-800/90 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80',
    primary: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200/90 dark:border-indigo-800/80',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200/90 dark:border-emerald-800/80',
    warning: 'bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200/90 dark:border-amber-800/80',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200/90 dark:border-rose-800/80',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200/90 dark:border-purple-800/80',
    cyan: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/70 dark:text-cyan-300 border-cyan-200/90 dark:border-cyan-800/80',
  };

  const dotColors = {
    neutral: 'bg-slate-400',
    primary: 'bg-indigo-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    purple: 'bg-purple-500',
    cyan: 'bg-cyan-500',
  };

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px] font-semibold gap-1',
    sm: 'px-2.5 py-0.5 text-xs font-semibold gap-1.5',
    md: 'px-3 py-1 text-xs font-semibold gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border ${variantClasses[variant] || variantClasses.neutral} ${sizeClasses[size] || sizeClasses.sm} whitespace-nowrap tracking-wide`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || 'bg-slate-400'}`} />
      )}
      {children}
    </span>
  );
};

