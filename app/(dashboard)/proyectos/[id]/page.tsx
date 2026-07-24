'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { proyectosService, ProyectoApi } from '@/lib/services/proyectos';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge, { proyectoEstadoVariant, getEstadoLabel, severidadVariant } from '@/components/ui/Badge';
import { formatCurrency, formatDate, formatDateTime, timeAgo } from '@/lib/utils';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Edit3,
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  Loader2,
  AlertCircle,
  Briefcase,
  HardHat,
  ShieldCheck,
  Activity,
  Image as ImageIcon,
  RefreshCw,
  FileText,
  CheckCircle2,
  XCircle,
  Ban,
} from 'lucide-react';
import Link from 'next/link';
import GestionarEquipoModal from '@/components/proyectos/GestionarEquipoModal';

// ─── Tipos de la API ──────────────────────────────────────────────────────────
interface ReporteApi {
  id: number;
  fecha?: string;
  created_at?: string;
  porcentaje_avance?: number;
  porcentajeAvance?: number;
  avance?: number;
  categoria?: string;
  descripcion?: string;
  usuario?: { nombre: string } | null;
  supervisor?: string;
  fotos?: { url: string; ruta?: string }[] | string[];
  fotos_count?: number;
  validado?: boolean;
  notas_validacion?: string | null;
  validado_el?: string | null;
  validador?: { id: number; nombre: string } | null;
}

