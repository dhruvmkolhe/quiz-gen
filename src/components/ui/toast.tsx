import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn.ts';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  title?: string;
  description: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (options: { title?: string; description: string; variant?: ToastVariant; duration?: number }) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = 'default', duration = 4000 }: {
      title?: string;
      description: string;
      variant?: ToastVariant;
      duration?: number;
    }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newItem: ToastItem = { id, title, description, variant, duration };

      setToasts(prev => [...prev.slice(-3), newItem]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}

      {/* Toast Notification Container: Placed at the top-right / top-center so it never covers bottom action buttons */}
      <div
        aria-live="polite"
        className="fixed top-4 inset-x-3 sm:inset-x-auto sm:right-6 z-[100] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full mx-auto sm:mx-0 items-end"
      >
        {toasts.map(item => {
          const variantConfig = {
            default: {
              iconBg: 'bg-primary/10 text-primary',
              icon: <Info className="h-4 w-4" />,
              borderAccent: 'border-l-primary',
            },
            info: {
              iconBg: 'bg-sky-500/10 text-sky-500',
              icon: <Info className="h-4 w-4" />,
              borderAccent: 'border-l-sky-500',
            },
            success: {
              iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
              icon: <CheckCircle2 className="h-4 w-4" />,
              borderAccent: 'border-l-emerald-500',
            },
            warning: {
              iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
              icon: <AlertTriangle className="h-4 w-4" />,
              borderAccent: 'border-l-amber-500',
            },
            error: {
              iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
              icon: <AlertCircle className="h-4 w-4" />,
              borderAccent: 'border-l-rose-500',
            },
          };

          const config = variantConfig[item.variant || 'default'];

          return (
            <div
              key={item.id}
              role="alert"
              className={cn(
                'pointer-events-auto relative flex w-full items-start gap-3 rounded-xl p-3.5 sm:p-4',
                // Solid 100% opaque background with crisp border and deep drop shadow
                'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100',
                'border border-zinc-200/90 dark:border-zinc-800 shadow-xl shadow-black/10 dark:shadow-2xl dark:shadow-black/60',
                'border-l-4',
                config.borderAccent,
                'transition-all duration-300 ease-out animate-in slide-in-from-top-4 fade-in-0'
              )}
            >
              {/* Rounded icon badge */}
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg mt-0.5',
                  config.iconBg
                )}
              >
                {config.icon}
              </div>

              {/* Toast Text Content */}
              <div className="flex-1 min-w-0 pr-2">
                {item.title && (
                  <h5 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight mb-1">
                    {item.title}
                  </h5>
                )}
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed break-words">
                  {item.description}
                </p>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Close notification"
                className="shrink-0 -mr-1 -mt-1 rounded-md p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
