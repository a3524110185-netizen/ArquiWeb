'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { incidenciasService } from '@/lib/services/incidencias';
import { proyectosService } from '@/lib/services/proyectos';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge, { severidadVariant, estadoIncVariant } from '@/components/ui/Badge';
import { formatDate, formatDateTime, timeAgo } from '@/lib/utils';
import {
  AlertTriangle,
  AlertCircle,
  Calendar,
  Tag,
  Activity,
  Image as ImageIcon,
  User,
  ArrowLeft,
  Loader2,
  RefreshCw,
  SendHorizonal,
  PlayCircle,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getFotoUrl(foto: any): string {
  if (typeof foto === 'string') return foto;
  return foto?.url || foto?.ruta || foto?.path || '';
}

function normalizeEstado(e: string) {
  const map: Record<string, string> = {
    'abierta': 'Abierto', 'abierto': 'Abierto',
    'en_progreso': 'En Progreso',
    'resuelta': 'Resuelto', 'resuelto': 'Resuelto',
    'cerrada': 'Cerrado', 'cerrado': 'Cerrado',
  };
  return map[e?.toLowerCase()] ?? e ?? '—';
}

function normalizeSeveridad(s: string) {
  const map: Record<string, string> = {
    'critica': 'Crítica', 'alta': 'Alta', 'media': 'Media', 'baja': 'Baja',
  };
  return map[s?.toLowerCase()] ?? s ?? '—';
}

const borderBySeveridad: Record<string, string> = {
  'Crítica': '#EF4444', 'critica': '#EF4444',
  'Alta': '#F59E0B', 'alta': '#F59E0B',
  'Media': '#0EA5E9', 'media': '#0EA5E9',
  'Baja': '#10B981', 'baja': '#10B981',
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl animate-pulse">
      <div className="h-36 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
          <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
        </div>
        <div className="space-y-4">
          <div className="h-52 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function IncidenciaDetallePage() {
  const params = useParams();
  const id = params.id as string;
  const { currentUser } = useAuthStore();

  const [inc, setInc] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fotoModal, setFotoModal] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [comentario, setComentario] = useState('');
  const [comentarioMsg, setComentarioMsg] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  // States para gestión de Gerente
  const [ingenieros, setIngenieros] = useState<any[]>([]);
  const [selectedAsignadoId, setSelectedAsignadoId] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [errorIngenieros, setErrorIngenieros] = useState<string | null>(null);

  const fetchIncidencia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await incidenciasService.getIncidencia(id);
      setInc(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la incidencia.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIncidencia();
  }, [fetchIncidencia]);

  useEffect(() => {
    const fetchIngenieros = async () => {
      // Admin y gerente pueden ver y asignar ingenieros del proyecto
      const rolNombre = currentUser?.rol?.nombre?.toLowerCase();
      
      if (!inc?.proyecto_id) return;

      if (rolNombre === 'gerente' || rolNombre === 'administrador') {
        setErrorIngenieros(null);
        try {
          const projData = await proyectosService.getProyecto(inc.proyecto_id);
          const users = projData.usuarios || [];
          const ings = users.filter((u: any) => {
            const rolProyecto = (u.pivot?.rol_proyecto || u.rol?.nombre || '').toLowerCase();
            return rolProyecto.includes('ingeniero');
          });
          setIngenieros(ings);
        } catch (e: any) {
          console.error('Error al obtener el detalle del proyecto:', e);
          if (e?.status === 403) {
            setErrorIngenieros('No tienes acceso para ver los usuarios de este proyecto.');
          } else if (e?.status === 404) {
            setErrorIngenieros('El proyecto fue eliminado o no existe.');
          } else {
            setErrorIngenieros('Error al cargar la lista de ingenieros.');
          }
          setIngenieros([]);
        }
      }
    };
    fetchIngenieros();
    if (inc) {
      setSelectedAsignadoId(inc.asignado_a ? String(inc.asignado_a) : '');
      setSelectedEstado(inc.estado || '');
    }
  }, [inc, currentUser]);

  const handleCambiarEstado = async (nuevoEstado: string, asignadoId?: string, comentarioPre?: string) => {
    setLoadingAction(true);
    try {
      const parsedAsignadoId = asignadoId ? Number(asignadoId) : undefined;
      const updated = await incidenciasService.cambiarEstado(id, nuevoEstado, comentarioPre, parsedAsignadoId);
      setInc((prev: any) => ({ ...prev, ...updated, estado: nuevoEstado, asignado_a: parsedAsignadoId }));
      alert('Cambios guardados correctamente.');
      fetchIncidencia(); // Recargar para actualizar timeline y asignado
    } catch (err: any) {
      alert(err.message || 'Error al guardar los cambios.');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleComentario = async () => {
    if (!comentario.trim()) return;
    setSendingComment(true);
    try {
      await incidenciasService.agregarComentario(id, comentario.trim());
      setComentarioMsg('✅ Comentario agregado.');
      setComentario('');
      fetchIncidencia();
    } catch (err: any) {
      setComentarioMsg(`❌ ${err.message || 'Error al agregar comentario.'}`);
    } finally {
      setSendingComment(false);
      setTimeout(() => setComentarioMsg(''), 3000);
    }
  };

  if (loading) return <PageSkeleton />;

  if (error || !inc) {
    return (
      <div className="max-w-xl mx-auto my-12">
        <Card className="p-8 text-center space-y-4 border-red-200 dark:border-red-900/30">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-lg font-bold text-primary">Incidencia no encontrada</h2>
          <p className="text-sm text-muted">{error || 'No existe o no tienes acceso.'}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={fetchIncidencia} className="btn-secondary inline-flex items-center gap-2 text-xs">
              <RefreshCw size={14} /> Reintentar
            </button>
            <Link href="/incidencias" className="btn-secondary inline-flex items-center gap-2 text-xs">
              <ArrowLeft size={14} /> Volver
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const severidad = normalizeSeveridad(inc.severidad || inc.prioridad);
  const estado = normalizeEstado(inc.estado);
  const borderColor = borderBySeveridad[severidad] || '#94a3b8';
  const proyecto = inc.proyecto?.nombre || inc.proyecto_nombre || inc.proyectoNombre || '—';
  const proyectoCodigo = inc.proyecto?.codigo || inc.proyecto_codigo || inc.proyectoCodigo || '';
  const reportante = inc.reportante?.nombre || inc.reportante || inc.usuario?.nombre || '—';
  const asignado = inc.asignado?.nombre || inc.asignado || 'Sin asignar';
  const fechaCreacion = inc.fecha_creacion || inc.fechaCreacion || inc.created_at || '';
  const fechaUpdate = inc.fecha_actualizacion || inc.fechaActualizacion || inc.updated_at || fechaCreacion;
  const fotos = (inc.fotos || inc.evidencias || []) as any[];
  const timeline = (inc.timeline || inc.seguimiento || inc.historial || []) as any[];
  const comentarios = (inc.comentarios || []) as any[];

  const estadoActual = (inc.estado || '').toLowerCase();
  const canIniciar = estadoActual === 'abierta' || estadoActual === 'abierto';
  const canResolver = estadoActual === 'en_progreso' || estadoActual === 'abierta' || estadoActual === 'abierto';

  const userRole = currentUser?.rol?.nombre?.toLowerCase() || '';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Breadcrumb */}
      <Link href="/incidencias" className="btn-secondary inline-flex items-center gap-2 text-xs">
        <ArrowLeft size={14} /> Volver a incidencias
      </Link>

      {/* Header de la incidencia */}
      <div
        className="p-6 bg-card rounded-2xl border border-default shadow-sm border-l-4"
        style={{ borderLeftColor: borderColor }}
      >
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-primary">{inc.titulo}</h1>
              <Badge variant={severidadVariant(severidad)}>{severidad}</Badge>
            </div>
            <p className="text-sm font-medium">
              {inc.proyecto_id ? (
                <Link href={`/proyectos/${inc.proyecto_id}`} className="text-brand-600 hover:underline">
                  {proyectoCodigo ? `${proyectoCodigo} · ` : ''}{proyecto}
                </Link>
              ) : (
                <span className="text-brand-600">
                  {proyectoCodigo ? `${proyectoCodigo} · ` : ''}{proyecto}
                </span>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-secondary">
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {formatDate(fechaCreacion)}
              </span>
              {inc.categoria && (
                <span className="flex items-center gap-1">
                  <Tag size={14} /> {inc.categoria}
                </span>
              )}
              <span className="flex items-center gap-1">
                <User size={14} /> {reportante}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <Badge variant={estadoIncVariant(estado)} size="md">{estado}</Badge>
            <p className="text-[10px] text-muted">Actualizada: {timeAgo(fechaUpdate)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Descripción */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle size={18} /> Descripción del Problema
              </CardTitle>
            </CardHeader>
            <p className="text-sm text-secondary leading-relaxed">
              {inc.descripcion || 'Sin descripción.'}
            </p>
          </Card>

          {/* Fotos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon size={18} /> Evidencia Fotográfica
                {fotos.length > 0 && (
                  <span className="text-xs text-muted font-normal">({fotos.length} foto{fotos.length > 1 ? 's' : ''})</span>
                )}
              </CardTitle>
            </CardHeader>
            {fotos.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">Sin fotografías.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {fotos.map((f: any, i: number) => {
                  const url = getFotoUrl(f);
                  return url ? (
                    <div key={i}
                      className="aspect-video rounded-xl overflow-hidden cursor-pointer group"
                      onClick={() => setFotoModal(url)}>
                      <img src={url} alt="Evidencia"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </Card>

          {/* Timeline */}
          {timeline.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity size={18} /> Timeline de Seguimiento
                </CardTitle>
              </CardHeader>
              <div className="space-y-0 pl-2">
                {timeline.map((t: any, idx: number) => {
                  const accion = t.accion || t.descripcion || t.evento || '';
                  const usuario = t.usuario?.nombre || t.usuario || t.hecho_por || '—';
                  const fecha = t.fecha || t.created_at || '';
                  const estadoT = t.estado || '';
                  return (
                    <div key={idx} className="flex gap-4 relative">
                      {idx !== timeline.length - 1 && (
                        <div className="absolute left-2 top-6 bottom-0 w-px bg-border" />
                      )}
                      <div className="w-4 h-4 rounded-full bg-brand-100 border-2 border-brand-500 shrink-0 mt-1 z-10" />
                      <div className="pb-5">
                        <p className="text-sm font-medium text-primary">{accion}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-secondary flex items-center gap-1">
                            <User size={12} /> {usuario}
                          </span>
                          <span className="text-[10px] text-muted">{formatDateTime(fecha)}</span>
                          {estadoT && (
                            <Badge variant={estadoIncVariant(normalizeEstado(estadoT))}>
                              {normalizeEstado(estadoT)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Comentarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={18} /> Comentarios ({comentarios.length})
              </CardTitle>
            </CardHeader>
            <div className="space-y-4 mb-6">
              {comentarios.length === 0 && (
                <p className="text-sm text-muted text-center py-2">Sin comentarios.</p>
              )}
              {comentarios.map((c: any, idx: number) => {
                const autor = c.usuario?.nombre || c.autor || c.nombre || 'Usuario';
                const texto = c.comentario || c.texto || c.body || '';
                const fecha = c.created_at || c.fecha || '';
                return (
                  <div key={idx} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full gradient-brand text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {autor.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 bg-app rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-semibold text-primary">{autor}</p>
                        <p className="text-[10px] text-muted">{timeAgo(fecha)}</p>
                      </div>
                      <p className="text-xs text-secondary">{texto}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Agregar comentario - Ingeniero, Gerente y Administrador */}
            {(userRole === 'ingeniero' || userRole === 'gerente' || userRole === 'administrador') && (
              <div className="flex gap-3 pt-4 border-t border-default">
                <div className="w-8 h-8 rounded-full gradient-brand text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser?.nombre?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 space-y-2">
                  <textarea
                    className="input-base resize-none"
                    rows={3}
                    placeholder="Escribe un comentario..."
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                  />
                  {comentarioMsg && (
                    <p className="text-xs text-secondary">{comentarioMsg}</p>
                  )}
                  <button
                    onClick={handleComentario}
                    disabled={!comentario.trim() || sendingComment}
                    className="btn-primary inline-flex items-center gap-2 text-xs disabled:opacity-50">
                    {sendingComment
                      ? <Loader2 size={14} className="animate-spin" />
                      : <SendHorizonal size={14} />}
                    Enviar comentario
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Columna lateral: Acciones */}
        <div className="space-y-6">
          <Card className="border-brand-200 bg-brand-50/30 dark:bg-brand-900/10">
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {/* Acciones para Ingeniero */}
              {userRole === 'ingeniero' && (
                <>
                  {canIniciar && (
                    <button
                      onClick={() => handleCambiarEstado('en_progreso')}
                      disabled={loadingAction}
                      className="w-full btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-60">
                      {loadingAction
                        ? <Loader2 size={16} className="animate-spin" />
                        : <PlayCircle size={16} />}
                      Iniciar Atención
                    </button>
                  )}

                  {canResolver && (
                    <button
                      onClick={() => {
                        const c = prompt('Comentario de resolución (obligatorio para resolver):');
                        if (c === null) return;
                        if (!c.trim()) {
                          alert('El comentario es obligatorio para resolver la incidencia.');
                          return;
                        }
                        handleCambiarEstado('resuelta', undefined, c);
                      }}
                      disabled={loadingAction}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-60">
                      {loadingAction
                        ? <Loader2 size={16} className="animate-spin" />
                        : <CheckCircle2 size={16} />}
                      Marcar como Resuelta
                    </button>
                  )}

                  {!canIniciar && !canResolver && (
                    <p className="text-xs text-muted text-center py-2">
                      Esta incidencia está en estado: <strong>{estado}</strong>
                    </p>
                  )}
                </>
              )}

              {/* Acciones para Gerente */}
              {userRole === 'gerente' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-secondary">Responsable</label>
                    {errorIngenieros ? (
                      <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">{errorIngenieros}</p>
                    ) : (
                      <select
                        className="w-full bg-card text-primary border border-default rounded-lg px-3 py-2 text-xs"
                        value={selectedAsignadoId}
                        onChange={e => setSelectedAsignadoId(e.target.value)}
                      >
                        <option value="">Sin asignar</option>
                        {ingenieros.map(ing => (
                          <option key={ing.id} value={ing.id}>{ing.nombre}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-secondary">Estado</label>
                    <select
                      className="w-full bg-card text-primary border border-default rounded-lg px-3 py-2 text-xs"
                      value={selectedEstado}
                      onChange={e => setSelectedEstado(e.target.value)}
                    >
                      <option value="abierta">Abierta</option>
                      <option value="en_progreso">En Progreso</option>
                      <option value="resuelta">Resuelta</option>
                      <option value="cerrada">Cerrada</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      if (selectedEstado === 'resuelta' || selectedEstado === 'cerrada') {
                        const c = prompt(`Comentario de ${selectedEstado} (obligatorio):`);
                        if (c === null) return;
                        if (!c.trim()) {
                          alert(`El comentario es obligatorio para cambiar al estado ${selectedEstado}.`);
                          return;
                        }
                        handleCambiarEstado(selectedEstado, selectedAsignadoId || undefined, c);
                      } else {
                        handleCambiarEstado(selectedEstado, selectedAsignadoId || undefined);
                      }
                    }}
                    disabled={loadingAction}
                    className="w-full btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-60">
                    {loadingAction && <Loader2 size={16} className="animate-spin" />}
                    Guardar Cambios
                  </button>
                </div>
              )}

              {/* Admin (puede gestionar igual que gerente) */}
              {userRole === 'administrador' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-secondary">Responsable</label>
                    {errorIngenieros ? (
                      <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">{errorIngenieros}</p>
                    ) : (
                      <select
                        className="w-full bg-card text-primary border border-default rounded-lg px-3 py-2 text-xs"
                        value={selectedAsignadoId}
                        onChange={e => setSelectedAsignadoId(e.target.value)}
                      >
                        <option value="">Sin asignar</option>
                        {ingenieros.map(ing => (
                          <option key={ing.id} value={ing.id}>{ing.nombre}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-secondary">Estado</label>
                    <select
                      className="w-full bg-card text-primary border border-default rounded-lg px-3 py-2 text-xs"
                      value={selectedEstado}
                      onChange={e => setSelectedEstado(e.target.value)}
                    >
                      <option value="abierta">Abierta</option>
                      <option value="en_progreso">En Progreso</option>
                      <option value="resuelta">Resuelta</option>
                      <option value="cerrada">Cerrada</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      if (selectedEstado === 'resuelta' || selectedEstado === 'cerrada') {
                        const c = prompt(`Comentario de ${selectedEstado} (obligatorio):`);
                        if (c === null) return;
                        if (!c.trim()) {
                          alert(`El comentario es obligatorio para cambiar al estado ${selectedEstado}.`);
                          return;
                        }
                        handleCambiarEstado(selectedEstado, selectedAsignadoId || undefined, c);
                      } else {
                        handleCambiarEstado(selectedEstado, selectedAsignadoId || undefined);
                      }
                    }}
                    disabled={loadingAction}
                    className="w-full btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-60">
                    {loadingAction && <Loader2 size={16} className="animate-spin" />}
                    Guardar Cambios
                  </button>
                </div>
              )}

              {/* Supervisor (Solo lectura) */}
              {userRole === 'supervisor' && (
                <p className="text-xs text-muted text-center py-2">
                  Esta incidencia está en estado: <strong>{estado}</strong>
                </p>
              )}

              <hr className="border-default" />

              <div className="space-y-2 text-xs text-secondary">
                <div className="flex justify-between">
                  <span className="text-muted">Severidad</span>
                  <Badge variant={severidadVariant(severidad)} size="sm">{severidad}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Estado</span>
                  <Badge variant={estadoIncVariant(estado)} size="sm">{estado}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Reportante</span>
                  <span>{reportante}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Asignado a</span>
                  <span>{asignado}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Fecha</span>
                  <span>{formatDate(fechaCreacion)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal foto */}
      {fotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          onClick={() => setFotoModal(null)}>
          <img src={fotoModal} alt="Foto" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}
    </div>
  );
}
