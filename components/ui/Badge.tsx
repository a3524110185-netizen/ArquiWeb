'use client';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'gray';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-brand-100 text-brand-900 dark:bg-brand-900/30 dark:text-brand-300',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  gray: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-brand-600',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-sky-500',
  purple: 'bg-purple-500',
  gray: 'bg-slate-400',
};

export default function Badge({ children, variant = 'default', size = 'sm', dot, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-medium rounded-full',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      variantStyles[variant],
      className
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}

// Helpers para mapear entidades a badge variants
export function severidadVariant(s: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    'Crítica': 'danger', 'Alta': 'warning', 'Media': 'info', 'Baja': 'success',
  };
  return map[s] ?? 'gray';
}

export function estadoIncVariant(s: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    'Abierto': 'danger', 'En Progreso': 'warning', 'Resuelto': 'success', 'Cerrado': 'gray',
  };
  return map[s] ?? 'gray';
}

export function reporteEstadoVariant(s: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    'Pendiente': 'warning', 'Aprobado': 'success', 'Rechazado': 'danger',
  };
  return map[s] ?? 'gray';
}

export function rolVariant(r: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    'Administrador': 'danger', 'Gerente': 'purple', 'Supervisor': 'default',
    'Capturista': 'info', 'Ingeniero': 'warning', 'Ventas': 'success',
    'Almacenista': 'gray', 'Operativo': 'gray',
  };
  return map[r] ?? 'gray';
}

export function proyectoEstadoVariant(s: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    'En progreso': 'info', 'Completado': 'success', 'Pausado': 'warning', 'Por iniciar': 'gray',
  };
  return map[s] ?? 'gray';
}
