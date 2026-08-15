'use client';
import { cn, timeAgo } from '@/lib/utils';
import { NotificacionApi, TIPO_LABEL, severidadDeTipo } from '@/lib/services/notificaciones';
import Badge from '@/components/ui/Badge';

interface NotificacionItemProps {
  notificacion: NotificacionApi;
  onClick?: (id: number) => void;
}

export default function NotificacionItem({ notificacion, onClick }: NotificacionItemProps) {
  const severidad = severidadDeTipo(notificacion.tipo);
  return (
    <div
      onClick={() => onClick?.(notificacion.id)}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border border-default cursor-pointer hover:bg-app transition-colors',
        !notificacion.leida && 'bg-sigo-primary/5 dark:bg-sigo-primary/10'
      )}
    >
      <div className={cn('w-2.5 h-2.5 rounded-full mt-1.5 shrink-0', {
        'bg-sigo-error': severidad === 'error',
        'bg-sigo-warning': severidad === 'warning',
        'bg-sigo-info': severidad === 'info',
        'bg-sigo-success': severidad === 'success',
      })} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-primary">{notificacion.titulo}</p>
          {!notificacion.leida && <span className="w-2 h-2 rounded-full bg-sigo-primary shrink-0" />}
        </div>
        <p className="text-sm text-secondary mt-0.5">{notificacion.descripcion}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant="gray" size="sm">{TIPO_LABEL[notificacion.tipo]}</Badge>
          <span className="text-[11px] text-muted">{timeAgo(notificacion.fecha)}</span>
        </div>
      </div>
    </div>
  );
}
