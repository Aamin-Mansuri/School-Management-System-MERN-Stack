import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, description, children, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${maxWidth} bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-700/80 overflow-hidden z-10 my-8 animate-in zoom-in-95 duration-150`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-700/70 bg-slate-50/50 dark:bg-slate-800/80">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[calc(85vh-120px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

