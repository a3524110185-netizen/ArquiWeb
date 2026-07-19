'use client';
import { useStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import Badge, { severidadVariant, estadoIncVariant } from '@/components/ui/Badge';
import { timeAgo } from '@/lib/utils';
import { ShieldAlert, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';

export default function IncidenciasCriticasPage() {
  const { incidencias } = useStore();
  const criticas = incidencias.filter(i =>
    (i.severidad === 'Crítica' || i.severidad === 'Alta') &&
    i.estado !== 'Resuelto' && i.estado !== 'Cerrado'
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <ShieldAlert size={20} className="text-red-500 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">{criticas.length} incidencias requieren atención inmediata</p>
          <p className="text-xs text-red-500">Severidad Crítica o Alta – Sin resolver</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {criticas.map(inc => (
          <Card key={inc.id} className="border-l-4" style={{ borderLeftColor: inc.severidad === 'Crítica' ? '#EF4444' : '#F59E0B' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex gap-2">
                <Badge variant={severidadVariant(inc.severidad)} dot>{inc.severidad}</Badge>
                <Badge variant={estadoIncVariant(inc.estado)}>{inc.estado}</Badge>
              </div>
              <span className="text-[10px] text-muted">{timeAgo(inc.fechaCreacion)}</span>
            </div>
            <h3 className="text-sm font-semibold text-primary mb-1">{inc.titulo}</h3>
            <p className="text-xs text-secondary mb-3 line-clamp-2">{inc.descripcion}</p>
            <div className="flex items-center justify-between text-[10px] text-muted">
              <span>📍 {inc.proyecto}</span>
              <div className="flex items-center gap-1">
                <User size={10} /> {inc.responsable}
              </div>
            </div>
            {inc.fotos.length > 0 && (
              <div className="flex gap-1 mt-3">
                {inc.fotos.slice(0, 2).map((f, i) => (
                  <img key={i} src={f} alt="Evidencia" className="w-16 h-12 rounded-lg object-cover" />
                ))}
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-default">
              <Link href={`/incidencias/${inc.id}`}
                className="inline-flex items-center gap-1 text-xs text-brand-600 font-medium hover:underline">
                Ver detalle completo <ArrowRight size={12} />
              </Link>
            </div>
          </Card>
        ))}
        {criticas.length === 0 && (
          <div className="col-span-2 py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <ShieldAlert size={24} className="text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-primary">Sin incidencias críticas</p>
            <p className="text-xs text-muted mt-1">Todos los proyectos operan normalmente</p>
          </div>
        )}
      </div>
    </div>
  );
}
