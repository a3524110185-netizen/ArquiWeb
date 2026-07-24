'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  AlertTriangle,
  Clock,
  Activity,
  Image as ImageIcon,
  RefreshCw,
  Loader2,
  ClipboardList,
} from 'lucide-react';
import { proyectosService, ProyectoApi, ReporteApi } from '@/lib/services/proyectos';
import { formatDate } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────
interface ReporteConProyecto extends ReporteApi {
  proyectoNombre: string;
}

function tiempoRelativo(fechaStr: string): string {
  const fecha = new Date(fechaStr);
  const ahora = new Date();
  const diffMs = ahora.getTime() - fecha.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDias = Math.floor(diffHrs / 24);

  if (diffMin < 1) return 'hace un momento';
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHrs < 24) return `hace ${diffHrs} hora${diffHrs !== 1 ? 's' : ''}`;
  if (diffDias < 7) return `hace ${diffDias} día${diffDias !== 1 ? 's' : ''}`;
  return formatDate(fechaStr);
}

function avanceColor(avance: number): string {
  if (avance <= 25) return 'text-red-500';
  if (avance <= 50) return 'text-orange-500';
  if (avance <= 75) return 'text-yellow-500';
  return 'text-emerald-500';
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { currentUser } = useAuthStore();

  const [proyectos, setProyectos] = useState<ProyectoApi[]>([]);
  const [reportesRecientes, setReportesRecientes] = useState<ReporteConProyecto[]>([]);
  const [loadingKpis, setLoadingKpis] = useState(true);
  const [loadingReportes, setLoadingReportes] = useState(true);

  const roleName = currentUser?.rol?.nombre || 'Usuario';
  const roleLabels: Record<string, string> = {
    administrador: 'Administrador',
    gerente: 'Gerente',
    supervisor: 'Supervisor',
    ingeniero: 'Ingeniero',
  };

  // Carga de proyectos para KPIs
  const fetchProyectos = useCallback(async () => {
    setLoadingKpis(true);
    try {
      const data = await proyectosService.getProyectos();
      setProyectos(data);
    } catch {
      // silencioso, se muestra "--"
    } finally {
      setLoadingKpis(false);
    }
  }, []);

  // Carga de reportes recientes (últimos 10 de todos los proyectos)
  const fetchReportesRecientes = useCallback(async () => {
    setLoadingReportes(true);
    try {
      const proyectosData = await proyectosService.getProyectos();
      const resultados = await Promise.allSettled(
        proyectosData.map((p) =>
          proyectosService.getReportes(p.id).then((reportes) =>
            reportes.map((r) => ({ ...r, proyectoNombre: p.nombre }))
          )
        )
      );

      const todos: ReporteConProyecto[] = [];
      resultados.forEach((r) => {
        if (r.status === 'fulfilled') todos.push(...r.value);
      });

      // Ordenar por fecha descendente y tomar los primeros 10
      todos.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setReportesRecientes(todos.slice(0, 10));
    } catch {
      // silencioso
    } finally {
      setLoadingReportes(false);
    }
  }, []);

  useEffect(() => {
    fetchProyectos();
    fetchReportesRecientes();
  }, [fetchProyectos, fetchReportesRecientes]);

  // KPIs derivados
  const proyectosActivos = proyectos.filter(
    (p) => p.estado === 'a_tiempo' || p.estado === 'retrasado' || p.estado === 'critico'
  ).length;
  const totalPresupuesto = proyectos.reduce((s, p) => s + (p.presupuesto ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Bienvenida */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-700 to-accent text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold">
          ¡Bienvenido, {currentUser?.nombre || 'Usuario'}!
        </h1>
        <p className="mt-2 text-brand-100 text-sm sm:text-base flex items-center gap-2">
          <span>Rol actual:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-medium text-xs uppercase tracking-wider">
            {roleLabels[roleName] || roleName}
          </span>
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 flex items-center justify-center shrink-0">
            <FolderOpen size={24} />
          </div>
          <div>
            <p className="text-xs text-muted font-medium">Proyectos Activos</p>
            <p className="text-2xl font-bold text-primary mt-0.5">
              {loadingKpis ? <Loader2 size={18} className="animate-spin text-muted" /> : proyectosActivos}
            </p>
            <p className="text-[10px] text-muted">{proyectos.length} proyectos en total</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0">
            <ClipboardList size={24} />
          </div>
          <div>
            <p className="text-xs text-muted font-medium">Reportes Totales</p>
            <p className="text-2xl font-bold text-primary mt-0.5">
              {loadingReportes
                ? <Loader2 size={18} className="animate-spin text-muted" />
                : reportesRecientes.length >= 10 ? '10+' : reportesRecientes.length}
            </p>
            <p className="text-[10px] text-muted">Últimos registrados</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 flex items-center justify-center shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs text-muted font-medium">Avance Promedio</p>
            <p className="text-2xl font-bold text-primary mt-0.5">
              {loadingKpis ? (
                <Loader2 size={18} className="animate-spin text-muted" />
              ) : proyectos.length > 0 ? (
                `${Math.round(
                  proyectos.reduce((s, p) => s + (p.avance ?? p.avance_fisico ?? 0), 0) / proyectos.length
                )}%`
              ) : '--'}
            </p>
            <p className="text-[10px] text-muted">Físico de proyectos</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-muted font-medium">Supervisores</p>
            <p className="text-2xl font-bold text-primary mt-0.5">
              {loadingReportes ? (
                <Loader2 size={18} className="animate-spin text-muted" />
              ) : (
                new Set(reportesRecientes.map((r) => r.usuario?.id)).size
              )}
            </p>
            <p className="text-[10px] text-muted">Con actividad reciente</p>
          </div>
        </Card>
      </div>

      {/* Timeline de Actividad Reciente */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4 border-b border-default">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock size={18} className="text-brand-600" />
            <span>Actividad Reciente</span>
            {!loadingReportes && reportesRecientes.length > 0 && (
              <span className="text-xs font-normal text-muted">(últimos {reportesRecientes.length} reportes)</span>
            )}
          </CardTitle>
          <button
            onClick={fetchReportesRecientes}
            disabled={loadingReportes}
            className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-800 font-medium disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={13} className={loadingReportes ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </CardHeader>

        {/* Loading */}
        {loadingReportes && (
          <div className="pt-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-3/4" />
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loadingReportes && reportesRecientes.length === 0 && (
          <div className="py-10 text-center space-y-2">
            <Activity size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-muted">No hay actividad reciente registrada.</p>
          </div>
        )}

        {/* Timeline */}
        {!loadingReportes && reportesRecientes.length > 0 && (
          <div className="pt-4 space-y-0">
            {reportesRecientes.map((reporte, index) => {
              const fotoPrincipal =
                reporte.fotos?.find((f) => f.es_principal) ?? reporte.fotos?.[0];
              const isLast = index === reportesRecientes.length - 1;

              return (
                <div key={reporte.id} className="flex gap-3 group">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-9 h-9 rounded-full gradient-brand text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm z-10">
                      {reporte.usuario?.nombre?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                    {!isLast && <div className="w-px flex-1 bg-border my-1 ml-0" />}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 pb-4 ${isLast ? '' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-primary">
                          <span className="font-semibold">{reporte.usuario?.nombre}</span>
                          {' registró avance del '}
                          <span className={`font-bold ${avanceColor(reporte.avance)}`}>
                            {reporte.avance}%
                          </span>
                          {' en '}
                          <span className="font-medium">{reporte.proyectoNombre}</span>
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                          {tiempoRelativo(reporte.created_at)} · {reporte.turno} · {reporte.categoria}
                        </p>
                        {reporte.descripcion && (
                          <p className="text-xs text-secondary mt-1 line-clamp-1 italic">
                            "{reporte.descripcion}"
                          </p>
                        )}
                      </div>

                      {/* Thumbnail */}
                      {fotoPrincipal && (
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-default shrink-0 shadow-sm">
                          <img
                            src={fotoPrincipal.url}
                            alt="Evidencia"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
