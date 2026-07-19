'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge, { severidadVariant, estadoIncVariant } from '@/components/ui/Badge';
import Pagination, { usePagination } from '@/components/ui/Pagination';
import { formatDate } from '@/lib/utils';
import { Search, Eye, Filter } from 'lucide-react';
import Link from 'next/link';

const PER_PAGE = 8;

export default function IncidenciasPage() {
  const { incidencias, proyectos } = useStore();
  const [search, setSearch] = useState('');
  const [filterProyecto, setFilterProyecto] = useState('');
  const [filterSeveridad, setFilterSeveridad] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  const filtered = incidencias.filter(i => {
    const q = search.toLowerCase();
    const matchQ = i.titulo.toLowerCase().includes(q) || i.responsable.toLowerCase().includes(q);
    const matchP = !filterProyecto || i.proyectoId === filterProyecto;
    const matchS = !filterSeveridad || i.severidad === filterSeveridad;
    const matchE = !filterEstado || i.estado === filterEstado;
    return matchQ && matchP && matchS && matchE;
  });

  const { page, setPage, totalPages, paged, totalItems } = usePagination(filtered, PER_PAGE);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Registro General de Incidencias</CardTitle></CardHeader>

        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input-base pl-9" placeholder="Buscar por título o responsable..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="input-base md:w-48" value={filterProyecto} onChange={e => { setFilterProyecto(e.target.value); setPage(1); }}>
            <option value="">Todos los proyectos</option>
            {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
          <div className="flex gap-3 md:w-auto">
            <select className="input-base w-1/2 md:w-32" value={filterSeveridad} onChange={e => { setFilterSeveridad(e.target.value); setPage(1); }}>
              <option value="">Severidad</option>
              {['Crítica', 'Alta', 'Media', 'Baja'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="input-base w-1/2 md:w-32" value={filterEstado} onChange={e => { setFilterEstado(e.target.value); setPage(1); }}>
              <option value="">Estado</option>
              {['Abierto', 'En Progreso', 'Resuelto', 'Cerrado'].map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-default">
                {['Título', 'Proyecto', 'Fecha', 'Severidad', 'Estado', 'Responsable', ''].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(i => (
                <tr key={i.id} className="border-b border-default last:border-0 hover:bg-app transition-colors">
                  <td className="py-3 pl-0 px-3">
                    <p className="text-xs font-medium text-primary max-w-[200px] truncate">{i.titulo}</p>
                    <p className="text-[10px] text-muted">{i.categoria}</p>
                  </td>
                  <td className="py-3 px-3 text-xs text-secondary max-w-[150px] truncate">{i.proyecto}</td>
                  <td className="py-3 px-3 text-xs text-secondary">{formatDate(i.fechaCreacion)}</td>
                  <td className="py-3 px-3"><Badge variant={severidadVariant(i.severidad)} size="sm">{i.severidad}</Badge></td>
                  <td className="py-3 px-3"><Badge variant={estadoIncVariant(i.estado)} dot>{i.estado}</Badge></td>
                  <td className="py-3 px-3 text-xs text-secondary">{i.responsable}</td>
                  <td className="py-3 px-3">
                    <Link href={`/incidencias/${i.id}`}>
                      <button className="p-1.5 rounded-lg text-secondary hover:text-brand-600 hover:bg-brand-50 transition-colors" title="Ver detalle">
                        <Eye size={14} />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-sm text-muted">No se encontraron incidencias</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={totalItems} itemsPerPage={PER_PAGE} />
      </Card>
    </div>
  );
}
