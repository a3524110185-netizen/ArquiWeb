'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { materialesService, MaterialApi } from '@/lib/services/materiales';
import { extractErrorMessage } from '@/lib/services/api';
import { UNIDADES_MEDIDA } from '@/lib/constants/unidades';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Package, Loader2, AlertCircle, Edit2, Trash2, RotateCcw } from 'lucide-react';

export default function DetalleMaterialPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const canEdit = currentUser?.rol?.nombre === 'administrador';
  const toast = useToast();

  const [material, setMaterial] = useState<MaterialApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmToggle, setConfirmToggle] = useState(false);
  const [toggling, setToggling] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await materialesService.getMaterial(id);
      setMaterial(data);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Error al cargar el material.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleToggle = async () => {
    if (!material) return;
    setToggling(true);
    try {
      await materialesService.toggleActivo(id, !material.activo);
      toast.success(material.activo ? 'Material desactivado' : 'Material activado');
      cargar();
    } catch (err: any) {
      toast.error('Error', extractErrorMessage(err, 'No se pudo actualizar el estado del material'));
    } finally {
      setToggling(false);
      setConfirmToggle(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-sigo-primary" />
        <p className="text-sm text-muted">Cargando material...</p>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="py-16 text-center space-y-3">
        <AlertCircle className="text-red-500 mx-auto" size={36} />
        <p className="text-sm font-medium text-red-500">{error || 'Material no encontrado'}</p>
        <button onClick={cargar} className="text-sm text-sigo-primary hover:underline font-medium">Reintentar</button>
      </div>
    );
  }

  const unidadLabel = UNIDADES_MEDIDA.find(u => u.value === material.unidad_medida)?.label || material.unidad_medida;
  const stockBajo = material.stock_actual <= material.stock_minimo;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/catalogos/materiales')} className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-app transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <Package className="text-sigo-primary" size={22} /> {material.nombre}
            </h1>
            <p className="text-xs text-muted font-mono">{material.codigo}</p>
          </div>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => router.push(`/catalogos/materiales/${id}/editar`)}>
              <Edit2 size={16} /> Editar
            </Button>
            <Button variant={material.activo ? 'danger' : 'success'} onClick={() => setConfirmToggle(true)}>
              {material.activo ? <><Trash2 size={16} /> Desactivar</> : <><RotateCcw size={16} /> Activar</>}
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información general</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={material.activo ? 'success' : 'gray'} dot>{material.activo ? 'Activo' : 'Inactivo'}</Badge>
            <Badge variant={stockBajo ? 'danger' : 'success'} dot>{stockBajo ? 'Stock bajo' : 'Stock normal'}</Badge>
          </div>
        </CardHeader>

        {material.descripcion && (
          <p className="text-sm text-secondary bg-app p-3 rounded-xl border border-default mb-4">{material.descripcion}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Unidad de medida</p>
            <p className="font-medium text-primary">{unidadLabel}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Proveedor</p>
            <p className="font-medium text-primary">{material.proveedor?.nombre || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Precio de compra</p>
            <p className="font-medium text-primary">{formatCurrency(material.precio_compra)}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Precio de venta</p>
            <p className="font-medium text-primary">{formatCurrency(material.precio_venta)}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Stock actual</p>
            <p className="font-medium text-primary">{material.stock_actual} {material.unidad_medida}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Stock mínimo</p>
            <p className="font-medium text-primary">{material.stock_minimo} {material.unidad_medida}</p>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmToggle} onClose={() => setConfirmToggle(false)}
        onConfirm={handleToggle}
        title={material.activo ? 'Desactivar material' : 'Activar material'}
        message={material.activo ? '¿Estás seguro de que deseas desactivar este material?' : '¿Estás seguro de que deseas activar este material?'}
        confirmLabel={toggling ? 'Guardando...' : (material.activo ? 'Desactivar' : 'Activar')}
        variant={material.activo ? 'danger' : 'primary'}
      />
    </div>
  );
}
