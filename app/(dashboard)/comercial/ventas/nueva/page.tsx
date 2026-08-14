'use client';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { ventasService } from '@/lib/services/ventas';
import { clientesService, ClienteApi } from '@/lib/services/clientes';
import { materialesService, MaterialApi } from '@/lib/services/materiales';
import { extractErrorMessage } from '@/lib/services/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/FormFields';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, ShoppingCart, Search, Plus, Trash2, Loader2, AlertTriangle } from 'lucide-react';

const METODOS_PAGO = [
  { value: 'Efectivo', label: 'Efectivo' },
  { value: 'Transferencia', label: 'Transferencia' },
  { value: 'Tarjeta', label: 'Tarjeta' },
];

interface DetalleItem {
  tempId: string;
  material_id: number;
  nombre: string;
  unidad_medida: string;
  cantidad: number;
  precio_unitario: number;
  stock_actual: number;
}

export default function NuevaVentaDirectaPage() {
  const router = useRouter();
  const toast = useToast();
  const { currentUser } = useAuthStore();
  const canCreate = currentUser?.rol?.nombre === 'administrador';

  useEffect(() => {
    if (currentUser && !canCreate) router.replace('/comercial/ventas');
  }, [currentUser, canCreate, router]);

  // Cliente
  const [clientes, setClientes] = useState<ClienteApi[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [clienteQuery, setClienteQuery] = useState('');
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [clienteDropdownOpen, setClienteDropdownOpen] = useState(false);

  // Materiales
  const [materialQuery, setMaterialQuery] = useState('');
  const [materialResults, setMaterialResults] = useState<MaterialApi[]>([]);
  const [buscandoMateriales, setBuscandoMateriales] = useState(false);
  const [materialParaAgregar, setMaterialParaAgregar] = useState<MaterialApi | null>(null);
  const [cantidadInput, setCantidadInput] = useState('1');

  // Detalle
  const [items, setItems] = useState<DetalleItem[]>([]);
  const [metodoPago, setMetodoPago] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    clientesService.getClientes()
      .then(setClientes)
      .catch(() => toast.error('Error', 'No se pudieron cargar los clientes'))
      .finally(() => setLoadingClientes(false));
  }, []);

  const clienteSeleccionado = clientes.find(c => c.id === clienteId) || null;

  const clientesFiltrados = useMemo(() => {
    const q = clienteQuery.trim().toLowerCase();
    if (!q) return clientes.slice(0, 8);
    return clientes.filter(c => c.nombre.toLowerCase().includes(q)).slice(0, 8);
  }, [clientes, clienteQuery]);

  const seleccionarCliente = (c: ClienteApi) => {
    setClienteId(c.id);
    setClienteQuery(c.nombre);
    setClienteDropdownOpen(false);
    setErrors(prev => ({ ...prev, cliente_id: '' }));
  };

  // Búsqueda de materiales con debounce
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const term = materialQuery.trim();
    if (term.length < 2) {
      setMaterialResults([]);
      return;
    }
    setBuscandoMateriales(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const data = await materialesService.buscarMateriales(term);
        setMaterialResults(data.filter(m => m.activo));
      } catch {
        setMaterialResults([]);
      } finally {
        setBuscandoMateriales(false);
      }
    }, 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [materialQuery]);

  const elegirMaterial = (m: MaterialApi) => {
    setMaterialParaAgregar(m);
    setCantidadInput('1');
    setMaterialQuery('');
    setMaterialResults([]);
  };

  const handleAgregarItem = () => {
    if (!materialParaAgregar) return;
    const cantidad = Number(cantidadInput) || 0;
    if (cantidad <= 0) { toast.error('Error', 'La cantidad debe ser mayor a 0'); return; }

    const yaAgregado = items.find(it => it.material_id === materialParaAgregar.id);
    const cantidadAcumulada = (yaAgregado?.cantidad || 0) + cantidad;
    if (cantidadAcumulada > materialParaAgregar.stock_actual) {
      toast.error('Stock insuficiente', `Solo hay ${materialParaAgregar.stock_actual} ${materialParaAgregar.unidad_medida} disponibles de ${materialParaAgregar.nombre}`);
      return;
    }

    if (yaAgregado) {
      setItems(prev => prev.map(it => it.tempId === yaAgregado.tempId ? { ...it, cantidad: cantidadAcumulada } : it));
    } else {
      setItems(prev => [...prev, {
        tempId: `${Date.now()}-${materialParaAgregar.id}`,
        material_id: materialParaAgregar.id,
        nombre: materialParaAgregar.nombre,
        unidad_medida: materialParaAgregar.unidad_medida,
        cantidad,
        precio_unitario: materialParaAgregar.precio_venta,
        stock_actual: materialParaAgregar.stock_actual,
      }]);
    }
    setMaterialParaAgregar(null);
    setCantidadInput('1');
    setErrors(prev => ({ ...prev, items: '' }));
  };

  const quitarItem = (tempId: string) => {
    setItems(prev => prev.filter(it => it.tempId !== tempId));
  };

  const totales = useMemo(() => {
    const subtotal = items.reduce((acc, it) => acc + it.cantidad * it.precio_unitario, 0);
    const iva = subtotal * 0.16;
    return { subtotal, iva, total: subtotal + iva };
  }, [items]);

  const esValido = clienteId !== null && items.length > 0 && metodoPago !== '';

  const validate = () => {
    const e: Record<string, string> = {};
    if (!clienteId) e.cliente_id = 'Selecciona un cliente';
    if (items.length === 0) e.items = 'Agrega al menos un material';
    if (!metodoPago) e.metodo_pago = 'Selecciona un método de pago';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        cliente_id: clienteId!,
        metodo_pago: metodoPago.trim(),
        detalles: items.map(it => ({
          material_id: it.material_id,
          cantidad: it.cantidad,
          precio_unitario: it.precio_unitario,
        })),
      };
      const venta = await ventasService.crearVentaDirecta(payload);
      toast.success('Venta creada', `Folio ${venta.folio}`);
      router.push(`/comercial/ventas/${venta.id}`);
    } catch (err: any) {
      toast.error('Error', extractErrorMessage(err, 'No se pudo guardar la venta'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingClientes) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-sigo-primary" />
        <p className="text-sm text-muted">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-app transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <ShoppingCart className="text-sigo-primary" size={22} /> Nueva Venta Directa
          </h1>
          <p className="text-xs text-muted">Registra una venta de mostrador sin cotización previa</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
        <div className="relative">
          <Input
            label="Buscar cliente" required leftIcon={<Search size={15} />}
            placeholder="Escribe el nombre del cliente..."
            value={clienteQuery}
            error={errors.cliente_id}
            onChange={e => { setClienteQuery(e.target.value); setClienteId(null); setClienteDropdownOpen(true); }}
            onFocus={() => setClienteDropdownOpen(true)}
            onBlur={() => setTimeout(() => setClienteDropdownOpen(false), 150)}
          />
          {clienteDropdownOpen && clientesFiltrados.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-card border border-default rounded-xl shadow-lg max-h-56 overflow-y-auto">
              {clientesFiltrados.map(c => (
                <button
                  key={c.id} type="button"
                  onMouseDown={() => seleccionarCliente(c)}
                  className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-app transition-colors"
                >
                  {c.nombre}
                  {c.rfc && <span className="text-xs text-muted ml-2">{c.rfc}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        {clienteSeleccionado && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">Cliente seleccionado: {clienteSeleccionado.nombre}</p>
        )}
      </Card>

      <Card>
        <CardHeader><CardTitle>Materiales</CardTitle></CardHeader>

        <div className="relative">
          <Input
            leftIcon={<Search size={15} />}
            placeholder="Buscar material por nombre..."
            value={materialQuery}
            onChange={e => setMaterialQuery(e.target.value)}
          />
          {buscandoMateriales && (
            <Loader2 size={16} className="animate-spin text-muted absolute right-3 top-1/2 -translate-y-1/2" />
          )}
          {materialQuery.trim().length >= 2 && materialResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-card border border-default rounded-xl shadow-lg max-h-64 overflow-y-auto">
              {materialResults.map(m => (
                <button
                  key={m.id} type="button"
                  onMouseDown={() => elegirMaterial(m)}
                  className="w-full flex items-center justify-between gap-3 text-left px-3 py-2 hover:bg-app transition-colors"
                  disabled={m.stock_actual <= 0}
                >
                  <div>
                    <p className="text-sm text-primary font-medium">{m.nombre}</p>
                    <p className="text-xs text-muted">
                      Stock: {m.stock_actual} {m.unidad_medida} · {formatCurrency(m.precio_venta)}
                    </p>
                  </div>
                  {m.stock_actual <= 0 && <Badge variant="danger">Sin stock</Badge>}
                </button>
              ))}
            </div>
          )}
          {materialQuery.trim().length >= 2 && !buscandoMateriales && materialResults.length === 0 && (
            <p className="text-xs text-muted mt-2">Sin resultados para "{materialQuery}"</p>
          )}
        </div>

        {materialParaAgregar && (
          <div className="mt-3 p-3 rounded-xl border border-default bg-app flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-primary">{materialParaAgregar.nombre}</p>
              <p className="text-xs text-muted">
                Disponible: {materialParaAgregar.stock_actual} {materialParaAgregar.unidad_medida} · {formatCurrency(materialParaAgregar.precio_venta)} c/u
              </p>
            </div>
            <div className="w-full sm:w-28">
              <label className="text-xs font-medium text-secondary mb-1 block">Cantidad</label>
              <input type="number" min="1" max={materialParaAgregar.stock_actual} className="input-base"
                value={cantidadInput} onChange={e => setCantidadInput(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAgregarItem}><Plus size={16} /> Agregar</Button>
              <Button variant="secondary" onClick={() => setMaterialParaAgregar(null)}>Cancelar</Button>
            </div>
          </div>
        )}

        {errors.items && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertTriangle size={13} /> {errors.items}</p>}

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-default">
                {['Material', 'Cantidad', 'Precio Unitario', 'Subtotal', ''].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it.tempId} className="border-b border-default last:border-0">
                  <td className="py-2 pl-0 px-3 text-xs text-primary">{it.nombre}</td>
                  <td className="py-2 px-3 text-xs text-secondary">{it.cantidad} {it.unidad_medida}</td>
                  <td className="py-2 px-3 text-xs text-secondary">{formatCurrency(it.precio_unitario)}</td>
                  <td className="py-2 px-3 text-xs font-semibold text-primary">{formatCurrency(it.cantidad * it.precio_unitario)}</td>
                  <td className="py-2 px-3">
                    <button onClick={() => quitarItem(it.tempId)} className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-muted text-sm">Sin materiales agregados</td></tr>
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

      <Card>
        <CardHeader><CardTitle>Método de pago</CardTitle></CardHeader>
        <div className="max-w-xs">
          <Select
            required placeholder="Selecciona un método de pago"
            value={metodoPago}
            error={errors.metodo_pago}
            onChange={e => { setMetodoPago(e.target.value); setErrors(prev => ({ ...prev, metodo_pago: '' })); }}
            options={METODOS_PAGO}
          />
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => router.back()} disabled={submitting}>Cancelar</Button>
        <Button onClick={handleGuardar} loading={submitting} disabled={!esValido || submitting}>Guardar Venta</Button>
      </div>
    </div>
  );
}
