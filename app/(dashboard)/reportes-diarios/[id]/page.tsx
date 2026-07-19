'use client';
import { useStore } from '@/store/useStore';
import { useParams } from 'next/navigation';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge, { reporteEstadoVariant } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { Calendar, User, MapPin, Tag, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function ReporteDetallePage() {
  const params = useParams();
  const id = params.id as string;
  const { reportes } = useStore();
  const [fotoModal, setFotoModal] = useState<string | null>(null);

  const reporte = reportes.find(r => r.id === id) || reportes[0];

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-start justify-between bg-card p-6 rounded-2xl border border-default shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-primary mb-2">Reporte de Avance</h1>
          <p className="text-sm font-medium text-brand-600 mb-4">{reporte.proyecto}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-secondary">
            <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(reporte.fecha)} · {reporte.turno}</span>
            <span className="flex items-center gap-1"><User size={14} /> {reporte.supervisor}</span>
            <span className="flex items-center gap-1"><Tag size={14} /> {reporte.categoria}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <Badge variant={reporteEstadoVariant(reporte.estado)} className="mb-3">{reporte.estado}</Badge>
          <div className="text-center">
            <p className="text-[10px] text-muted mb-1 uppercase tracking-wider font-semibold">Avance Reportado</p>
            <div className="text-2xl font-bold text-brand-600">{reporte.porcentajeAvance}%</div>
          </div>
        </div>
      </div>

      {reporte.estado === 'Rechazado' && reporte.observaciones && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
          <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">Motivo de rechazo</p>
            <p className="text-xs text-red-600 dark:text-red-300 mt-1">{reporte.observaciones}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText size={18} /> Descripción de Actividades</CardTitle></CardHeader>
            <p className="text-sm text-secondary leading-relaxed">{reporte.descripcion}</p>
          </Card>

          <Card>
            <CardHeader><CardTitle>Evidencia Fotográfica ({reporte.fotos.length})</CardTitle></CardHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {reporte.fotos.map((f, i) => (
                <div key={i} className="aspect-video rounded-xl overflow-hidden cursor-pointer" onClick={() => setFotoModal(f)}>
                  <img src={f} alt="Evidencia" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
              {reporte.fotos.length === 0 && <p className="col-span-3 text-sm text-muted text-center py-4">Sin fotografías anexadas</p>}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MapPin size={18} /> Ubicación (GPS)</CardTitle></CardHeader>
            <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
              <iframe
                width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight={0} marginWidth={0}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${reporte.coordenadas.lng - 0.01},${reporte.coordenadas.lat - 0.01},${reporte.coordenadas.lng + 0.01},${reporte.coordenadas.lat + 0.01}&layer=mapnik&marker=${reporte.coordenadas.lat},${reporte.coordenadas.lng}`}
                style={{ border: 0 }}
              />
            </div>
            <p className="text-xs text-muted text-center mt-2 font-mono">{reporte.coordenadas.lat.toFixed(6)}, {reporte.coordenadas.lng.toFixed(6)}</p>
          </Card>
        </div>
      </div>

      {fotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setFotoModal(null)}>
          <img src={fotoModal} alt="Foto ampliada" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}
    </div>
  );
}
