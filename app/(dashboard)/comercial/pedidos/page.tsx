'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { pedidosService, PedidoApi } from '@/lib/services/pedidos';
import { clientesService, ClienteApi } from '@/lib/services/clientes';
import { extractErrorMessage } from '@/lib/services/api';
import Card from '@/components/ui/Card';
import Badge, { BadgeVariant } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Select } from '@/components/ui/FormFields';
import Pagination, { usePagination } from '@/components/ui/Pagination';
import { formatCurrency, formatDate, getDefaultDateRange } from '@/lib/utils';
import { Loader2, AlertCircle, ShoppingCart, Plus, Search } from 'lucide-react';

const PER_PAGE = 8;

const estadoVariant: Record<string, BadgeVariant> = {
  pendiente: 'warning', aprobado: 'success', rechazado: 'danger', entregado: 'purple',
};

export default function PedidosPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const rol = currentUser?.rol?.nombre || '';
  const canManage = rol === 'administrador' || rol === 'gerente';

  const [pedidos, setPedidos] = useState<PedidoApi[]>([]);
  const [clientes, setClientes] = useState<ClienteApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const defaultRange = useState(() => getDefaultDateRange())[0];
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [desde, setDesde] = useState(defaultRange.desde);
  const [hasta, setHasta] = useState(defaultRange.hasta);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { clientesService.getClientes().then(setClientes).catch(() => {}); }, []);

  const cargarPedidos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pedidosService.listar({
        cliente_id: filtroCliente || undefined,
        estado: filtroEstado || undefined,
        desde: desde || undefined,
        hasta: hasta || undefined,
      });
      setPedidos(data);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Error al cargar los pedidos.'));
    } finally {
      setLoading(false);
    }
  }, [filtroCliente, filtroEstado, desde, hasta]);

  useEffect(() => { cargarPedidos(); }, [cargarPedidos]);

  const pedidosFiltrados = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return pedidos;
    return pedidos.filter(p =>
      p.folio.toLowerCase().includes(q) || (p.cliente?.nombre || '').toLowerCase().includes(q)
    );
  }, [pedidos, searchTerm]);

  const { page, setPage, totalPages, paged, totalItems } = usePagination(pedidosFiltrados, PER_PAGE);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <ShoppingCart className="text-sigo-primary" size={26} /> Pedidos de Venta
          </h1>
          <p className="text-sm text-muted">Gestión de pedidos realizados por los clientes</p>
        </div>
        {canManage && (
          <Button onClick={() => router.push('/comercial/pedidos/nuevo')}>
            <Plus size={16} /> Nuevo Pedido
          </Button>
        )}
      </div>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-1">
            <label className="text-xs font-medium text-secondary mb-1 block">Buscar</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input type="text" className="input-base pl-9" placeholder="Folio o cliente..."
                value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
            </div>
          </div>
          <Select label="Cliente" placeholder="Todos los clientes" value={filtroCliente}
            onChange={e => { setFiltroCliente(e.target.value); setPage(1); }}
            options={clientes.map(c => ({ value: String(c.id), label: c.nombre }))} />
          <Select label="Estado" placeholder="Todos los estados" value={filtroEstado}
            onChange={e => { setFiltroEstado(e.target.value); setPage(1); }}
            options={[
              { value: 'pendiente', label: 'Pendiente' },
              { value: 'aprobado', label: 'Aprobado' },
              { value: 'rechazado', label: 'Rechazado' },
              { value: 'entregado', label: 'Entregado' },
            ]} />
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
            <p className="text-sm text-muted">Cargando pedidos...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="text-red-500 mx-auto" size={36} />
            <p className="text-sm font-medium text-red-500">{error}</p>
            <button onClick={cargarPedidos} className="text-sm text-sigo-primary hover:underline font-medium">Reintentar</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-app border-b border-default">
                  <tr>
                    {['Folio', 'Cliente', 'Fecha Pedido', 'Fecha Entrega', 'Total', 'Estado'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-secondary">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-default">
                  {paged.map(p => (
                    <tr key={p.id} onClick={() => router.push(`/comercial/pedidos/${p.id}`)} className="hover:bg-app transition-colors cursor-pointer">
                      <td className="py-3 px-4 font-mono text-xs font-medium text-primary">{p.folio}</td>
                      <td className="py-3 px-4 text-xs text-secondary">{p.cliente?.nombre || '—'}</td>
                      <td className="py-3 px-4 text-xs text-secondary">{formatDate(p.fecha_pedido)}</td>
                      <td className="py-3 px-4 text-xs text-secondary">{p.fecha_entrega ? formatDate(p.fecha_entrega) : '—'}</td>
                      <td className="py-3 px-4 text-xs font-semibold text-primary">{formatCurrency(p.total)}</td>
                      <td className="py-3 px-4">
                        <Badge variant={estadoVariant[p.estado.toLowerCase()] || 'gray'} dot>{p.estado}</Badge>
                      </td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr><td colSpan={6} className="py-12 text-center text-muted text-sm">No hay pedidos para los filtros seleccionados</td></tr>
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
