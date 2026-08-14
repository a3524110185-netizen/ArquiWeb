'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ventasService, VentaApi } from '@/lib/services/ventas';
import { extractErrorMessage } from '@/lib/services/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { BadgeVariant } from '@/components/ui/Badge';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { ArrowLeft, BarChart3, Loader2, AlertCircle, Printer, User, Mail, Phone, FileText, CreditCard } from 'lucide-react';

const estadoVariant: Record<string, BadgeVariant> = {
  completada: 'success', pagada: 'success', pendiente: 'warning', cancelada: 'danger', vencida: 'danger',
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
        <Loader2 size={28} className="animate-spin text-sigo-primary" />
        <p className="text-sm text-muted">Cargando venta...</p>
      </div>
    );
  }

  if (error || !venta) {
    return (
      <div className="py-16 text-center space-y-3">
        <AlertCircle className="text-red-500 mx-auto" size={36} />
        <p className="text-sm font-medium text-red-500">{error || 'Venta no encontrada'}</p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={cargar} className="text-sm text-sigo-primary hover:underline font-medium">Reintentar</button>
          <button onClick={() => router.push('/comercial/ventas')} className="text-sm text-secondary hover:underline font-medium">Volver al listado</button>
        </div>
      </div>
    );
  }

  const detalles = venta.detalles || [];

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/comercial/ventas')} className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-app transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <BarChart3 className="text-sigo-primary" size={22} /> {venta.folio}
            </h1>
            <p className="text-xs text-muted">{formatDate(venta.fecha)}</p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer size={16} /> Exportar PDF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{venta.folio}</CardTitle>
          <div className="flex items-center gap-2">
            {venta.estado && <Badge variant={estadoVariant[venta.estado.toLowerCase()] || 'gray'} dot>{venta.estado}</Badge>}
            {venta.metodo_pago && (
              <Badge variant="gray"><CreditCard size={12} className="mr-1" />{venta.metodo_pago}</Badge>
            )}
          </div>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-2">
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Fecha</p>
            <p className="font-medium text-primary">{formatDate(venta.fecha)}</p>
          </div>
          {venta.created_at && (
            <div>
              <p className="text-xs text-muted uppercase tracking-wider mb-1">Registrada el</p>
              <p className="font-medium text-primary">{formatDateTime(venta.created_at)}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Total</p>
            <p className="font-bold text-primary">{formatCurrency(venta.total)}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User size={16} /> Cliente</CardTitle></CardHeader>
          <div className="space-y-1.5 text-sm">
            <p className="font-medium text-primary">{venta.cliente?.nombre || '—'}</p>
            {venta.cliente?.rfc && <p className="text-xs text-secondary">RFC: {venta.cliente.rfc}</p>}
            {venta.cliente?.telefono && (
              <p className="flex items-center gap-1.5 text-xs text-secondary"><Phone size={13} /> {venta.cliente.telefono}</p>
            )}
            {venta.cliente?.email && (
              <p className="flex items-center gap-1.5 text-xs text-secondary"><Mail size={13} /> {venta.cliente.email}</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User size={16} /> Vendedor</CardTitle></CardHeader>
          <div className="space-y-1.5 text-sm">
            <p className="font-medium text-primary">{venta.usuario?.nombre || '—'}</p>
            {venta.usuario?.email && (
              <p className="flex items-center gap-1.5 text-xs text-secondary"><Mail size={13} /> {venta.usuario.email}</p>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Detalle de la venta</CardTitle></CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-default">
                {['Código', 'Material', 'Unidad', 'Cantidad', 'Precio Unitario', 'Subtotal'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detalles.map((d, i) => (
                <tr key={`${d.material_id}-${i}`} className="border-b border-default last:border-0">
                  <td className="py-2 pl-0 px-3 text-xs font-mono text-secondary">{d.material?.codigo || '—'}</td>
                  <td className="py-2 px-3 text-xs text-primary">{d.material?.nombre || '—'}</td>
                  <td className="py-2 px-3 text-xs text-secondary">{d.material?.unidad_medida || '—'}</td>
                  <td className="py-2 px-3 text-xs text-secondary">{d.cantidad}</td>
                  <td className="py-2 px-3 text-xs text-secondary">{formatCurrency(d.precio_unitario)}</td>
                  <td className="py-2 px-3 text-xs font-semibold text-primary">{formatCurrency(d.subtotal ?? d.cantidad * d.precio_unitario)}</td>
                </tr>
              ))}
              {detalles.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-muted text-sm">Sin materiales en esta venta</td></tr>
              )}
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
                <span>IVA (16%)</span><span>{formatCurrency(venta.iva)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-primary pt-1.5 border-t border-default">
              <span>Total</span><span>{formatCurrency(venta.total)}</span>
            </div>
          </div>
        </div>
      </Card>

      {(venta.cotizacion || venta.observaciones) && (
        <Card>
          {venta.cotizacion && (
            <p className="text-sm text-secondary flex items-center gap-1.5 mb-2">
              <FileText size={14} className="text-sigo-primary" />
              Esta venta fue generada desde la cotización{' '}
              <Link href={`/comercial/cotizaciones/${venta.cotizacion.id}`} className="text-sigo-primary hover:underline font-medium">
                {venta.cotizacion.folio}
              </Link>
            </p>
          )}
          {venta.observaciones && (
            <div>
              <p className="text-xs text-muted uppercase tracking-wider mb-1">Observaciones</p>
              <p className="text-sm text-secondary bg-app p-3 rounded-xl border border-default">{venta.observaciones}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
