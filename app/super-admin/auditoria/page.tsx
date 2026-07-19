'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import Pagination from '@/components/ui/Pagination';
import { Search, ShieldCheck } from 'lucide-react';

export default function AuditoriaPage() {
  const { auditorias } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const filtered = auditorias.filter(a => 
    a.usuarioNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.detalle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.accion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <Card className="p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar en el registro de auditoría..."
            className="input-base pl-10"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-default bg-app/50 flex items-center gap-2">
          <ShieldCheck size={18} className="text-brand-500" />
          <h2 className="font-semibold text-primary text-sm">Registro de Actividad</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-app text-secondary uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-3">Fecha/Hora</th>
                <th className="px-6 py-3">Usuario</th>
                <th className="px-6 py-3">Empresa</th>
                <th className="px-6 py-3">Acción</th>
                <th className="px-6 py-3">Detalle</th>
                <th className="px-6 py-3">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y border-default">
              {paginated.map((a) => (
                <tr key={a.id} className="hover:bg-app transition-colors">
                  <td className="px-6 py-3 text-xs whitespace-nowrap text-muted">
                    {new Date(a.fecha).toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    <div className="font-medium text-primary">{a.usuarioNombre}</div>
                    <div className="text-[10px] text-muted">{a.usuarioEmail}</div>
                  </td>
                  <td className="px-6 py-3 text-secondary text-xs">
                    {a.empresaNombre || 'Global'}
                  </td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {a.accion}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="text-xs font-medium text-primary">{a.recurso}</div>
                    <div className="text-xs text-secondary">{a.detalle}</div>
                  </td>
                  <td className="px-6 py-3 text-xs font-mono text-muted">
                    {a.ip}
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-secondary">
                    No se encontraron registros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > itemsPerPage && (
          <div className="p-4 border-t border-default flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filtered.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
