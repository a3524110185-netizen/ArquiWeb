'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge, { reporteEstadoVariant } from '@/components/ui/Badge';
import Pagination, { usePagination } from '@/components/ui/Pagination';
import { formatDate } from '@/lib/utils';
import { Search, Eye } from 'lucide-react';
import Link from 'next/link';

const PER_PAGE = 8;

export default function ReportesDiariosPage() {
  const { reportes, proyectos } = useStore();
  const [search, setSearch] = useState('');
  const [filterProyecto, setFilterProyecto] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  const filtered = reportes.filter(r => {
    const q = search.toLowerCase();
    const matchQ = r.proyecto.toLowerCase().includes(q) || r.supervisor.toLowerCase().includes(q);
    const matchP = !filterProyecto || r.proyectoId === filterProyecto;
    const matchE = !filterEstado || r.estado === filterEstado;
    return matchQ && matchP && matchE;
  });

  const { page, setPage, totalPages, paged, totalItems } = usePagination(filtered, PER_PAGE);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Historial de Reportes Diarios</CardTitle></CardHeader>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input-base pl-9" placeholder="Buscar reporte o supervisor..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="input-base sm:w-52" value={filterProyecto} onChange={e => { setFilterProyecto(e.target.value); setPage(1); }}>
            <option value="">Todos los proyectos</option>
            {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
          <select className="input-base sm:w-36" value={filterEstado} onChange={e => { setFilterEstado(e.target.value); setPage(1); }}>
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-default">
                {['Proyecto', 'Fecha', 'Turno', 'Avance', 'Supervisor', 'Estado', ''].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(r => (
                <tr key={r.id} className="border-b border-default last:border-0 hover:bg-app transition-colors">
                  <td className="py-3 pl-0 px-3 text-xs font-medium text-primary max-w-[200px] truncate">{r.proyecto}</td>
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
                    <Link href={`/reportes-diarios/${r.id}`}>
                      <button className="p-1.5 rounded-lg text-secondary hover:text-brand-600 hover:bg-brand-50 transition-colors" title="Ver detalle">
                        <Eye size={14} />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-sm text-muted">No se encontraron reportes</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={totalItems} itemsPerPage={PER_PAGE} />
      </Card>
    </div>
  );
}
