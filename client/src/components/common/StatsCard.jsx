import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatsCard = ({ title, value, change, changeType = 'increase', icon: Icon, color = 'indigo', subtitle, onClick }) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50/90 dark:bg-indigo-950/60',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-100/80 dark:border-indigo-900/50',
      glow: 'group-hover:border-indigo-300 dark:group-hover:border-indigo-700/60',
    },
    blue: {
      bg: 'bg-blue-50/90 dark:bg-blue-950/60',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100/80 dark:border-blue-900/50',
      glow: 'group-hover:border-blue-300 dark:group-hover:border-blue-700/60',
    },
    emerald: {
      bg: 'bg-emerald-50/90 dark:bg-emerald-950/60',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100/80 dark:border-emerald-900/50',
      glow: 'group-hover:border-emerald-300 dark:group-hover:border-emerald-700/60',
    },
    amber: {
      bg: 'bg-amber-50/90 dark:bg-amber-950/60',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100/80 dark:border-amber-900/50',
      glow: 'group-hover:border-amber-300 dark:group-hover:border-amber-700/60',
    },
    purple: {
      bg: 'bg-purple-50/90 dark:bg-purple-950/60',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-100/80 dark:border-purple-900/50',
      glow: 'group-hover:border-purple-300 dark:group-hover:border-purple-700/60',
    },
    rose: {
      bg: 'bg-rose-50/90 dark:bg-rose-950/60',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-100/80 dark:border-rose-900/50',
      glow: 'group-hover:border-rose-300 dark:group-hover:border-rose-700/60',
    },
    cyan: {
      bg: 'bg-cyan-50/90 dark:bg-cyan-950/60',
      text: 'text-cyan-600 dark:text-cyan-400',
      border: 'border-cyan-100/80 dark:border-cyan-900/50',
      glow: 'group-hover:border-cyan-300 dark:group-hover:border-cyan-700/60',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      onClick={onClick}
      className={`group relative bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-200 ${
        scheme.glow
      } ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center border ${scheme.bg} ${scheme.text} ${scheme.border} transition-transform group-hover:scale-105 duration-200 shrink-0`}
          >
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
          {value}
        </span>
        {change && (
          <div
            className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              changeType === 'increase'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60'
            }`}
          >
            {changeType === 'increase' ? (
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3 h-3 mr-0.5" />
            )}
            {change}
          </div>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};

