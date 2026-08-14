'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { cotizacionesService, CotizacionApi } from '@/lib/services/cotizaciones';
import { extractErrorMessage } from '@/lib/services/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { BadgeVariant } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, FileText, Loader2, AlertCircle, Repeat, Printer } from 'lucide-react';

const estadoVariant: Record<string, BadgeVariant> = {
  borrador: 'gray', enviada: 'info', aceptada: 'success', rechazada: 'danger', convertida: 'purple',
};

export default function DetalleCotizacionPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const canConvertir = currentUser?.rol?.nombre === 'administrador';
  const toast = useToast();

  const [cotizacion, setCotizacion] = useState<CotizacionApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [convirtiendo, setConvirtiendo] = useState(false);
  const [exportando, setExportando] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cotizacionesService.getCotizacion(id);
      setCotizacion(data);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Error al cargar la cotización.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleConvertir = async () => {
    if (!confirm('¿Convertir esta cotización en venta?')) return;
    setConvirtiendo(true);
    try {
      await cotizacionesService.convertirVenta(id);
      toast.success('Cotización convertida a venta');
      cargar();
    } catch (err: any) {
      toast.error('Error', extractErrorMessage(err, 'No se pudo convertir la cotización'));
    } finally {
      setConvirtiendo(false);
    }
  };

  const handleExportar = async () => {
    setExportando(true);
    try {
      await cotizacionesService.getPdfData(id);
      setTimeout(() => window.print(), 100);
    } catch (err: any) {
      toast.error('Error', extractErrorMessage(err, 'No se pudieron obtener los datos para exportar'));
    } finally {
      setExportando(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-sigo-primary" />
        <p className="text-sm text-muted">Cargando cotización...</p>
      </div>
    );
  }

  if (error || !cotizacion) {
    return (
      <div className="py-16 text-center space-y-3">
        <AlertCircle className="text-red-500 mx-auto" size={36} />
        <p className="text-sm font-medium text-red-500">{error || 'Cotización no encontrada'}</p>
        <button onClick={cargar} className="text-sm text-sigo-primary hover:underline font-medium">Reintentar</button>
      </div>
    );
  }

  const yaConvertida = cotizacion.estado?.toLowerCase() === 'convertida';

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/comercial/cotizaciones')} className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-app transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <FileText className="text-sigo-primary" size={22} /> {cotizacion.folio}
            </h1>
            <p className="text-xs text-muted">{formatDate(cotizacion.fecha)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleExportar} loading={exportando}>
            <Printer size={16} /> Exportar PDF
          </Button>
          {canConvertir && !yaConvertida && (
            <Button onClick={handleConvertir} loading={convirtiendo}>
              <Repeat size={16} /> Convertir a Venta
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{cotizacion.folio}</CardTitle>
          <Badge variant={estadoVariant[cotizacion.estado?.toLowerCase()] || 'gray'} dot>{cotizacion.estado}</Badge>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Cliente</p>
            <p className="font-medium text-primary">{cotizacion.cliente?.nombre || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Fecha</p>
            <p className="font-medium text-primary">{formatDate(cotizacion.fecha)}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Total</p>
            <p className="font-bold text-primary">{formatCurrency(cotizacion.total)}</p>
          </div>
        </div>
        {cotizacion.notas && (
          <p className="text-xs text-secondary bg-app p-3 rounded-xl border border-default mb-4">{cotizacion.notas}</p>
        )}

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
              {(cotizacion.items || []).map((it, i) => (
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
            <div className="flex justify-between text-xs text-secondary">
              <span>Subtotal</span><span>{formatCurrency(cotizacion.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-secondary">
              <span>IVA (16%)</span><span>{formatCurrency(cotizacion.iva)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-primary pt-1.5 border-t border-default">
              <span>Total</span><span>{formatCurrency(cotizacion.total)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
