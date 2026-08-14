'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { inventarioService, MovimientoInventarioApi, TipoMovimiento } from '@/lib/services/inventario';
import { materialesService, MaterialApi } from '@/lib/services/materiales';
import { extractErrorMessage, extractFieldErrors } from '@/lib/services/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { BadgeVariant } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Select, Textarea } from '@/components/ui/FormFields';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime } from '@/lib/utils';
import { Plus, Loader2, AlertCircle, Boxes, Lock, ArrowDownCircle, ArrowUpCircle, RefreshCcw } from 'lucide-react';

const TIPO_OPTIONS: { value: TipoMovimiento; label: string }[] = [
  { value: 'entrada', label: 'Entrada' },
  { value: 'salida', label: 'Salida' },
  { value: 'ajuste', label: 'Ajuste' },
];

const tipoVariant: Record<TipoMovimiento, BadgeVariant> = {
  entrada: 'success', salida: 'danger', ajuste: 'warning',
};

const tipoIcon: Record<TipoMovimiento, typeof ArrowDownCircle> = {
  entrada: ArrowDownCircle, salida: ArrowUpCircle, ajuste: RefreshCcw,
};

const emptyForm = { material_id: '', tipo_movimiento: 'entrada' as TipoMovimiento, cantidad: '', motivo: '' };

