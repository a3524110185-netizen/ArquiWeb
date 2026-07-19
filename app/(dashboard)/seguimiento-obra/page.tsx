'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { reporteEstadoVariant } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/FormFields';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import { Eye, CheckCircle, XCircle, Search, Image } from 'lucide-react';
import Link from 'next/link';

export default function SeguimientoObraPage() {
  const { reportes, proyectos, aprobarReporte, rechazarReporte } = useStore();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [filterProyecto, setFilterProyecto] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [rechazarModal, setRechazarModal] = useState<{ id: string; titulo: string } | null>(null);
  const [observacion, setObservacion] = useState('');
  const [fotoModal, setFotoModal] = useState<string | null>(null);

  const filtered = reportes.filter(r => {
    const q = search.toLowerCase();
    const matchQ = r.proyecto.toLowerCase().includes(q) || r.supervisor.toLowerCase().includes(q);
    const matchP = !filterProyecto || r.proyectoId === filterProyecto;
    const matchE = !filterEstado || r.estado === filterEstado;
    return matchQ && matchP && matchE;
  });

  const handleAprobar = (id: string) => { aprobarReporte(id); toast.success('Reporte aprobado'); };
  const handleRechazar = () => {
    if (!rechazarModal) return;
    if (!observacion.trim()) { toast.error('Ingresa una observación'); return; }
    rechazarReporte(rechazarModal.id, observacion);
    toast.success('Reporte rechazado');
    setRechazarModal(null); setObservacion('');
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input-base pl-9" placeholder="Buscar por proyecto o supervisor..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input-base sm:w-52" value={filterProyecto} onChange={e => setFilterProyecto(e.target.value)}>
            <option value="">Todos los proyectos</option>
            {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
          <select className="input-base sm:w-36" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>
      </Card>

      {/* Grid de reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(r => (
          <Card key={r.id} className="flex flex-col">
            {/* Fotos */}
            {r.fotos.length > 0 && (
              <div className="flex gap-1 mb-3 overflow-hidden rounded-lg h-32">
                {r.fotos.slice(0, 3).map((foto, i) => (
                  <div key={i} className="relative flex-1 min-w-0 cursor-pointer group" onClick={() => setFotoModal(foto)}>
                    <img src={foto} alt="Evidencia" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    {i === 2 && r.fotos.length > 3 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-bold">
                        +{r.fotos.length - 3}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs font-semibold text-primary truncate max-w-[180px]">{r.proyecto}</p>
                <p className="text-[10px] text-muted">{formatDate(r.fecha)} · {r.turno}</p>
              </div>
              <Badge variant={reporteEstadoVariant(r.estado)}>{r.estado}</Badge>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="progress-bar flex-1">
                <div className="progress-fill" style={{ width: `${r.porcentajeAvance}%` }} />
              </div>
              <span className="text-xs font-semibold text-brand-600">{r.porcentajeAvance}%</span>
            </div>

            <p className="text-xs text-secondary line-clamp-2 flex-1 mb-3">{r.descripcion}</p>

            <div className="flex items-center justify-between pt-3 border-t border-default">
              <p className="text-[10px] text-muted">Sup: {r.supervisor}</p>
              <div className="flex gap-1">
                <Link href={`/reportes-diarios/${r.id}`}>
                  <button className="p-1.5 rounded-lg text-secondary hover:text-brand-600 hover:bg-brand-50 transition-colors"><Eye size={14} /></button>
                </Link>
                {r.estado === 'Pendiente' && (
                  <>
                    <button onClick={() => handleAprobar(r.id)} className="p-1.5 rounded-lg text-secondary hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                      <CheckCircle size={14} />
                    </button>
                    <button onClick={() => setRechazarModal({ id: r.id, titulo: r.proyecto })} className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors">
                      <XCircle size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 py-12 text-center text-sm text-muted">No se encontraron reportes</div>
        )}
      </div>

      {/* Rechazar modal */}
      <Modal open={!!rechazarModal} onClose={() => setRechazarModal(null)} title="Rechazar Reporte"
        footer={<><Button variant="secondary" onClick={() => setRechazarModal(null)}>Cancelar</Button><Button variant="danger" onClick={handleRechazar}>Rechazar</Button></>}>
        <div className="space-y-3">
          <p className="text-sm text-secondary">{rechazarModal?.titulo}</p>
          <Textarea label="Motivo de rechazo" value={observacion} onChange={e => setObservacion(e.target.value)}
            rows={4} placeholder="Describe el motivo del rechazo..." />
        </div>
      </Modal>

      {/* Foto modal */}
      {fotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setFotoModal(null)}>
          <img src={fotoModal} alt="Foto ampliada" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}
    </div>
  );
}
