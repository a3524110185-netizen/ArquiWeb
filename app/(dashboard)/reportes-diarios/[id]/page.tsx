'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { reportesService } from '@/lib/services/reportes';
import { proyectosService, ProyectoApi } from '@/lib/services/proyectos';
import { ReporteApi } from '@/lib/services/reportes';
import { ApiError, extractErrorMessage } from '@/lib/services/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge, { reporteEstadoVariant } from '@/components/ui/Badge';
import { formatDate, formatDateTime, resolveMediaUrl } from '@/lib/utils';
import { ArrowLeft, Calendar, User, MapPin, Tag, FileText, CheckCircle, XCircle, Loader2, AlertCircle, Mail, Phone } from 'lucide-react';

function estadoLabel(validado: boolean | null): string {
  if (validado === true) return 'Aprobado';
  if (validado === false) return 'Rechazado';
  return 'Pendiente';
}

export default function ReporteDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [reporte, setReporte] = useState<ReporteApi | null>(null);
  const [proyecto, setProyecto] = useState<ProyectoApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fotoModal, setFotoModal] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportesService.obtener(id);
      setReporte(data);
      try {
        const proy = await proyectosService.getProyecto(data.proyecto_id);
        setProyecto(proy);
      } catch {
        // El nombre del proyecto es informativo; si falla, se muestra el ID como respaldo.
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 404) {
        router.replace('/reportes-diarios');
        return;
      }
      setError(extractErrorMessage(err, 'Error al cargar el reporte.'));
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { cargar(); }, [cargar]);

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-brand-600" />
        <p className="text-sm text-muted">Cargando reporte...</p>
      </div>
    );
  }

  if (error || !reporte) {
    return (
      <div className="py-16 text-center space-y-3">
        <AlertCircle className="text-red-500 mx-auto" size={36} />
        <p className="text-sm font-medium text-red-500">{error || 'Reporte no encontrado'}</p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={cargar} className="text-sm text-brand-600 hover:underline font-medium">Reintentar</button>
          <button onClick={() => router.push('/reportes-diarios')} className="text-sm text-secondary hover:underline font-medium">Volver al listado</button>
        </div>
      </div>
    );
  }

  const estado = estadoLabel(reporte.validado);

  return (
    <div className="space-y-4 max-w-5xl">
      <button onClick={() => router.push('/reportes-diarios')} className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors">
        <ArrowLeft size={16} /> Volver al listado
      </button>

      <div className="flex items-start justify-between flex-wrap gap-4 bg-card p-6 rounded-2xl border border-default shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-primary mb-2">Reporte de Avance</h1>
          <p className="text-sm font-medium text-brand-600 mb-4">{proyecto?.nombre || `Proyecto #${reporte.proyecto_id}`}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-secondary">
            <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(reporte.fecha_reporte)} · {reporte.turno}</span>
            <span className="flex items-center gap-1"><User size={14} /> {reporte.usuario.nombre}</span>
            <span className="flex items-center gap-1"><Tag size={14} /> {reporte.categoria}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <Badge variant={reporteEstadoVariant(estado)} className="mb-3">{estado}</Badge>
          <div className="text-center">
            <p className="text-[10px] text-muted mb-1 uppercase tracking-wider font-semibold">Avance Reportado</p>
            <div className="text-2xl font-bold text-brand-600">{reporte.avance}%</div>
          </div>
        </div>
      </div>

      {reporte.validado === false && reporte.notas_validacion && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
          <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">Motivo de rechazo</p>
            <p className="text-xs text-red-600 dark:text-red-300 mt-1">{reporte.notas_validacion}</p>
          </div>
        </div>
      )}

      {reporte.validado === true && reporte.notas_validacion && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 flex items-start gap-3">
          <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Notas de validación</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-300 mt-1">{reporte.notas_validacion}</p>
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
            <CardHeader><CardTitle>Evidencia Fotográfica ({reporte.fotos_count ?? reporte.fotos.length})</CardTitle></CardHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {reporte.fotos.map((f) => {
                const url = resolveMediaUrl((f as any).url || (f as any).ruta || (f as any).path);
                return (
                <div key={f.id} className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group" onClick={() => setFotoModal(url)}>
                  <img src={url} alt={f.descripcion || 'Evidencia'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {f.es_principal && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-brand-600 text-white text-[10px] font-semibold">Principal</span>
                  )}
                  {f.descripcion && (
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate">{f.descripcion}</span>
                  )}
                </div>
                );
              })}
              {reporte.fotos.length === 0 && <p className="col-span-3 text-sm text-muted text-center py-4">Sin fotografías anexadas</p>}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User size={18} /> Reportado por</CardTitle></CardHeader>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-primary">{reporte.usuario.nombre}</p>
              {reporte.usuario.email && (
                <p className="flex items-center gap-1.5 text-xs text-secondary"><Mail size={13} /> {reporte.usuario.email}</p>
              )}
              {reporte.usuario.telefono && (
                <p className="flex items-center gap-1.5 text-xs text-secondary"><Phone size={13} /> {reporte.usuario.telefono}</p>
              )}
            </div>
          </Card>

          {reporte.validador && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle size={18} /> Validado por</CardTitle></CardHeader>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-primary">{reporte.validador.nombre}</p>
                {reporte.validador.email && (
                  <p className="flex items-center gap-1.5 text-xs text-secondary"><Mail size={13} /> {reporte.validador.email}</p>
                )}
                {reporte.validado_el && (
                  <p className="text-xs text-muted">{formatDateTime(reporte.validado_el)}</p>
                )}
              </div>
            </Card>
          )}

          {proyecto?.ubicacion && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><MapPin size={18} /> Ubicación del proyecto</CardTitle></CardHeader>
              <p className="text-sm text-secondary">{proyecto.ubicacion}</p>
            </Card>
          )}
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
