'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ventasService, VentaApi } from '@/lib/services/ventas';
import { extractErrorMessage } from '@/lib/services/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge, { BadgeVariant } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, BarChart3, Loader2, AlertCircle } from 'lucide-react';

const estadoVariant: Record<string, BadgeVariant> = {
  pagada: 'success', pendiente: 'warning', cancelada: 'danger', vencida: 'danger',
};

export default function DetalleVentaPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [venta, setVenta] = useState<VentaApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ventasService.getVenta(id);
      setVenta(data);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Error al cargar la venta.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-brand-600" />
        <p className="text-sm text-muted">Cargando venta...</p>
      </div>
    );
  }

  if (error || !venta) {
    return (
      <div className="py-16 text-center space-y-3">
        <AlertCircle className="text-red-500 mx-auto" size={36} />
        <p className="text-sm font-medium text-red-500">{error || 'Venta no encontrada'}</p>
        <button onClick={cargar} className="text-sm text-brand-600 hover:underline font-medium">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/comercial/ventas')} className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-app transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <BarChart3 className="text-brand-600" size={22} /> {venta.folio}
          </h1>
          <p className="text-xs text-muted">{formatDate(venta.fecha)}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{venta.folio}</CardTitle>
          {venta.estado && <Badge variant={estadoVariant[venta.estado.toLowerCase()] || 'gray'} dot>{venta.estado}</Badge>}
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Cliente</p>
            <p className="font-medium text-primary">{venta.cliente?.nombre || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Fecha</p>
            <p className="font-medium text-primary">{formatDate(venta.fecha)}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Total</p>
            <p className="font-bold text-primary">{formatCurrency(venta.total)}</p>
          </div>
        </div>

        {venta.items && venta.items.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default">
                    {['Descripción', 'Cantidad', 'Precio Unitario', 'Subtotal'].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {venta.items.map((it, i) => (
                    <tr key={it.id ?? i} className="border-b border-default last:border-0">
                      <td className="py-2 pl-0 px-3 text-xs text-primary">{it.descripcion}</td>
                      <td className="py-2 px-3 text-xs text-secondary">{it.cantidad}</td>
                      <td className="py-2 px-3 text-xs text-secondary">{formatCurrency(it.precio_unitario)}</td>
                      <td className="py-2 px-3 text-xs font-semibold text-primary">{formatCurrency(it.subtotal ?? it.cantidad * it.precio_unitario)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-4">
              <div className="w-full sm:w-64 space-y-1.5">
                {venta.subtotal != null && (
                  <div className="flex justify-between text-xs text-secondary">
                    <span>Subtotal</span><span>{formatCurrency(venta.subtotal)}</span>
                  </div>
                )}
                {venta.iva != null && (
                  <div className="flex justify-between text-xs text-secondary">
                    <span>IVA</span><span>{formatCurrency(venta.iva)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-primary pt-1.5 border-t border-default">
                  <span>Total</span><span>{formatCurrency(venta.total)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
