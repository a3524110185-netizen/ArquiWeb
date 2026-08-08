'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { pedidosService, PedidoApi, PedidoEstado } from '@/lib/services/pedidos';
import { extractErrorMessage } from '@/lib/services/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { BadgeVariant } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Select, Textarea } from '@/components/ui/FormFields';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, ShoppingCart, Loader2, AlertCircle, Edit2, User, Mail, Phone, RefreshCw } from 'lucide-react';

const estadoVariant: Record<string, BadgeVariant> = {
  pendiente: 'warning', aprobado: 'success', rechazado: 'danger', entregado: 'purple',
};

const ESTADOS: { value: PedidoEstado; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'rechazado', label: 'Rechazado' },
  { value: 'entregado', label: 'Entregado' },
];

export default function DetallePedidoPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const toast = useToast();
  const { currentUser } = useAuthStore();
  const rol = currentUser?.rol?.nombre || '';
  const canManage = rol === 'administrador' || rol === 'gerente';

  const [pedido, setPedido] = useState<PedidoApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalEstado, setModalEstado] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<PedidoEstado>('pendiente');
  const [observaciones, setObservaciones] = useState('');
  const [guardandoEstado, setGuardandoEstado] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pedidosService.obtener(id);
      setPedido(data);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Error al cargar el pedido.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirModalEstado = () => {
    if (!pedido) return;
    setNuevoEstado((pedido.estado as PedidoEstado) || 'pendiente');
    setObservaciones('');
    setModalEstado(true);
  };

  const handleCambiarEstado = async () => {
    setGuardandoEstado(true);
    try {
      await pedidosService.cambiarEstado(id, nuevoEstado, observaciones || undefined);
      toast.success('Estado actualizado', `El pedido ahora está: ${nuevoEstado}`);
      setModalEstado(false);
      cargar();
    } catch (err: any) {
      toast.error('Error', extractErrorMessage(err, 'No se pudo actualizar el estado del pedido'));
    } finally {
      setGuardandoEstado(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-brand-600" />
        <p className="text-sm text-muted">Cargando pedido...</p>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="py-16 text-center space-y-3">
        <AlertCircle className="text-red-500 mx-auto" size={36} />
        <p className="text-sm font-medium text-red-500">{error || 'Pedido no encontrado'}</p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={cargar} className="text-sm text-brand-600 hover:underline font-medium">Reintentar</button>
          <button onClick={() => router.push('/comercial/pedidos')} className="text-sm text-secondary hover:underline font-medium">Volver al listado</button>
        </div>
      </div>
    );
  }

  const detalles = pedido.detalles || [];
  const puedeEditar = canManage && pedido.estado.toLowerCase() === 'pendiente';

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/comercial/pedidos')} className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-app transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <ShoppingCart className="text-brand-600" size={22} /> {pedido.folio}
            </h1>
            <p className="text-xs text-muted">{formatDate(pedido.fecha_pedido)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {puedeEditar && (
            <Button variant="secondary" onClick={() => router.push(`/comercial/pedidos/${id}/editar`)}>
              <Edit2 size={16} /> Editar
            </Button>
          )}
          {canManage && (
            <Button onClick={abrirModalEstado}>
              <RefreshCw size={16} /> Cambiar Estado
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{pedido.folio}</CardTitle>
          <Badge variant={estadoVariant[pedido.estado.toLowerCase()] || 'gray'} dot>{pedido.estado}</Badge>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Fecha del pedido</p>
            <p className="font-medium text-primary">{formatDate(pedido.fecha_pedido)}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Fecha de entrega</p>
            <p className="font-medium text-primary">{pedido.fecha_entrega ? formatDate(pedido.fecha_entrega) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Total</p>
            <p className="font-bold text-primary">{formatCurrency(pedido.total)}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User size={16} /> Cliente</CardTitle></CardHeader>
          <div className="space-y-1.5 text-sm">
            <p className="font-medium text-primary">{pedido.cliente?.nombre || '—'}</p>
            {pedido.cliente?.rfc && <p className="text-xs text-secondary">RFC: {pedido.cliente.rfc}</p>}
            {pedido.cliente?.telefono && (
              <p className="flex items-center gap-1.5 text-xs text-secondary"><Phone size={13} /> {pedido.cliente.telefono}</p>
            )}
            {pedido.cliente?.email && (
              <p className="flex items-center gap-1.5 text-xs text-secondary"><Mail size={13} /> {pedido.cliente.email}</p>
            )}
          </div>
        </Card>

        {pedido.usuario && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User size={16} /> Registrado por</CardTitle></CardHeader>
            <div className="space-y-1.5 text-sm">
              <p className="font-medium text-primary">{pedido.usuario.nombre}</p>
              {pedido.usuario.email && (
                <p className="flex items-center gap-1.5 text-xs text-secondary"><Mail size={13} /> {pedido.usuario.email}</p>
              )}
            </div>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle>Detalle del pedido</CardTitle></CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-default">
                {['Material', 'Unidad', 'Cantidad', 'Precio Unitario', 'Subtotal'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detalles.map((d, i) => (
                <tr key={`${d.material_id}-${i}`} className="border-b border-default last:border-0">
                  <td className="py-2 pl-0 px-3 text-xs text-primary">{d.material?.nombre || '—'}</td>
                  <td className="py-2 px-3 text-xs text-secondary">{d.material?.unidad_medida || '—'}</td>
                  <td className="py-2 px-3 text-xs text-secondary">{d.cantidad}</td>
                  <td className="py-2 px-3 text-xs text-secondary">{formatCurrency(d.precio_unitario)}</td>
                  <td className="py-2 px-3 text-xs font-semibold text-primary">{formatCurrency(d.subtotal ?? d.cantidad * d.precio_unitario)}</td>
                </tr>
              ))}
              {detalles.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-muted text-sm">Sin materiales en este pedido</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4">
          <div className="w-full sm:w-64 space-y-1.5">
            {pedido.subtotal != null && (
              <div className="flex justify-between text-xs text-secondary">
                <span>Subtotal</span><span>{formatCurrency(pedido.subtotal)}</span>
              </div>
            )}
            {pedido.iva != null && (
              <div className="flex justify-between text-xs text-secondary">
                <span>IVA (16%)</span><span>{formatCurrency(pedido.iva)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-primary pt-1.5 border-t border-default">
              <span>Total</span><span>{formatCurrency(pedido.total)}</span>
            </div>
          </div>
        </div>
      </Card>

      {pedido.observaciones && (
        <Card>
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Observaciones</p>
          <p className="text-sm text-secondary bg-app p-3 rounded-xl border border-default">{pedido.observaciones}</p>
        </Card>
      )}

      <Modal
        open={modalEstado} onClose={() => setModalEstado(false)} title="Cambiar estado del pedido"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalEstado(false)}>Cancelar</Button>
            <Button onClick={handleCambiarEstado} loading={guardandoEstado}>Guardar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Nuevo estado" value={nuevoEstado}
            onChange={e => setNuevoEstado(e.target.value as PedidoEstado)}
            options={ESTADOS.map(e => ({ value: e.value, label: e.label }))}
          />
          <Textarea
            label="Observaciones (opcional)" value={observaciones}
            onChange={e => setObservaciones(e.target.value)} rows={3}
            placeholder="Motivo del cambio de estado..."
          />
        </div>
      </Modal>
    </div>
  );
}