export default function InventarioPage() {
  const { currentUser } = useAuthStore();
  const canEdit = currentUser?.rol?.nombre === 'administrador';
  const toast = useToast();

  const [materiales, setMateriales] = useState<MaterialApi[]>([]);
  const [historial, setHistorial] = useState<MovimientoInventarioApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingHistorial, setLoadingHistorial] = useState(true);
  const [soloBajoStock, setSoloBajoStock] = useState(false);

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const cargarInventario = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = soloBajoStock ? await inventarioService.getBajoStock() : await inventarioService.getInventario();
      setMateriales(data);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Error al cargar el inventario.'));
    } finally {
      setLoading(false);
    }
  }, [soloBajoStock]);

  const cargarHistorial = useCallback(async () => {
    setLoadingHistorial(true);
    try {
      const data = await inventarioService.getHistorial();
      setHistorial(data.slice(0, 10));
    } catch {
      // silencioso: el historial es secundario a la tabla principal
    } finally {
      setLoadingHistorial(false);
    }
  }, []);

  useEffect(() => { cargarInventario(); }, [cargarInventario]);
  useEffect(() => { cargarHistorial(); }, [cargarHistorial]);

  const openModal = () => {
    setForm(emptyForm); setErrors({}); setModal(true);
    if (materiales.length === 0) materialesService.getMateriales().then(setMateriales).catch(() => {});
  };

  const f = (field: keyof typeof emptyForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.material_id) e.material_id = 'Selecciona un material';
    if (!form.cantidad || Number(form.cantidad) <= 0) e.cantidad = 'Cantidad inválida';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!canEdit || !validate()) return;
    setSubmitting(true);
    try {
      await inventarioService.registrarMovimiento(form);
      toast.success('Movimiento registrado');
      setModal(false);
      cargarInventario();
      cargarHistorial();
    } catch (err: any) {
      setErrors(extractFieldErrors(err));
      toast.error('Error', extractErrorMessage(err, 'No se pudo registrar el movimiento'));
    } finally {
      setSubmitting(false);
    }
  };

  const stockBadge = (m: MaterialApi) =>
    m.stock_actual <= m.stock_minimo
      ? <Badge variant="danger" dot>Bajo</Badge>
      : <Badge variant="success" dot>Normal</Badge>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Control de Inventario</CardTitle>
          {canEdit ? (
            <Button onClick={openModal}><Plus size={16} /> Registrar Movimiento</Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted"><Lock size={12} /> Solo lectura</span>
          )}
        </CardHeader>

        <label className="flex items-center gap-2 mb-4 text-xs font-medium text-secondary cursor-pointer w-fit">
          <input type="checkbox" checked={soloBajoStock} onChange={e => setSoloBajoStock(e.target.checked)} className="rounded" />
          Solo bajo stock
        </label>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="animate-spin text-sigo-primary" />
            <p className="text-sm text-muted">Cargando inventario...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="text-red-500 mx-auto" size={36} />
            <p className="text-sm font-medium text-red-500">{error}</p>
            <button onClick={cargarInventario} className="text-sm text-sigo-primary hover:underline font-medium">Reintentar</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default">
                  {['Código', 'Nombre', 'Stock Actual', 'Stock Mínimo', 'Estado'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {materiales.map(m => (
                  <tr key={m.id} className="border-b border-default last:border-0 hover:bg-app transition-colors">
                    <td className="py-3 pl-0 px-3 font-mono text-xs text-secondary">{m.codigo}</td>
                    <td className="py-3 px-3 text-xs font-medium text-primary">{m.nombre}</td>
                    <td className="py-3 px-3 text-xs font-semibold text-primary">{m.stock_actual} {m.unidad_medida}</td>
                    <td className="py-3 px-3 text-xs text-secondary">{m.stock_minimo} {m.unidad_medida}</td>
                    <td className="py-3 px-3">{stockBadge(m)}</td>
                  </tr>
                ))}
                {materiales.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted">
                        <Boxes size={28} />
                        <p className="text-sm">{soloBajoStock ? 'No hay materiales con stock bajo' : 'No hay materiales en inventario'}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Últimos Movimientos</CardTitle>
        </CardHeader>
        {loadingHistorial ? (
          <div className="py-8 flex justify-center"><Loader2 size={20} className="animate-spin text-sigo-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default">
                  {['Fecha', 'Material', 'Tipo', 'Cantidad', 'Usuario', 'Motivo'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historial.map(mov => {
                  const Icon = tipoIcon[mov.tipo] || RefreshCcw;
                  return (
                    <tr key={mov.id} className="border-b border-default last:border-0 hover:bg-app transition-colors">
                      <td className="py-3 pl-0 px-3 text-xs text-secondary">{formatDateTime(mov.created_at)}</td>
                      <td className="py-3 px-3 text-xs font-medium text-primary">{mov.material?.nombre || `Material #${mov.material_id}`}</td>
                      <td className="py-3 px-3">
                        <Badge variant={tipoVariant[mov.tipo] || 'gray'}><Icon size={11} /> {TIPO_OPTIONS.find(t => t.value === mov.tipo)?.label || mov.tipo}</Badge>
                      </td>
                      <td className="py-3 px-3 text-xs font-semibold text-primary">{mov.cantidad}</td>
                      <td className="py-3 px-3 text-xs text-secondary">{mov.usuario?.nombre || '—'}</td>
                      <td className="py-3 px-3 text-xs text-secondary max-w-[200px] truncate">{mov.motivo || '—'}</td>
                    </tr>
                  );
                })}
                {historial.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-muted text-sm">Sin movimientos registrados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={modal} onClose={() => setModal(false)} title="Registrar Movimiento"
        footer={<><Button variant="secondary" onClick={() => setModal(false)} disabled={submitting}>Cancelar</Button><Button onClick={handleSubmit} loading={submitting}>Registrar</Button></>}
      >
        <div className="space-y-4">
          <Select label="Material" placeholder="Selecciona un material" value={form.material_id}
            onChange={e => f('material_id', e.target.value)} error={errors.material_id}
            options={materiales.map(m => ({ value: String(m.id), label: `${m.codigo} — ${m.nombre}` }))} />
          <Select label="Tipo de movimiento" value={form.tipo_movimiento} onChange={e => f('tipo_movimiento', e.target.value)}
            options={TIPO_OPTIONS} />
          <div>
            <label className="text-xs font-medium text-secondary mb-1 block">Cantidad</label>
            <input type="number" min="1" className="input-base" value={form.cantidad} onChange={e => f('cantidad', e.target.value)} />
            {errors.cantidad && <p className="text-xs text-red-500 mt-1">{errors.cantidad}</p>}
          </div>
          <Textarea label="Motivo" value={form.motivo} onChange={e => f('motivo', e.target.value)} rows={2} placeholder="Ej. Compra a proveedor, uso en obra..." />
        </div>
      </Modal>
    </div>
  );
}
