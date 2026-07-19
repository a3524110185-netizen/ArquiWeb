'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { reporteEstadoVariant } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/FormFields';
import Pagination, { usePagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import { CheckCircle, XCircle, Search, Eye } from 'lucide-react';
import Link from 'next/link';

const PER_PAGE = 8;

export default function ValidarReportesPage() {
  const { reportes, proyectos, aprobarReporte, rechazarReporte } = useStore();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [filterProyecto, setFilterProyecto] = useState('');
  const [rechazarModal, setRechazarModal] = useState<{ id: string; nombre: string } | null>(null);
  const [observacion, setObservacion] = useState('');

  const pendientes = reportes.filter(r => {
    const q = search.toLowerCase();
    const matchQ = r.proyecto.toLowerCase().includes(q) || r.supervisor.toLowerCase().includes(q);
    const matchP = !filterProyecto || r.proyectoId === filterProyecto;
    return r.estado === 'Pendiente' && matchQ && matchP;
  });

  const { page, setPage, totalPages, paged, totalItems } = usePagination(pendientes, PER_PAGE);

  const handleAprobar = (id: string) => { aprobarReporte(id); toast.success('Reporte aprobado'); };
  const handleRechazar = () => {
    if (!rechazarModal) return;
    if (!observacion.trim()) { toast.error('Ingresa el motivo de rechazo'); return; }
    rechazarReporte(rechazarModal.id, observacion);
    toast.success('Reporte rechazado', rechazarModal.nombre);
    setRechazarModal(null); setObservacion('');
  };

  return (
    <div className="space-y-4">
      {pendientes.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
            {pendientes.length} reporte{pendientes.length !== 1 ? 's' : ''} pendiente{pendientes.length !== 1 ? 's' : ''} de validación
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Reportes Pendientes de Validación</CardTitle>
        </CardHeader>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input-base pl-9" placeholder="Buscar..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="input-base sm:w-52" value={filterProyecto} onChange={e => { setFilterProyecto(e.target.value); setPage(1); }}>
            <option value="">Todos los proyectos</option>
            {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-default">
                {['Proyecto', 'Fecha', 'Turno', 'Avance', 'Supervisor', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(r => (
                <tr key={r.id} className="border-b border-default last:border-0 hover:bg-app transition-colors">
                  <td className="py-3 pl-0 px-3 text-xs font-medium text-primary max-w-[160px] truncate">{r.proyecto}</td>
                  <td className="py-3 px-3 text-xs text-secondary">{formatDate(r.fecha)}</td>
                  <td className="py-3 px-3 text-xs text-secondary">{r.turno}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="progress-bar w-16"><div className="progress-fill" style={{ width: `${r.porcentajeAvance}%` }} /></div>
                      <span className="text-xs font-medium">{r.porcentajeAvance}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-xs text-secondary">{r.supervisor}</td>
                  <td className="py-3 px-3"><Badge variant={reporteEstadoVariant(r.estado)}>{r.estado}</Badge></td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1">
                      <Link href={`/reportes-diarios/${r.id}`}>
                        <button className="p-1.5 rounded-lg text-secondary hover:text-brand-600 hover:bg-brand-50 transition-colors" title="Ver detalle"><Eye size={14} /></button>
                      </Link>
                      {r.estado === 'Pendiente' && (
                        <>
                          <button onClick={() => handleAprobar(r.id)} className="p-1.5 rounded-lg text-secondary hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Aprobar">
                            <CheckCircle size={14} />
                          </button>
                          <button onClick={() => setRechazarModal({ id: r.id, nombre: r.proyecto })} className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors" title="Rechazar">
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-muted">
                  {pendientes.length === 0 ? '✓ Todos los reportes han sido validados' : 'No se encontraron resultados'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={totalItems} itemsPerPage={PER_PAGE} />
      </Card>

      <Modal open={!!rechazarModal} onClose={() => setRechazarModal(null)} title="Rechazar Reporte"
        footer={<><Button variant="secondary" onClick={() => setRechazarModal(null)}>Cancelar</Button><Button variant="danger" onClick={handleRechazar}>Rechazar</Button></>}>
        <div className="space-y-3">
          <p className="text-sm text-secondary font-medium">{rechazarModal?.nombre}</p>
          <Textarea label="Motivo del rechazo *" rows={4} value={observacion}
            onChange={e => setObservacion(e.target.value)} placeholder="Explica el motivo..." />
        </div>
      </Modal>
    </div>
  );
}
