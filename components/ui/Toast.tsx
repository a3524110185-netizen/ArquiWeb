'use client';
import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info };
const styles: Record<ToastType, string> = {
  success: 'border-sigo-success bg-sigo-success/10 dark:bg-sigo-success/15',
  error: 'border-sigo-error bg-sigo-error/10 dark:bg-sigo-error/15',
  warning: 'border-sigo-warning bg-sigo-warning/10 dark:bg-sigo-warning/15',
  info: 'border-sigo-info bg-sigo-info/10 dark:bg-sigo-info/15',
};
const iconColors = {
  success: 'text-sigo-success', error: 'text-sigo-error', warning: 'text-sigo-warning', info: 'text-sigo-info',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...opts, id }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const success = useCallback((title: string, message?: string) => toast({ type: 'success', title, message }), [toast]);
  const error = useCallback((title: string, message?: string) => toast({ type: 'error', title, message }), [toast]);
  const warning = useCallback((title: string, message?: string) => toast({ type: 'warning', title, message }), [toast]);
  const info = useCallback((title: string, message?: string) => toast({ type: 'info', title, message }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      {/* Container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div
              key={t.id}
              className={cn(
                'flex items-start gap-3 p-4 rounded-xl border shadow-lg fade-in',
                styles[t.type]
              )}
            >
              <Icon size={18} className={cn('shrink-0 mt-0.5', iconColors[t.type])} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary">{t.title}</p>
                {t.message && <p className="text-xs text-secondary mt-0.5">{t.message}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="text-muted hover:text-primary">
                <X size={14} />
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
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
