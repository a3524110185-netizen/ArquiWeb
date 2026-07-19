'use client';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useParams } from 'next/navigation';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge, { severidadVariant, estadoIncVariant } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { formatDate, formatDateTime, timeAgo } from '@/lib/utils';
import { AlertTriangle, MapPin, User, Calendar, Tag, Activity, Check, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import type { IncidenciaEstado } from '@/types';

export default function IncidenciaDetallePage() {
  const params = useParams();
  const id = params.id as string;
  const { incidencias, usuarios, updateIncidencia, cambiarEstadoIncidencia } = useStore();
  const { currentUser } = useAuthStore();
  const toast = useToast();
  const [fotoModal, setFotoModal] = useState<string | null>(null);
  
  const inc = incidencias.find(i => i.id === id) || incidencias[0];
  const [responsable, setResponsable] = useState(inc.responsable);

  const handleAsignar = () => {
    updateIncidencia(inc.id, { responsable });
    toast.success('Responsable asignado', `Se ha asignado a ${responsable}`);
  };

  const handleCambiarEstado = (nuevoEstado: IncidenciaEstado) => {
    cambiarEstadoIncidencia(inc.id, nuevoEstado, currentUser?.nombre || 'Usuario');
    toast.success('Estado actualizado', `La incidencia ahora está en: ${nuevoEstado}`);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="p-6 bg-card rounded-2xl border border-default shadow-sm border-l-4" style={{ borderLeftColor: inc.severidad === 'Crítica' ? '#EF4444' : inc.severidad === 'Alta' ? '#F59E0B' : inc.severidad === 'Media' ? '#0EA5E9' : '#10B981' }}>
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold text-primary">{inc.titulo}</h1>
              <Badge variant={severidadVariant(inc.severidad)}>{inc.severidad}</Badge>
            </div>
            <p className="text-sm font-medium text-brand-600 mb-4">{inc.proyecto}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-secondary">
              <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(inc.fechaCreacion)}</span>
              <span className="flex items-center gap-1"><Tag size={14} /> {inc.categoria}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Badge variant={estadoIncVariant(inc.estado)} size="md">{inc.estado}</Badge>
            <p className="text-[10px] text-muted">Última actualización: {timeAgo(inc.fechaActualizacion)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle size={18} /> Descripción del Problema</CardTitle></CardHeader>
            <p className="text-sm text-secondary leading-relaxed">{inc.descripcion}</p>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon size={18} /> Evidencia Fotográfica</CardTitle></CardHeader>
            <div className="grid grid-cols-2 gap-3">
              {inc.fotos.map((f, i) => (
                <div key={i} className="aspect-video rounded-xl overflow-hidden cursor-pointer" onClick={() => setFotoModal(f)}>
                  <img src={f} alt="Evidencia" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
              {inc.fotos.length === 0 && <p className="col-span-2 text-sm text-muted text-center py-4">Sin fotografías</p>}
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Activity size={18} /> Timeline de Resolución</CardTitle></CardHeader>
            <div className="space-y-4 pl-2">
              {inc.timeline.map((t, idx) => (
                <div key={idx} className="flex gap-4 relative">
                  {idx !== inc.timeline.length - 1 && <div className="absolute left-2 top-6 bottom-0 w-px bg-border" />}
                  <div className="w-4 h-4 rounded-full bg-brand-100 border-2 border-brand-500 shrink-0 mt-1 z-10" />
                  <div className="pb-4">
                    <p className="text-sm font-medium text-primary">{t.accion}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-secondary"><User size={12} className="inline mr-1" />{t.usuario}</span>
                      <span className="text-[10px] text-muted">{formatDateTime(t.fecha)}</span>
                      <Badge variant={estadoIncVariant(t.estado)}>{t.estado}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Panel de Gestión (Integra las funcionalidades pedidas) */}
          <Card className="border-brand-200 bg-brand-50/30 dark:bg-brand-900/10">
            <CardHeader><CardTitle>Gestión de Incidencia</CardTitle></CardHeader>
            
            <div className="space-y-5">
              {/* Asignar Responsable */}
              <div>
                <label className="text-xs font-medium text-secondary mb-1.5 block">Asignar Responsable</label>
                <div className="flex gap-2">
                  <select className="input-base bg-white dark:bg-card flex-1" value={responsable} onChange={e => setResponsable(e.target.value)}>
                    {usuarios.map(u => <option key={u.id} value={u.nombre}>{u.nombre} ({u.rol})</option>)}
                  </select>
                  <Button onClick={handleAsignar} disabled={responsable === inc.responsable}>Asignar</Button>
                </div>
              </div>

              <hr className="border-default" />

              {/* Cambiar Estado */}
              <div>
                <label className="text-xs font-medium text-secondary mb-2 block">Cambiar Estado</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Abierto', 'En Progreso', 'Resuelto', 'Cerrado'].map(est => (
                    <button
                      key={est}
                      onClick={() => handleCambiarEstado(est as IncidenciaEstado)}
                      disabled={inc.estado === est}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center gap-1
                        ${inc.estado === est 
                          ? 'bg-brand-600 text-white border-brand-600 cursor-default' 
                          : 'bg-white dark:bg-card text-secondary hover:border-brand-600 hover:text-brand-600'}`}
                    >
                      {inc.estado === est && <Check size={14} />} {est}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MapPin size={18} /> Ubicación GPS</CardTitle></CardHeader>
            <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
              <iframe
                width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight={0} marginWidth={0}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${inc.coordenadas.lng - 0.01},${inc.coordenadas.lat - 0.01},${inc.coordenadas.lng + 0.01},${inc.coordenadas.lat + 0.01}&layer=mapnik&marker=${inc.coordenadas.lat},${inc.coordenadas.lng}`}
              />
            </div>
          </Card>
        </div>
      </div>

      {fotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" onClick={() => setFotoModal(null)}>
          <img src={fotoModal} alt="Foto" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}
    </div>
  );
}
