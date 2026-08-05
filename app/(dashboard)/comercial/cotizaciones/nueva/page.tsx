'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { cotizacionesService } from '@/lib/services/cotizaciones';
import { clientesService, ClienteApi } from '@/lib/services/clientes';
import { materialesService, MaterialApi } from '@/lib/services/materiales';
import { extractErrorMessage } from '@/lib/services/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Select, Textarea } from '@/components/ui/FormFields';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Plus, Trash2, FileText, Loader2 } from 'lucide-react';

interface PartidaForm {
  tempId: string;
  material_id: number | null;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
}

export default function NuevaCotizacionPage() {
  const router = useRouter();
  const toast = useToast();

  const [clientes, setClientes] = useState<ClienteApi[]>([]);
  const [materiales, setMateriales] = useState<MaterialApi[]>([]);
  const [folioRef, setFolioRef] = useState('');
  const [loadingBase, setLoadingBase] = useState(true);

  const [clienteId, setClienteId] = useState('');
  const [notas, setNotas] = useState('');
  const [items, setItems] = useState<PartidaForm[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [selMaterial, setSelMaterial] = useState('');
  const [selCantidad, setSelCantidad] = useState('1');

  useEffect(() => {
    setLoadingBase(true);
    Promise.all([
      clientesService.getClientes(),
      materialesService.getMateriales(),
      cotizacionesService.generarFolio().catch(() => ''),
    ]).then(([c, m, folio]) => {
      setClientes(c);
      setMateriales(m);
      setFolioRef(folio);
    }).finally(() => setLoadingBase(false));
  }, []);

  const totales = useMemo(() => {
    const subtotal = items.reduce((acc, it) => acc + it.cantidad * it.precio_unitario, 0);
    const iva = subtotal * 0.16;
    return { subtotal, iva, total: subtotal + iva };
  }, [items]);

  const handleAgregarPartida = () => {
    if (!selMaterial) { toast.error('Error', 'Selecciona un material'); return; }
    const material = materiales.find(m => String(m.id) === selMaterial);
    if (!material) return;
    const cantidad = Number(selCantidad) || 0;
    if (cantidad <= 0) { toast.error('Error', 'La cantidad debe ser mayor a 0'); return; }
    setItems(prev => [...prev, {
      tempId: `${Date.now()}-${material.id}`,
      material_id: material.id,
      descripcion: material.nombre,
      cantidad,
      precio_unitario: material.precio_venta,
    }]);
    setSelMaterial('');
    setSelCantidad('1');
  };

  const actualizarPartida = (tempId: string, patch: Partial<PartidaForm>) => {
    setItems(prev => prev.map(it => it.tempId === tempId ? { ...it, ...patch } : it));
  };

  const quitarPartida = (tempId: string) => {
    setItems(prev => prev.filter(it => it.tempId !== tempId));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!clienteId) e.cliente_id = 'Selecciona un cliente';
    if (items.length === 0) e.items = 'Agrega al menos una partida';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const cotizacion = await cotizacionesService.crearCotizacion({
        cliente_id: clienteId,
        notas: notas || undefined,
        items: items.map(it => ({
          material_id: it.material_id, descripcion: it.descripcion,
          cantidad: it.cantidad, precio_unitario: it.precio_unitario,
        })),
      });
      toast.success('Cotización creada', `Folio ${cotizacion.folio}`);
      router.push(`/comercial/cotizaciones/${cotizacion.id}`);
    } catch (err: any) {
      toast.error('Error', extractErrorMessage(err, 'No se pudo guardar la cotización'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingBase) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-brand-600" />
        <p className="text-sm text-muted">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-app transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <FileText className="text-brand-600" size={22} /> Nueva Cotización
          </h1>
          {folioRef && <p className="text-xs text-muted font-mono">Folio de referencia: {folioRef}</p>}
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Cliente" required placeholder="Selecciona un cliente" value={clienteId}
            onChange={e => { setClienteId(e.target.value); setErrors(prev => ({ ...prev, cliente_id: '' })); }}
            error={errors.cliente_id}
            options={clientes.map(c => ({ value: String(c.id), label: c.nombre }))} />
        </div>
        <div className="mt-4">
          <Textarea label="Notas (opcional)" value={notas} onChange={e => setNotas(e.target.value)} rows={2} />
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Partidas</CardTitle></CardHeader>

        <div className="flex flex-col sm:flex-row gap-3 items-end mb-4 pb-4 border-b border-default">
          <div className="flex-1 w-full">
            <Select label="Material" placeholder="Selecciona un material" value={selMaterial}
              onChange={e => setSelMaterial(e.target.value)}
              options={materiales.map(m => ({ value: String(m.id), label: `${m.codigo} — ${m.nombre} (${formatCurrency(m.precio_venta)})` }))} />
          </div>
          <div className="w-full sm:w-28">
            <label className="text-xs font-medium text-secondary mb-1 block">Cantidad</label>
            <input type="number" min="1" className="input-base" value={selCantidad} onChange={e => setSelCantidad(e.target.value)} />
          </div>
          <Button variant="secondary" onClick={handleAgregarPartida} className="shrink-0">
            <Plus size={16} /> Agregar
          </Button>
        </div>

        {errors.items && <p className="text-xs text-red-500 mb-3">{errors.items}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-default">
                {['Descripción', 'Cantidad', 'Precio Unitario', 'Subtotal', ''].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it.tempId} className="border-b border-default last:border-0">
                  <td className="py-2 pl-0 px-3 text-xs text-primary">{it.descripcion}</td>
                  <td className="py-2 px-3">
                    <input type="number" min="1" className="input-base w-20 py-1"
                      value={it.cantidad} onChange={e => actualizarPartida(it.tempId, { cantidad: Number(e.target.value) || 0 })} />
                  </td>
                  <td className="py-2 px-3">
                    <input type="number" min="0" step="0.01" className="input-base w-28 py-1"
                      value={it.precio_unitario} onChange={e => actualizarPartida(it.tempId, { precio_unitario: Number(e.target.value) || 0 })} />
                  </td>
                  <td className="py-2 px-3 text-xs font-semibold text-primary">{formatCurrency(it.cantidad * it.precio_unitario)}</td>
                  <td className="py-2 px-3">
                    <button onClick={() => quitarPartida(it.tempId)} className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-muted text-sm">Sin partidas agregadas</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4">
          <div className="w-full sm:w-64 space-y-1.5">
            <div className="flex justify-between text-xs text-secondary">
              <span>Subtotal</span><span>{formatCurrency(totales.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-secondary">
              <span>IVA (16%)</span><span>{formatCurrency(totales.iva)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-primary pt-1.5 border-t border-default">
              <span>Total</span><span>{formatCurrency(totales.total)}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => router.back()} disabled={submitting}>Cancelar</Button>
        <Button onClick={handleGuardar} loading={submitting}>Guardar Cotización</Button>
      </div>
    </div>
  );
}