interface ActividadApi {
  id?: number;
  tipo?: string;
  descripcion?: string;
  usuario?: { nombre: string } | null;
  created_at?: string;
  fecha?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getFotoUrl(foto: any): string {
  if (typeof foto === 'string') return foto;
  return foto?.url || foto?.ruta || '';
}

function getReporteAvance(r: ReporteApi): number {
  return r.porcentaje_avance ?? r.porcentajeAvance ?? r.avance ?? 0;
}

// ─── Skeletons ────────────────────────────────────────────────────────────────
function RowSkeleton() {
  return (
    <tr className="border-b border-default animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="py-3 px-3">
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full max-w-[80px]" />
        </td>
      ))}
    </tr>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ProyectoDetallePage() {
  const params = useParams();
  const id = params.id as string;
  const { currentUser } = useAuthStore();

  const [proyecto, setProyecto] = useState<ProyectoApi | null>(null);
  const [reportes, setReportes] = useState<ReporteApi[]>([]);
  const [actividad, setActividad] = useState<ActividadApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReportes, setLoadingReportes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fotoModal, setFotoModal] = useState<string | null>(null);
  const [equipoModalOpen, setEquipoModalOpen] = useState(false);
  const [validandoId, setValidandoId] = useState<number | null>(null);

  const isAdmin = currentUser?.rol?.nombre === 'administrador';
  const isGerente = currentUser?.rol?.nombre === 'gerente';
  const canEdit = isAdmin || isGerente;

  const handleValidarReporte = async (reporteId: number, accion: 'aprobar' | 'rechazar') => {
    let notas: string | undefined;
    if (accion === 'rechazar') {
      const input = prompt('Motivo del rechazo (obligatorio):');
      if (input === null) return;
      if (!input.trim()) { alert('El motivo es obligatorio para rechazar.'); return; }
      notas = input.trim();
    }
    setValidandoId(reporteId);
    try {
      await proyectosService.validarReporte(reporteId, accion, notas);
      setReportes(prev => prev.map(r =>
        r.id === reporteId
          ? { ...r, validado: accion === 'aprobar', notas_validacion: notas ?? r.notas_validacion }
          : r
      ));
    } catch (err: any) {
      alert(err.message || 'Error al validar el reporte.');
    } finally {
      setValidandoId(null);
    }
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setLoadingReportes(true);
    setError(null);
    try {
      const proyectoData = await proyectosService.getProyecto(id);
      setProyecto(proyectoData);
      setLoading(false);

      // Cargar reportes y actividad en paralelo
      const [reportesData, actividadData] = await Promise.all([
        proyectosService.getReportes(id).catch(() => []),
        proyectosService.getActividad(id).catch(() => []),
      ]);
      setReportes(reportesData);
      setActividad(actividadData);
    } catch (err: any) {
      console.error('Error cargando detalle:', err);
      setError(err.message || 'Error al consultar el proyecto.');
    } finally {
      setLoading(false);
      setLoadingReportes(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Cálculo de días ─────────────────────────────────────────────────────────
  const getDiasInfo = (inicioStr?: string, finStr?: string) => {
    if (!inicioStr) return { transcurridos: 0, totales: 0, porcentaje: 0 };
    const inicio = new Date(inicioStr);
    const fin = finStr ? new Date(finStr) : new Date();
    const hoy = new Date();
    const totalMs = Math.max(1, fin.getTime() - inicio.getTime());
    const transMs = Math.max(0, hoy.getTime() - inicio.getTime());
    const totales = Math.ceil(totalMs / 86400000);
    const transcurridos = Math.ceil(transMs / 86400000);
    const porcentaje = Math.min(100, Math.max(0, Math.round((transcurridos / totales) * 100)));
    return { transcurridos, totales, porcentaje: isNaN(porcentaje) ? 0 : porcentaje };
  };

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="animate-spin text-brand-600" />
        <p className="text-sm font-medium text-secondary">Cargando proyecto...</p>
      </div>
    );
  }

  if (error || !proyecto) {
    return (
      <div className="max-w-xl mx-auto my-12">
        <Card className="p-8 text-center space-y-4 border-red-200 dark:border-red-900/30">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-lg font-bold text-primary">Proyecto no encontrado</h2>
          <p className="text-sm text-muted">{error || 'El proyecto no existe o no tienes acceso.'}</p>
          <button onClick={fetchAll} className="btn-secondary inline-flex items-center gap-2 text-xs">
            <RefreshCw size={14} /> Reintentar
          </button>
          <Link href="/proyectos" className="btn-secondary inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Volver a lista
          </Link>
        </Card>
      </div>
    );
  }

  const avanceFisico = proyecto.avance ?? proyecto.avance_fisico ?? 0;
  const avanceFinanciero = proyecto.avance_financiero ?? 0;
  const diasInfo = getDiasInfo(proyecto.fecha_inicio, proyecto.fecha_fin);
  const incidenciasActivas = proyecto.incidencias_activas_count ?? proyecto.incidencias_count ?? 0;
  const usuariosAsignados = proyecto.usuarios || [];

  return (
    <div className="space-y-6">
      {/* Nav */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/proyectos" className="btn-secondary inline-flex items-center gap-2 text-xs">
          <ArrowLeft size={16} /> Volver a lista
        </Link>
        {canEdit && (
          <Link href={`/proyectos/${proyecto.id}/editar`} className="btn-primary inline-flex items-center gap-2 text-xs">
            <Edit3 size={16} /> Editar Proyecto
          </Link>
        )}
      </div>

      {/* Banner */}
      <Card className="p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {proyecto.imagen_portada ? (
              <img src={proyecto.imagen_portada} alt={proyecto.nombre}
                className="w-20 h-20 rounded-2xl object-cover border border-default shrink-0 shadow-sm" />
            ) : (
              <div className="w-20 h-20 rounded-2xl gradient-brand text-white flex items-center justify-center shrink-0 shadow-sm">
                <Building2 size={36} />
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded">
                  {proyecto.codigo || `PRJ-${proyecto.id}`}
                </span>
                <Badge variant={proyectoEstadoVariant(proyecto.estado)} dot size="md">
                  {getEstadoLabel(proyecto.estado)}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-primary tracking-tight">{proyecto.nombre}</h1>
              {proyecto.descripcion && (
                <p className="text-sm text-secondary max-w-2xl">{proyecto.descripcion}</p>
              )}
              <div className="flex items-center gap-4 pt-2 text-xs text-muted flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-brand-500" /> {proyecto.ubicacion}
                </span>
                {proyecto.cliente?.nombre && (
                  <span className="flex items-center gap-1">
                    <Briefcase size={14} className="text-amber-500" /> {proyecto.cliente.nombre}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar size={14} className="text-emerald-500" />
                  {formatDate(proyecto.fecha_inicio)} – {formatDate(proyecto.fecha_fin)}
                </span>
              </div>
            </div>
          </div>

          {/* Medidor de avance */}
          <div className="w-full lg:w-48 bg-app p-4 rounded-2xl border border-default text-center shrink-0">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Avance Físico</p>
            <div className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">{avanceFisico}%</div>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-brand-600 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(0, avanceFisico))}%` }} />
            </div>
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Avance del Proyecto</p>
            <p className="text-2xl font-bold text-primary mt-0.5">{avanceFisico}%</p>
            <p className="text-[10px] text-muted">Físico Registrado</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Días Transcurridos</p>
            <p className="text-2xl font-bold text-primary mt-0.5">{diasInfo.transcurridos} días</p>
            <p className="text-[10px] text-muted">De {diasInfo.totales} días proyectados</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Incidencias Activas</p>
            <p className="text-2xl font-bold text-primary mt-0.5">{incidenciasActivas}</p>
            <p className="text-[10px] text-muted">Requieren atención</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Presupuesto Asignado</p>
            <p className="text-xl font-bold text-primary mt-0.5">{formatCurrency(proyecto.presupuesto)}</p>
            <p className="text-[10px] text-muted">
              {avanceFinanciero > 0 ? `Avance Fin: ${avanceFinanciero}%` : 'Monto global'}
            </p>
          </div>
        </Card>
      </div>

      {/* Historial de Reportes / Avances */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <CardTitle className="flex items-center gap-2">
            <FileText size={18} className="text-brand-600" /> Historial de Avances
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-default">
                {['Fecha', 'Usuario', '%', 'Categoría', 'Descripción', 'Fotos', ...(isGerente ? ['Validación'] : [])].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingReportes
                ? Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)
                : reportes.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-sm text-muted">
                        Sin reportes de avance registrados.
                      </td>
                    </tr>
                  )
                  : reportes.map((r) => {
                    const fotos = (r.fotos || []) as any[];
                    const avance = getReporteAvance(r);
                    return (
                      <tr key={r.id} className="border-b border-default last:border-0 hover:bg-app transition-colors">
                        <td className="py-3 pl-0 px-3 text-xs text-secondary whitespace-nowrap">
                          {formatDate(r.fecha || r.created_at || '')}
                        </td>
                        <td className="py-3 px-3 text-xs text-secondary">
                          {typeof r.usuario === 'object' ? r.usuario?.nombre : (r.supervisor || '—')}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-xs font-semibold text-brand-600">{avance}%</span>
                        </td>
                        <td className="py-3 px-3 text-xs text-secondary">{r.categoria || '—'}</td>
                        <td className="py-3 px-3 text-xs text-secondary max-w-[200px]">
                          <p className="line-clamp-2">{r.descripcion || '—'}</p>
                        </td>
                        <td className="py-3 px-3">
                           <div className="flex gap-1">
                             {fotos.slice(0, 3).map((f, i) => {
                               const url = getFotoUrl(f);
                               return url ? (
                                 <button key={i} onClick={() => setFotoModal(url)}
                                   className="w-10 h-10 rounded-lg overflow-hidden border border-default hover:opacity-80 transition">
                                   <img src={url} alt="foto" className="w-full h-full object-cover" />
                                 </button>
                               ) : null;
                             })}
                             {fotos.length === 0 && (
                               <span className="text-[10px] text-muted">—</span>
                             )}
                           </div>
                         </td>
                         {/* Columna de validación — solo para Gerente */}
                         {isGerente && (
                           <td className="py-3 px-3">
                             {r.validado ? (
                               <div className="space-y-1">
                                 <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                                   <CheckCircle2 size={11} /> Aprobado
                                 </span>
                                 {r.notas_validacion && (
                                   <p className="text-[10px] text-muted line-clamp-1" title={r.notas_validacion}>
                                     {r.notas_validacion}
                                   </p>
                                 )}
                                 <button
                                   onClick={() => handleValidarReporte(r.id, 'rechazar')}
                                   disabled={validandoId === r.id}
                                   className="text-[10px] text-orange-500 hover:underline disabled:opacity-50 flex items-center gap-0.5"
                                 >
                                   {validandoId === r.id ? <Loader2 size={10} className="animate-spin" /> : <Ban size={10} />}
                                   Rechazar
                                 </button>
                               </div>
                             ) : (
                               <div className="space-y-1">
                                 <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                                   <XCircle size={11} /> Pendiente
                                 </span>
                                 <div className="flex gap-1">
                                   <button
                                     onClick={() => handleValidarReporte(r.id, 'aprobar')}
                                     disabled={validandoId === r.id}
                                     className="text-[10px] text-emerald-600 hover:underline disabled:opacity-50 flex items-center gap-0.5"
                                   >
                                     {validandoId === r.id ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle2 size={10} />}
                                     Aprobar
                                   </button>
                                   <span className="text-muted text-[10px]">·</span>
                                   <button
                                     onClick={() => handleValidarReporte(r.id, 'rechazar')}
                                     disabled={validandoId === r.id}
                                     className="text-[10px] text-red-500 hover:underline disabled:opacity-50 flex items-center gap-0.5"
                                   >
                                     {validandoId === r.id ? <Loader2 size={10} className="animate-spin" /> : <XCircle size={10} />}
                                     Rechazar
                                   </button>
                                 </div>
                               </div>
                             )}
                           </td>
                         )}
                       </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      </Card>

      {/* Timeline de Actividad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={18} className="text-brand-600" /> Actividad Reciente
          </CardTitle>
        </CardHeader>
        {loadingReportes ? (
          <div className="space-y-4 pl-2 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 mt-1" />
                <div className="space-y-1.5 flex-1 pb-4">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : actividad.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">Sin actividad registrada.</p>
        ) : (
          <div className="space-y-0 pl-2">
            {actividad.slice(0, 15).map((a, idx) => (
              <div key={a.id ?? idx} className="flex gap-4 relative">
                {idx !== actividad.length - 1 && (
                  <div className="absolute left-2 top-6 bottom-0 w-px bg-border" />
                )}
                <div className="w-4 h-4 rounded-full bg-brand-100 border-2 border-brand-500 shrink-0 mt-1 z-10" />
                <div className="pb-5">
                  <p className="text-sm font-medium text-primary">{a.descripcion}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {a.tipo && (
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-600 bg-brand-50 dark:bg-brand-900/20 px-1.5 py-0.5 rounded">
                        {a.tipo}
                      </span>
                    )}
                    {a.usuario && (
                      <span className="text-xs text-secondary">
                        {typeof a.usuario === 'object' ? a.usuario?.nombre : a.usuario}
                      </span>
                    )}
                    <span className="text-[10px] text-muted">
                      {timeAgo(a.created_at || a.fecha || '')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Personal Asignado */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4 border-b border-default flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users size={18} className="text-brand-600" />
            Personal Asignado ({usuariosAsignados.length})
          </CardTitle>
          {isAdmin && (
            <button 
              onClick={() => setEquipoModalOpen(true)}
              className="text-xs text-brand-600 hover:underline font-medium cursor-pointer bg-transparent border-none p-0">
              Gestionar Equipo
            </button>
          )}
        </CardHeader>

        {usuariosAsignados.length === 0 ? (
          <div className="p-8 text-center text-muted text-xs">
            Sin supervisores o ingenieros asignados aún.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
            {usuariosAsignados.map((usuario) => {
              const rolNombre = usuario.pivot?.rol_proyecto || usuario.rol?.nombre || 'Miembro';
              const isSupervisor = rolNombre.toLowerCase().includes('supervisor');
              const isIngeniero = rolNombre.toLowerCase().includes('ingeniero');
              return (
                <div key={usuario.id}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-default bg-app hover:bg-card transition-colors">
                  <div className="w-10 h-10 rounded-full gradient-brand text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {usuario.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-primary truncate">{usuario.nombre}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {isSupervisor && <ShieldCheck size={12} className="text-amber-500 shrink-0" />}
                      {isIngeniero && <HardHat size={12} className="text-emerald-500 shrink-0" />}
                      <span className="text-[10px] text-muted capitalize truncate">{rolNombre}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal de foto */}
      {fotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          onClick={() => setFotoModal(null)}>
          <img src={fotoModal} alt="Foto" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}

      {/* Modal Gestionar Equipo */}
      {isAdmin && proyecto && (
        <GestionarEquipoModal
          open={equipoModalOpen}
          onClose={() => setEquipoModalOpen(false)}
          proyectoId={proyecto.id}
          usuariosActuales={usuariosAsignados}
          onUpdate={fetchAll}
        />
      )}
    </div>
  );
}
