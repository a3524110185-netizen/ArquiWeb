'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { incidenciasService } from '@/lib/services/incidencias';
import { proyectosService } from '@/lib/services/proyectos';
import { Incidencia } from '@/types';
import Card from '@/components/ui/Card';
import Badge, { severidadVariant, estadoIncVariant } from '@/components/ui/Badge';
import { timeAgo } from '@/lib/utils';
import {
  AlertTriangle,
  Search,
  Eye,
  RefreshCw,
  AlertCircle,
  InboxIcon,
} from 'lucide-react';
import Link from 'next/link';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-default bg-card p-5 space-y-3">
      <div className="flex justify-between">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-12" />
      </div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
    </div>
  );
}

// ─── Tipos que puede devolver la API ─────────────────────────────────────────
const ESTADO_TABS: { label: string; value: string }[] = [
  { label: 'Todas', value: '' },
  { label: 'Abiertas', value: 'abierta' },
  { label: 'En Progreso', value: 'en_progreso' },
  { label: 'Resueltas', value: 'resuelta' },
];

const severidadColorBorder: Record<string, string> = {
  'Crítica': 'border-l-red-500',
  'critica': 'border-l-red-500',
  'Alta': 'border-l-orange-400',
  'alta': 'border-l-orange-400',
  'Media': 'border-l-amber-400',
  'media': 'border-l-amber-400',
  'Baja': 'border-l-emerald-400',
  'baja': 'border-l-emerald-400',
};

