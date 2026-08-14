'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { cotizacionesService, CotizacionApi } from '@/lib/services/cotizaciones';
import { extractErrorMessage } from '@/lib/services/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { BadgeVariant } from '@/components/ui/Badge';
import Pagination, { usePagination } from '@/components/ui/Pagination';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Search, Loader2, AlertCircle, FileText } from 'lucide-react';

const PER_PAGE = 8;

const estadoVariant: Record<string, BadgeVariant> = {
  borrador: 'gray', enviada: 'info', aceptada: 'success', rechazada: 'danger', convertida: 'purple',
};

export default function CotizacionesPage() {
  const router = useRouter();
  const [cotizaciones, setCotizaciones] = useState<CotizacionApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const cargarCotizaciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cotizacionesService.getCotizaciones();
      setCotizaciones(data);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Error al cargar las cotizaciones.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarCotizaciones(); }, [cargarCotizaciones]);

  const filtered = useMemo(() => cotizaciones.filter(c => {
    const q = search.toLowerCase();
    return c.folio.toLowerCase().includes(q) || (c.cliente?.nombre || '').toLowerCase().includes(q);
  }), [cotizaciones, search]);

  const { page, setPage, totalPages, paged, totalItems } = usePagination(filtered, PER_PAGE);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Cotizaciones</CardTitle>
          <Button onClick={() => router.push('/comercial/cotizaciones/nueva')}><Plus size={16} /> Nueva Cotización</Button>
        </CardHeader>

        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input-base pl-9" placeholder="Buscar por folio o cliente..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="animate-spin text-sigo-primary" />
            <p className="text-sm text-muted">Cargando cotizaciones...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="text-red-500 mx-auto" size={36} />
            <p className="text-sm font-medium text-red-500">{error}</p>
            <button onClick={cargarCotizaciones} className="text-sm text-sigo-primary hover:underline font-medium">Reintentar</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default">
                    {['Folio', 'Cliente', 'Fecha', 'Total', 'Estado'].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map(c => (
                    <tr key={c.id} onClick={() => router.push(`/comercial/cotizaciones/${c.id}`)}
                      className="border-b border-default last:border-0 hover:bg-app transition-colors cursor-pointer">
                      <td className="py-3 pl-0 px-3 font-mono text-xs font-medium text-primary">{c.folio}</td>
                      <td className="py-3 px-3 text-xs text-secondary">{c.cliente?.nombre || '—'}</td>
                      <td className="py-3 px-3 text-xs text-secondary">{formatDate(c.fecha)}</td>
                      <td className="py-3 px-3 text-xs font-semibold text-primary">{formatCurrency(c.total)}</td>
                      <td className="py-3 px-3">
                        <Badge variant={estadoVariant[c.estado?.toLowerCase()] || 'gray'} dot>{c.estado}</Badge>
                      </td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted">
                          <FileText size={28} />
                          <p className="text-sm">No hay cotizaciones registradas</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={totalItems} itemsPerPage={PER_PAGE} />
          </>
        )}
      </Card>
    </div>
  );
}
