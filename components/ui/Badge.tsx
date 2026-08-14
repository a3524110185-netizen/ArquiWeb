'use client';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'gray';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-sigo-primary/10 text-sigo-primary dark:bg-sigo-primary/20 dark:text-sigo-primary-light',
  success: 'bg-sigo-success/10 text-sigo-success dark:bg-sigo-success/20 dark:text-sigo-success',
  warning: 'bg-sigo-warning/10 text-sigo-warning dark:bg-sigo-warning/20 dark:text-sigo-warning',
  danger: 'bg-sigo-error/10 text-sigo-error dark:bg-sigo-error/20 dark:text-sigo-error',
  info: 'bg-sigo-info/10 text-sigo-info dark:bg-sigo-info/20 dark:text-sigo-info',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  gray: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-sigo-primary',
  success: 'bg-sigo-success',
  warning: 'bg-sigo-warning',
  danger: 'bg-sigo-error',
  info: 'bg-sigo-info',
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
    'planeado': 'gray',
    'a_tiempo': 'success',
    'retrasado': 'warning',
    'critico': 'danger',
    'completado': 'info',
    'En progreso': 'info',
    'Completado': 'success',
    'Pausado': 'warning',
    'Por iniciar': 'gray',
  };
  return map[s] ?? 'gray';
}

export function getEstadoLabel(s: string): string {
  const map: Record<string, string> = {
    'planeado': 'Planeado',
    'a_tiempo': 'A Tiempo',
    'retrasado': 'Retrasado',
    'critico': 'Crítico',
    'completado': 'Completado',
  };
  return map[s] ?? s;
}
