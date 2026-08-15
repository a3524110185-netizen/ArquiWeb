'use client';
import { Bell } from 'lucide-react';
import { NotificacionApi } from '@/lib/services/notificaciones';
import NotificacionItem from './NotificacionItem';

interface NotificacionListProps {
  notificaciones: NotificacionApi[];
  onMarcarLeida: (id: number) => void;
}

export default function NotificacionList({ notificaciones, onMarcarLeida }: NotificacionListProps) {
  if (notificaciones.length === 0) {
    return (
      <div className="py-16 text-center flex flex-col items-center gap-2">
        <Bell className="text-muted" size={32} />
        <p className="text-sm text-muted">No hay notificaciones para mostrar</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notificaciones.map(n => (
        <NotificacionItem key={n.id} notificacion={n} onClick={onMarcarLeida} />
      ))}
    </div>
  );
}
