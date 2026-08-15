'use client';
import { useEffect, useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Select } from '@/components/ui/FormFields';
import NotificacionList from '@/components/notificaciones/NotificacionList';
import { TIPO_LABEL, NotificacionTipo } from '@/lib/services/notificaciones';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';

export default function NotificacionesPage() {
  const {
    notificaciones, notificacionesLoading, fetchNotificaciones,
    marcarNotificacionLeida, marcarTodasNotificacionesLeidas,
  } = useStore();
  const [filtroTipo, setFiltroTipo] = useState<'' | NotificacionTipo>('');

  useEffect(() => {
    fetchNotificaciones();
  }, [fetchNotificaciones]);

  const filtradas = useMemo(
    () => (filtroTipo ? notificaciones.filter(n => n.tipo === filtroTipo) : notificaciones),
    [notificaciones, filtroTipo]
  );

  const unread = notificaciones.filter(n => !n.leida).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Bell className="text-sigo-primary" size={26} /> Notificaciones
          </h1>
          <p className="text-sm text-muted">{unread > 0 ? `${unread} sin leer` : 'Estás al día'}</p>
        </div>
        <Button variant="secondary" onClick={marcarTodasNotificacionesLeidas} disabled={unread === 0}>
          <CheckCheck size={16} /> Marcar todas como leídas
        </Button>
      </div>

      <Card>
        <Select
          label="Tipo" placeholder="Todos los tipos" value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value as NotificacionTipo | '')}
          options={Object.entries(TIPO_LABEL).map(([value, label]) => ({ value, label }))}
        />
      </Card>

      <Card padding="none">
        <div className="p-4">
          {notificacionesLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 size={28} className="animate-spin text-sigo-primary" />
              <p className="text-sm text-muted">Cargando notificaciones...</p>
            </div>
          ) : (
            <NotificacionList notificaciones={filtradas} onMarcarLeida={marcarNotificacionLeida} />
          )}
        </div>
      </Card>
    </div>
  );
}
