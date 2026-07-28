'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { proyectosService, ProyectoApi } from '@/lib/services/proyectos';
import Card from '@/components/ui/Card';
import Badge, { proyectoEstadoVariant, getEstadoLabel } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  Building2, 
  Calendar, 
  MapPin, 
  ChevronRight 
} from 'lucide-react';
import Link from 'next/link';

export default function ProyectosPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();

  const [proyectos, setProyectos] = useState<ProyectoApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('todos');

  const isAdmin = currentUser?.rol?.nombre === 'administrador';

  const fetchProyectos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await proyectosService.getProyectos();
      setProyectos(data);
    } catch (err: any) {
      console.error('Error al cargar proyectos:', err);
      setError(err.message || 'Ocurrió un error al obtener la lista de proyectos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProyectos();
  }, [fetchProyectos]);

  // Filtrado de proyectos
  const filteredProyectos = proyectos.filter((p) => {
    const matchesSearch =
      p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.codigo && p.codigo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.ubicacion && p.ubicacion.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.cliente?.nombre && p.cliente.nombre.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesEstado =
      estadoFilter === 'todos' ||
      p.estado.toLowerCase() === estadoFilter.toLowerCase();

    return matchesSearch && matchesEstado;
  });

  return (
    <div className="space-y-6">
      {/* Header con título y botón Nuevo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Proyectos</h1>
          <p className="text-sm text-muted">
            Gestión y seguimiento de obras ({proyectos.length} en total)
          </p>
        </div>

        {isAdmin && (
          <Link
            href="/proyectos/nuevo"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Nuevo Proyecto</span>
          </Link>
        )}
      </div>

      {/* Barra de Filtros y Buscador */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Buscador por Nombre/Código */}
          <div className="relative w-full md:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              placeholder="Buscar por nombre, código o cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-9 text-sm"
            />
          </div>

          {/* Filtro por Estado */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'planeado', label: 'Planeado' },
              { id: 'a_tiempo', label: 'A Tiempo' },
              { id: 'retrasado', label: 'Retrasado' },
              { id: 'critico', label: 'Crítico' },
              { id: 'completado', label: 'Completado' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setEstadoFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  estadoFilter === f.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-app hover:bg-brand-50 dark:hover:bg-brand-900/20 text-secondary'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Estado: Loading (Skeleton) */}
      {loading && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-default animate-pulse flex items-center justify-between">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/6" />
          </div>
          <div className="divide-y divide-default">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
                <div className="hidden sm:block h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20 shrink-0" />
                <div className="hidden sm:block h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 shrink-0" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Estado: Error */}
      {!loading && error && (
        <Card className="p-8 text-center space-y-4 border-red-200 dark:border-red-900/30">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-primary">Error al cargar proyectos</h3>
            <p className="text-sm text-muted max-w-md mx-auto">{error}</p>
          </div>
          <button
            onClick={fetchProyectos}
            className="btn-secondary inline-flex items-center gap-2 mx-auto text-xs"
          >
            <RefreshCw size={14} />
            <span>Reintentar</span>
          </button>
        </Card>
      )}

      {/* Estado: Empty */}
      {!loading && !error && filteredProyectos.length === 0 && (
        <Card className="p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/20 flex items-center justify-center mx-auto">
            <FolderOpen size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-primary">No se encontraron proyectos</h3>
            <p className="text-sm text-muted max-w-md mx-auto">
              {searchQuery || estadoFilter !== 'todos'
                ? 'Intenta ajustar los filtros de búsqueda para encontrar lo que necesitas.'
                : 'Aún no hay proyectos registrados en la plataforma.'}
            </p>
          </div>
          {isAdmin && !searchQuery && estadoFilter === 'todos' && (
            <Link href="/proyectos/nuevo" className="btn-primary inline-flex items-center gap-2">
              <Plus size={16} />
              <span>Crear el primer proyecto</span>
            </Link>
          )}
        </Card>
      )}

      {/* Tabla de Proyectos */}
      {!loading && !error && filteredProyectos.length > 0 && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-app border-b border-default text-xs uppercase tracking-wider text-secondary">
                  <th className="py-3 px-4 font-semibold">Código</th>
                  <th className="py-3 px-4 font-semibold">Nombre</th>
                  <th className="py-3 px-4 font-semibold">Cliente</th>
                  <th className="py-3 px-4 font-semibold">Ubicación</th>
                  <th className="py-3 px-4 font-semibold">Estado</th>
                  <th className="py-3 px-4 font-semibold">Avance</th>
                  <th className="py-3 px-4 font-semibold">Inicio / Fin</th>
                  <th className="py-3 px-4 font-semibold text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default">
                {filteredProyectos.map((proyecto) => {
                  const avancePct = proyecto.avance ?? proyecto.avance_fisico ?? 0;
                  return (
                    <tr
                      key={proyecto.id}
                      onClick={() => router.push(`/proyectos/${proyecto.id}`)}
                      className="hover:bg-app transition-colors cursor-pointer group"
                    >
                      {/* Código */}
                      <td className="py-3.5 px-4 font-mono text-xs text-brand-600 dark:text-brand-400 font-bold whitespace-nowrap">
                        {proyecto.codigo || `PRJ-${proyecto.id}`}
                      </td>

                      {/* Nombre */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {proyecto.imagen_portada ? (
                            <img
                              src={proyecto.imagen_portada}
                              alt={proyecto.nombre}
                              className="w-9 h-9 rounded-lg object-cover shrink-0 border border-default"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 flex items-center justify-center shrink-0">
                              <Building2 size={18} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-primary truncate group-hover:text-brand-600 transition-colors">
                              {proyecto.nombre}
                            </p>
                            {proyecto.descripcion && (
                              <p className="text-xs text-muted truncate max-w-xs">
                                {proyecto.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Cliente */}
                      <td className="py-3.5 px-4 text-xs text-secondary whitespace-nowrap">
                        {proyecto.cliente?.nombre || 'Sin Cliente'}
                      </td>

                      {/* Ubicación */}
                      <td className="py-3.5 px-4 text-xs text-secondary max-w-[180px] truncate">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} className="text-muted shrink-0" />
                          <span className="truncate">{proyecto.ubicacion}</span>
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant={proyectoEstadoVariant(proyecto.estado)} dot size="sm">
                          {getEstadoLabel(proyecto.estado)}
                        </Badge>
                      </td>

                      {/* Avance */}
                      <td className="py-3.5 px-4 min-w-[130px]">
                        <div className="flex items-center gap-2">
                          <div className="progress-bar flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="progress-fill h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(100, Math.max(0, avancePct))}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-primary w-8 text-right">
                            {avancePct}%
                          </span>
                        </div>
                      </td>

                      {/* Fecha Inicio / Fin */}
                      <td className="py-3.5 px-4 text-xs text-muted whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="shrink-0" />
                          <span>
                            {formatDate(proyecto.fecha_inicio)} – {formatDate(proyecto.fecha_fin)}
                          </span>
                        </div>
                      </td>

                      {/* Flecha Detalle */}
                      <td className="py-3.5 px-4 text-right">
                        <ChevronRight
                          size={18}
                          className="text-muted group-hover:text-primary transition-colors inline-block"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
