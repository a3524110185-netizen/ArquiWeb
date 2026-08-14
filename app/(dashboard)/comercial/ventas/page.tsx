'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { ventasService, VentaApi } from '@/lib/services/ventas';
import { clientesService, ClienteApi } from '@/lib/services/clientes';
import { extractErrorMessage } from '@/lib/services/api';
import Card from '@/components/ui/Card';
import Badge, { BadgeVariant } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Select } from '@/components/ui/FormFields';
import Pagination, { usePagination } from '@/components/ui/Pagination';
import { formatCurrency, formatDate, getDefaultDateRange } from '@/lib/utils';
import { Loader2, AlertCircle, BarChart3, Plus } from 'lucide-react';

const PER_PAGE = 8;

const estadoVariant: Record<string, BadgeVariant> = {
  pagada: 'success', pendiente: 'warning', cancelada: 'danger', vencida: 'danger',
};

export default function VentasPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const canCreate = currentUser?.rol?.nombre === 'administrador';
  const [ventas, setVentas] = useState<VentaApi[]>([]);
  const [clientes, setClientes] = useState<ClienteApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const defaultRange = useState(() => getDefaultDateRange())[0];
  const [filtroCliente, setFiltroCliente] = useState('');
  const [desde, setDesde] = useState(defaultRange.desde);
  const [hasta, setHasta] = useState(defaultRange.hasta);

  useEffect(() => { clientesService.getClientes().then(setClientes).catch(() => {}); }, []);

  const cargarVentas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ventasService.getVentas({
        cliente_id: filtroCliente || undefined, desde: desde || undefined, hasta: hasta || undefined,
      });
      setVentas(data);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Error al cargar las ventas.'));
    } finally {
      setLoading(false);
    }
  }, [filtroCliente, desde, hasta]);

  useEffect(() => { cargarVentas(); }, [cargarVentas]);

  const { page, setPage, totalPages, paged, totalItems } = usePagination(ventas, PER_PAGE);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <BarChart3 className="text-sigo-primary" size={26} /> Ventas
          </h1>
          <p className="text-sm text-muted">Registro y seguimiento de ventas</p>
        </div>
        {canCreate && (
          <Button onClick={() => router.push('/comercial/ventas/nueva')}>
            <Plus size={16} /> Nueva Venta Directa
          </Button>
        )}
      </div>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select label="Cliente" placeholder="Todos los clientes" value={filtroCliente}
            onChange={e => { setFiltroCliente(e.target.value); setPage(1); }}
            options={clientes.map(c => ({ value: String(c.id), label: c.nombre }))} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-secondary">Desde</label>
            <input type="date" className="input-base" value={desde} onChange={e => { setDesde(e.target.value); setPage(1); }} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-secondary">Hasta</label>
            <input type="date" className="input-base" value={hasta} onChange={e => { setHasta(e.target.value); setPage(1); }} />
          </div>
        </div>
      </Card>

      <Card padding="none" className="overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="animate-spin text-sigo-primary" />
            <p className="text-sm text-muted">Cargando ventas...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="text-red-500 mx-auto" size={36} />
            <p className="text-sm font-medium text-red-500">{error}</p>
            <button onClick={cargarVentas} className="text-sm text-sigo-primary hover:underline font-medium">Reintentar</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-app border-b border-default">
                  <tr>
                    {['Folio', 'Cliente', 'Fecha', 'Total', 'Estado'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-secondary">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-default">
                  {paged.map(v => (
                    <tr key={v.id} onClick={() => router.push(`/comercial/ventas/${v.id}`)} className="hover:bg-app transition-colors cursor-pointer">
                      <td className="py-3 px-4 font-mono text-xs font-medium text-primary">{v.folio}</td>
                      <td className="py-3 px-4 text-xs text-secondary">{v.cliente?.nombre || '—'}</td>
                      <td className="py-3 px-4 text-xs text-secondary">{formatDate(v.fecha)}</td>
                      <td className="py-3 px-4 text-xs font-semibold text-primary">{formatCurrency(v.total)}</td>
                      <td className="py-3 px-4">
                        {v.estado ? <Badge variant={estadoVariant[v.estado.toLowerCase()] || 'gray'} dot>{v.estado}</Badge> : '—'}
                      </td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr><td colSpan={5} className="py-12 text-center text-muted text-sm">No hay ventas para los filtros seleccionados</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={totalItems} itemsPerPage={PER_PAGE} />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
