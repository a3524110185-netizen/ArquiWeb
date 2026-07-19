'use client';
import { useStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import { timeAgo } from '@/lib/utils';
import { FileText, AlertTriangle, DollarSign, Clock, CheckCircle, XCircle, UserPlus } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  FileText, AlertTriangle, DollarSign, Clock, CheckCircle, XCircle, UserPlus,
};

const typeColors: Record<string, string> = {
  reporte: 'bg-brand-100 text-brand-600 dark:bg-brand-900/30',
  incidencia: 'bg-red-100 text-red-600 dark:bg-red-900/30',
  gasto: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30',
  horario: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
  validacion: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30',
  usuario: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30',
};

const typeLabels: Record<string, string> = {
  reporte: 'Reporte', incidencia: 'Incidencia', gasto: 'Gasto',
  horario: 'Horario', validacion: 'Validación', usuario: 'Usuario',
};

export default function ActividadRecientePage() {
  const { actividad } = useStore();
  const sorted = [...actividad].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  return (
    <div className="max-w-2xl">
      <Card padding="none">
        <div className="px-6 py-4 border-b border-default">
          <h2 className="text-sm font-semibold text-primary">Feed de Actividad Reciente</h2>
          <p className="text-xs text-muted mt-0.5">{sorted.length} eventos registrados</p>
        </div>
        <div className="relative px-6 py-4">
          {/* Línea vertical */}
          <div className="absolute left-10 top-4 bottom-4 w-px bg-gradient-to-b from-brand-200 via-brand-100 to-transparent" />
          <div className="space-y-4">
            {sorted.map((evento, idx) => {
              const Icon = iconMap[evento.icono] ?? FileText;
              const colorClass = typeColors[evento.tipo] ?? 'bg-gray-100 text-gray-500';
              return (
                <div key={evento.id} className="flex items-start gap-4 relative fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${colorClass}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-primary leading-snug">{evento.descripcion}</p>
                      <span className="text-[10px] text-muted shrink-0 mt-0.5">{timeAgo(evento.fecha)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-medium text-brand-600 bg-brand-50 dark:bg-brand-900/20 px-1.5 py-0.5 rounded-full">
                        {typeLabels[evento.tipo]}
                      </span>
                      <span className="text-[10px] text-muted">{evento.proyecto}</span>
                      <span className="text-[10px] text-muted">·</span>
                      <span className="text-[10px] text-muted">{evento.usuario}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
