'use client';

import { useState, useEffect, useCallback } from 'react';
import { proyectosService, ProyectoApi } from '@/lib/services/proyectos';
import { evidenciasService, Evidencia } from '@/lib/services/evidencias';
import { extractErrorMessage } from '@/lib/services/api';
import Card from '@/components/ui/Card';
import { formatDate, resolveMediaUrl } from '@/lib/utils';
import {
  Image as ImageIcon,
  ChevronDown,
  Loader2,
  AlertCircle,
  RefreshCw,
  X,
  ZoomIn,
  Folder,
} from 'lucide-react';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PhotoSkeleton() {
  return (
    <div className="aspect-square rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────
const TODOS = '';

export default function GaleriaEvidenciasPage() {
  const [proyectos, setProyectos] = useState<ProyectoApi[]>([]);
  const [selectedProyecto, setSelectedProyecto] = useState<string>(TODOS);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [loadingProyectos, setLoadingProyectos] = useState(true);
  const [loadingEvidencias, setLoadingEvidencias] = useState(true);
  const [errorProyectos, setErrorProyectos] = useState<string | null>(null);
  const [errorEvidencias, setErrorEvidencias] = useState<string | null>(null);
  const [fotoModal, setFotoModal] = useState<Evidencia | null>(null);

  // ── Cargar proyectos del usuario (para el filtro) ───────────────────────────
  const fetchProyectos = useCallback(async () => {
    setLoadingProyectos(true);
    setErrorProyectos(null);
    try {
      const data = await proyectosService.getProyectos();
      setProyectos(data);
    } catch (err: any) {
      setErrorProyectos(err.message || 'Error al cargar proyectos.');
    } finally {
      setLoadingProyectos(false);
    }
  }, []);

  useEffect(() => { fetchProyectos(); }, [fetchProyectos]);

  // ── Cargar evidencias: todas, o filtradas por proyecto ──────────────────────
  const fetchEvidencias = useCallback(async () => {
    setLoadingEvidencias(true);
    setErrorEvidencias(null);
    try {
      const data = await evidenciasService.listar(
        selectedProyecto ? { proyecto_id: selectedProyecto } : undefined
      );
      setEvidencias(data);
    } catch (err: any) {
      setErrorEvidencias(extractErrorMessage(err, 'Error al cargar evidencias.'));
    } finally {
      setLoadingEvidencias(false);
    }
  }, [selectedProyecto]);

  useEffect(() => { fetchEvidencias(); }, [fetchEvidencias]);

  const proyectoActual = proyectos.find(p => String(p.id) === selectedProyecto);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <ImageIcon size={24} className="text-brand-600" /> Galería de Evidencias
          </h1>
          <p className="text-sm text-muted mt-0.5">Fotografías y respaldos visuales de obra</p>
        </div>
        {!loadingEvidencias && (
          <button onClick={fetchEvidencias}
            className="btn-secondary inline-flex items-center gap-2 text-xs">
            <RefreshCw size={14} /> Actualizar
          </button>
        )}
      </div>

      {/* Selector de Proyecto */}
      <Card className="p-4">
        <label className="text-xs font-semibold text-secondary mb-2 block flex items-center gap-1.5">
          <Folder size={14} /> Filtrar por Proyecto
        </label>

        {loadingProyectos ? (
          <div className="flex items-center gap-2 text-xs text-muted">
            <Loader2 size={14} className="animate-spin" /> Cargando proyectos...
          </div>
        ) : errorProyectos ? (
          <div className="flex items-center gap-2 text-xs text-red-600">
            <AlertCircle size={14} /> {errorProyectos}
            <button onClick={fetchProyectos} className="underline">Reintentar</button>
          </div>
        ) : proyectos.length === 0 ? (
          <p className="text-xs text-muted">No tienes proyectos asignados.</p>
        ) : (
          <div className="relative">
            <select
              value={selectedProyecto}
              onChange={e => setSelectedProyecto(e.target.value)}
              className="input-base pr-10 appearance-none">
              <option value={TODOS}>— Todos los proyectos —</option>
              {proyectos.map(p => (
                <option key={p.id} value={String(p.id)}>
                  {p.codigo ? `${p.codigo} · ` : ''}{p.nombre}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>
        )}
      </Card>

      {/* Error al cargar evidencias */}
      {errorEvidencias && (
        <Card className="p-6 text-center border-red-200 dark:border-red-900/30 space-y-3">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle size={20} />
          </div>
          <p className="text-sm text-secondary">{errorEvidencias}</p>
          <button onClick={fetchEvidencias} className="btn-secondary text-xs inline-flex items-center gap-2">
            <RefreshCw size={14} /> Reintentar
          </button>
        </Card>
      )}

      {/* Grid de fotos */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-primary">
          {proyectoActual ? proyectoActual.nombre : 'Todos los proyectos'}
        </h2>
        {!loadingEvidencias && (
          <span className="text-xs text-muted">
            · {evidencias.length} foto{evidencias.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
        {loadingEvidencias
          ? Array.from({ length: 10 }).map((_, i) => <PhotoSkeleton key={i} />)
          : evidencias.length === 0 && !errorEvidencias
            ? (
              <div className="col-span-full py-16 text-center space-y-3">
                <ImageIcon size={40} className="text-muted mx-auto" />
                <p className="text-sm font-medium text-secondary">Sin evidencias fotográficas</p>
                <p className="text-xs text-muted">
                  {proyectoActual
                    ? 'Este proyecto aún no tiene fotos en sus reportes o incidencias.'
                    : 'Ninguno de tus proyectos tiene fotos todavía.'}
                </p>
              </div>
            )
            : evidencias.map((evidencia) => (
              <button
                key={evidencia.id}
                onClick={() => setFotoModal(evidencia)}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-default hover:border-brand-400 transition-all shadow-sm hover:shadow-md">
                <img
                  src={resolveMediaUrl(evidencia.url)}
                  alt={evidencia.descripcion || 'Evidencia'}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Overlay en hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {/* Proyecto + tipo + fecha */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] text-white font-medium truncate">
                    {evidencia.proyecto_nombre}
                    <span className="ml-1.5 text-white/70 font-normal capitalize">{evidencia.tipo}</span>
                  </p>
                  {evidencia.fecha && (
                    <p className="text-[10px] text-white/80">{formatDate(evidencia.fecha)}</p>
                  )}
                </div>
              </button>
            ))
        }
      </div>

      {/* Modal visor */}
      {fotoModal && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/95"
          onClick={() => setFotoModal(null)}>
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            onClick={() => setFotoModal(null)}>
            <X size={20} />
          </button>

          <img
            src={resolveMediaUrl(fotoModal.url)}
            alt="Evidencia ampliada"
            className="max-w-full max-h-[80vh] rounded-xl object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
          />

          <div className="mt-4 text-center space-y-1" onClick={e => e.stopPropagation()}>
            <p className="text-xs text-white/70">
              {fotoModal.proyecto_nombre}
              {fotoModal.fecha && ` · ${formatDate(fotoModal.fecha)}`}
            </p>
            {fotoModal.descripcion && (
              <p className="text-sm text-white/90 max-w-lg">{fotoModal.descripcion}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
