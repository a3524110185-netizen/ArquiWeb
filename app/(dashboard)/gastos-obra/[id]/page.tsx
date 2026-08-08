'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { gastosObraService, GastoObraApi } from '@/lib/services/gastosObra';
import { extractErrorMessage } from '@/lib/services/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { ArrowLeft, DollarSign, Loader2, AlertCircle, Edit2, Trash2, User, FolderOpen, Truck, FileText, Paperclip } from 'lucide-react';

export default function DetalleGastoPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const toast = useToast();
  const { currentUser } = useAuthStore();
  const rol = currentUser?.rol?.nombre || '';
  const canManage = rol === 'administrador' || rol === 'gerente';

  const [gasto, setGasto] = useState<GastoObraApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmEliminar, setConfirmEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await gastosObraService.obtener(id);
      setGasto(data);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Error al cargar el gasto.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleEliminar = async () => {
    setEliminando(true);
    try {
      await gastosObraService.eliminar(id);
      toast.success('Gasto eliminado');
      router.push('/gastos-obra');
    } catch (err: any) {
      toast.error('Error', extractErrorMessage(err, 'No se pudo eliminar el gasto'));
    } finally {
      setEliminando(false);
      setConfirmEliminar(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-brand-600" />
        <p className="text-sm text-muted">Cargando gasto...</p>
      </div>
    );
  }

  if (error || !gasto) {
    return (
      <div className="py-16 text-center space-y-3">
        <AlertCircle className="text-red-500 mx-auto" size={36} />
        <p className="text-sm font-medium text-red-500">{error || 'Gasto no encontrado'}</p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={cargar} className="text-sm text-brand-600 hover:underline font-medium">Reintentar</button>
          <button onClick={() => router.push('/gastos-obra')} className="text-sm text-secondary hover:underline font-medium">Volver al listado</button>
        </div>
      </div>
    );
  }

  const esImagen = gasto.comprobante_url ? /\.(png|jpe?g|gif|webp)$/i.test(gasto.comprobante_url) : false;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/gastos-obra')} className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-app transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <DollarSign className="text-brand-600" size={22} /> {formatCurrency(gasto.monto)}
            </h1>
            <p className="text-xs text-muted">{formatDate(gasto.fecha)}</p>
          </div>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => router.push(`/gastos-obra/${id}/editar`)}>
              <Edit2 size={16} /> Editar
            </Button>
            <Button variant="danger" onClick={() => setConfirmEliminar(true)}>
              <Trash2 size={16} /> Eliminar
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información general</CardTitle>
          <Badge variant="default">{gasto.categoria?.nombre || '—'}</Badge>
        </CardHeader>

        {gasto.descripcion && (
          <p className="text-sm text-secondary bg-app p-3 rounded-xl border border-default mb-4">{gasto.descripcion}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1 flex items-center gap-1"><FolderOpen size={12} /> Proyecto</p>
            <p className="font-medium text-primary">{gasto.proyecto?.nombre || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1 flex items-center gap-1"><Truck size={12} /> Proveedor</p>
            <p className="font-medium text-primary">{gasto.proveedor?.nombre || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Monto</p>
            <p className="font-bold text-primary">{formatCurrency(gasto.monto)}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Fecha</p>
            <p className="font-medium text-primary">{formatDate(gasto.fecha)}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1 flex items-center gap-1"><User size={12} /> Capturado por</p>
            <p className="font-medium text-primary">{gasto.usuario?.nombre || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Registrado el</p>
            <p className="font-medium text-primary">{gasto.created_at ? formatDateTime(gasto.created_at) : '—'}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Paperclip size={16} /> Comprobante</CardTitle></CardHeader>
        {gasto.comprobante_url ? (
          esImagen ? (
            <a href={gasto.comprobante_url} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden border border-default max-w-sm">
              <img src={gasto.comprobante_url} alt="Comprobante" className="w-full h-auto object-cover" />
            </a>
          ) : (
            <a href={gasto.comprobante_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-brand-600 hover:underline font-medium">
              <FileText size={16} /> Ver comprobante
            </a>
          )
        ) : (
          <p className="text-sm text-muted">Sin comprobante adjunto</p>
        )}
      </Card>

      <ConfirmDialog
        open={confirmEliminar} onClose={() => setConfirmEliminar(false)} onConfirm={handleEliminar}
        title="Eliminar gasto"
        message={`¿Estás seguro de que deseas eliminar este gasto de ${formatCurrency(gasto.monto)}? Esta acción no se puede deshacer.`}
        confirmLabel={eliminando ? 'Eliminando...' : 'Eliminar'}
        variant="danger"
      />
    </div>
  );
}
