import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const Toast = ({ toast, type, message, title, duration = 4000, onClose }) => {
  const toastType = toast?.type || type || 'info';
  const toastMessage = toast?.message || message || (typeof toast === 'string' ? toast : '');
  const toastTitle = toast?.title || title;

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [toastMessage, duration, onClose]);

  if (!toastMessage) return null;

  const config = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
      border: 'border-emerald-500/40',
      bg: 'bg-slate-900/95 dark:bg-slate-950/95',
      badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      defaultTitle: 'Success',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
      border: 'border-rose-500/40',
      bg: 'bg-slate-900/95 dark:bg-slate-950/95',
      badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      defaultTitle: 'Error',
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
      border: 'border-amber-500/40',
      bg: 'bg-slate-900/95 dark:bg-slate-950/95',
      badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      defaultTitle: 'Notice',
    },
    info: {
      icon: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
      border: 'border-indigo-500/40',
      bg: 'bg-slate-900/95 dark:bg-slate-950/95',
      badge: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      defaultTitle: 'Information',
    },
  };

  const current = config[toastType] || config.info;

  return (
    <div
      role="alert"
      className={`fixed bottom-6 right-6 z-99999 flex items-start gap-3.5 p-4 rounded-2xl shadow-2xl backdrop-blur-md border ${current.border} ${current.bg} text-white max-w-md w-full sm:w-auto min-w-[320px] animate-in fade-in slide-in-from-bottom-5 duration-300`}
    >
      <div className="mt-0.5">{current.icon}</div>
      <div className="flex-1 text-xs">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-bold text-slate-100">{toastTitle || current.defaultTitle}</span>
          <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full uppercase tracking-wider ${current.badge}`}>
            {toastType}
          </span>
        </div>
        <p className="text-slate-300 font-medium leading-relaxed">{toastMessage}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-1 -mr-1 -mt-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