// ─── Página ───────────────────────────────────────────────────────────────────
export default function IncidenciasPage() {
  const { currentUser } = useAuthStore();
  const roleName = currentUser?.rol?.nombre || '';

  const [incidencias, setIncidencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('');
  const [search, setSearch] = useState('');

  const [proyectosList, setProyectosList] = useState<any[]>([]);
  const [selectedProyectoId, setSelectedProyectoId] = useState('');
  const [selectedSeveridad, setSelectedSeveridad] = useState('');

  const fetchIncidencias = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      let data: any[] = [];
      const role = currentUser.rol?.nombre?.toLowerCase() || '';

      if (role === 'administrador' || role === 'gerente') {
        data = await incidenciasService.getIncidencias({
          estado: activeTab || undefined
        });
      } else if (role === 'ingeniero') {
        data = await incidenciasService.getAsignadas(activeTab || undefined);
      } else if (role === 'supervisor') {
        const proyectos = await proyectosService.getProyectos();
        const promises = proyectos.map((p: any) =>
          incidenciasService.getIncidenciasPorProyecto(p.id, {
            estado: activeTab || undefined
          })
        );
        const results = await Promise.all(promises);
        data = results.flat();
      }

      setIncidencias(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar incidencias.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentUser]);

  useEffect(() => {
    fetchIncidencias();
  }, [fetchIncidencias]);

  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const data = await proyectosService.getProyectos();
        setProyectosList(data);
      } catch (e) {
        console.error('Error fetching proyectos list:', e);
      }
    };
    if (currentUser) {
      fetchProyectos();
    }
  }, [currentUser]);

  // Filtro local por búsqueda, severidad y proyecto
  const filtered = incidencias.filter((i) => {
    // Filtro de severidad
    if (selectedSeveridad && (i.severidad || i.prioridad || '').toLowerCase() !== selectedSeveridad.toLowerCase()) {
      return false;
    }
    // Filtro de proyecto
    if (selectedProyectoId) {
      const projId = i.proyecto?.id || i.proyecto_id;
      if (String(projId) !== String(selectedProyectoId)) {
        return false;
      }
    }
    // Filtro por búsqueda
    if (!search) return true;
    const q = search.toLowerCase();
    const titulo = (i.titulo || '').toLowerCase();
    const proyecto = (i.proyecto?.nombre || i.proyecto || i.proyecto_nombre || '').toLowerCase();
    const reportante = (i.reportante?.nombre || i.reportante || i.usuario?.nombre || '').toLowerCase();
    return titulo.includes(q) || proyecto.includes(q) || reportante.includes(q);
  });

  const getProyectoLabel = (i: any) => {
    if (i.proyecto?.codigo && i.proyecto?.nombre) return `${i.proyecto.codigo} · ${i.proyecto.nombre}`;
    if (i.proyecto_codigo && i.proyecto_nombre) return `${i.proyecto_codigo} · ${i.proyecto_nombre}`;
    if (i.proyecto) return typeof i.proyecto === 'object' ? i.proyecto.nombre : i.proyecto;
    if (i.proyecto_nombre) return i.proyecto_nombre;
    return '—';
  };

  const getReportante = (i: any) => {
    if (i.reportante) return typeof i.reportante === 'object' ? i.reportante.nombre : i.reportante;
    if (typeof i.usuario === 'object' && i.usuario?.nombre) return i.usuario.nombre;
    return '—';
  };

  const getFecha = (i: any) => {
    return i.fechaCreacion || i.fecha_creacion || i.created_at || '';
  };

  const getSeveridad = (i: any) => i.severidad || i.prioridad || 'Media';
  const getEstado = (i: any) => {
    const e = i.estado || '';
    const map: Record<string, string> = {
      'abierta': 'Abierto', 'abierto': 'Abierto',
      'en_progreso': 'En Progreso', 'en progreso': 'En Progreso',
      'resuelta': 'Resuelto', 'resuelto': 'Resuelto',
      'cerrada': 'Cerrado', 'cerrado': 'Cerrado',
    };
    return map[e.toLowerCase()] ?? e;
  };

  const isGlobalView = roleName.toLowerCase() === 'administrador' || roleName.toLowerCase() === 'gerente';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <AlertTriangle size={24} className="text-amber-500" /> 
            {isGlobalView ? 'Incidencias Globales' : 'Mis Incidencias'}
          </h1>
          <p className="text-sm text-muted mt-0.5">
            {isGlobalView 
              ? 'Monitoreo de incidencias de todos los proyectos registrados' 
              : 'Incidencias asignadas a ti o de tus proyectos activos'}
          </p>
        </div>
        <button onClick={fetchIncidencias} disabled={loading}
          className="btn-secondary inline-flex items-center gap-2 text-xs">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Tabs de estado */}
      <div className="flex gap-1 p-1 bg-app rounded-xl border border-default w-fit flex-wrap">
        {ESTADO_TABS.map(tab => (
          <button key={tab.value}
            onClick={() => { setActiveTab(tab.value); setSearch(''); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${activeTab === tab.value
                ? 'bg-sigo-primary text-white shadow-sm'
                : 'text-secondary hover:text-primary'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input-base pl-9 w-full"
            placeholder="Buscar por título, proyecto o reportante..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="bg-card text-primary border border-default rounded-lg px-3 py-2 text-xs w-full sm:w-auto"
          value={selectedSeveridad}
          onChange={e => setSelectedSeveridad(e.target.value)}
        >
          <option value="">Todas las Severidades</option>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
          <option value="critica">Crítica</option>
        </select>

        <select
          className="bg-card text-primary border border-default rounded-lg px-3 py-2 text-xs w-full sm:w-auto sm:max-w-xs"
          value={selectedProyectoId}
          onChange={e => setSelectedProyectoId(e.target.value)}
        >
          <option value="">Todos los Proyectos</option>
          {proyectosList.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <Card className="p-6 text-center border-red-200 dark:border-red-900/30 space-y-3">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle size={20} />
          </div>
          <p className="text-sm text-secondary">{error}</p>
          <button onClick={fetchIncidencias} className="btn-secondary text-xs inline-flex items-center gap-2">
            <RefreshCw size={14} /> Reintentar
          </button>
        </Card>
      )}

      {/* Grid de incidencias */}
      {!error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : filtered.length === 0
              ? (
                <div className="col-span-full py-16 text-center space-y-3">
                  <InboxIcon size={40} className="text-muted mx-auto" />
                  <p className="text-sm font-medium text-secondary">No hay incidencias para mostrar</p>
                  {(activeTab || search || selectedSeveridad || selectedProyectoId) && (
                    <p className="text-xs text-muted">Prueba cambiando los filtros de búsqueda.</p>
                  )}
                </div>
              )
              : filtered.map((inc) => {
                const severidad = getSeveridad(inc);
                const estado = getEstado(inc);
                const borderColor = severidadColorBorder[severidad] || 'border-l-slate-400';

                return (
                  <Link key={inc.id} href={`/incidencias/${inc.id}`}>
                    <Card className={`p-5 hover:shadow-md transition-all cursor-pointer h-full border-l-4 ${borderColor} space-y-3`}>
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant={severidadVariant(severidad)} size="sm">{severidad}</Badge>
                        <Badge variant={estadoIncVariant(estado)} dot size="sm">{estado}</Badge>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-primary line-clamp-2">{inc.titulo}</p>
                        <p className="text-xs text-muted mt-1">{getProyectoLabel(inc)}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-default">
                        <p className="text-[10px] text-muted">
                          Reportó: {getReportante(inc)}
                        </p>
                        <p className="text-[10px] text-muted">{timeAgo(getFecha(inc))}</p>
                      </div>
                    </Card>
                  </Link>
                );
              })
          }
        </div>
      )}
    </div>
  );
}

