'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { materialesService, MaterialFormInput } from '@/lib/services/materiales';
import { proveedoresService, ProveedorApi } from '@/lib/services/proveedores';
import { extractErrorMessage, extractFieldErrors } from '@/lib/services/api';
import { UNIDADES_MEDIDA_AGRUPADAS } from '@/lib/constants/unidades';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/FormFields';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, Package, Loader2, AlertCircle } from 'lucide-react';

const emptyForm: MaterialFormInput = {
  codigo: '', nombre: '', descripcion: '', unidad_medida: '',
  precio_compra: '', precio_venta: '', stock_actual: '', stock_minimo: '',
  proveedor_id: '',
};

export default function EditarMaterialPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const canEdit = currentUser?.rol?.nombre === 'administrador';
  const toast = useToast();

  const [proveedores, setProveedores] = useState<ProveedorApi[]>([]);
  const [form, setForm] = useState<MaterialFormInput>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser && !canEdit) router.replace(`/catalogos/materiales/${id}`);
  }, [currentUser, canEdit, router, id]);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [material, proveedoresData] = await Promise.all([
        materialesService.getMaterial(id),
        proveedoresService.getProveedores(),
      ]);
      setProveedores(proveedoresData);
      setForm({
        codigo: material.codigo, nombre: material.nombre, descripcion: material.descripcion || '',
        unidad_medida: material.unidad_medida, precio_compra: material.precio_compra, precio_venta: material.precio_venta,
        stock_actual: material.stock_actual, stock_minimo: material.stock_minimo,
        proveedor_id: material.proveedor_id ? String(material.proveedor_id) : '',
      });
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Error al cargar el material.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const f = (field: keyof MaterialFormInput, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.codigo.trim()) e.codigo = 'El código es requerido';
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!form.unidad_medida) e.unidad_medida = 'La unidad de medida es requerida';
    if (!form.proveedor_id) e.proveedor_id = 'El proveedor es requerido';
    if (form.precio_compra === '' || Number(form.precio_compra) < 0) e.precio_compra = 'Precio de compra inválido';
    if (form.precio_venta === '' || Number(form.precio_venta) < 0) e.precio_venta = 'Precio de venta inválido';
    if (form.stock_actual === '' || Number(form.stock_actual) < 0) e.stock_actual = 'Stock actual inválido';
    if (form.stock_minimo === '' || Number(form.stock_minimo) < 0) e.stock_minimo = 'Stock mínimo inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!canEdit || !validate()) return;
    setSubmitting(true);
    try {
      await materialesService.actualizarMaterial(id, form);
      toast.success('Material actualizado');
      router.push(`/catalogos/materiales/${id}`);
    } catch (err: any) {
      setErrors(extractFieldErrors(err));
      toast.error('Error', extractErrorMessage(err, 'No se pudo actualizar el material'));
    } finally {
      setSubmitting(false);
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

  if (error) {
    return (
      <div className="py-16 text-center space-y-3">
        <AlertCircle className="text-red-500 mx-auto" size={36} />
        <p className="text-sm font-medium text-red-500">{error}</p>
        <button onClick={cargar} className="text-sm text-sigo-primary hover:underline font-medium">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push(`/catalogos/materiales/${id}`)} className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-app transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <Package className="text-sigo-primary" size={22} /> Editar Material
          </h1>
          <p className="text-xs text-muted">{form.codigo}</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Datos del material</CardTitle></CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Código" required value={form.codigo} onChange={e => f('codigo', e.target.value)} error={errors.codigo} placeholder="MAT-001" />
          <Input label="Nombre" required value={form.nombre} onChange={e => f('nombre', e.target.value)} error={errors.nombre} placeholder="Ej. Cemento gris" />
          <div className="sm:col-span-2">
            <Textarea label="Descripción" value={form.descripcion} onChange={e => f('descripcion', e.target.value)} rows={2} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-secondary">Unidad de medida<span className="text-red-500 ml-0.5">*</span></label>
            <select className={`input-base ${errors.unidad_medida ? 'border-red-400' : ''}`} value={form.unidad_medida} onChange={e => f('unidad_medida', e.target.value)}>
              <option value="">Selecciona una unidad</option>
              {UNIDADES_MEDIDA_AGRUPADAS.map(grupo => (
                <optgroup key={grupo.categoria} label={grupo.categoria}>
                  {grupo.unidades.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                </optgroup>
              ))}
            </select>
            {errors.unidad_medida && <p className="text-xs text-red-500">{errors.unidad_medida}</p>}
          </div>

          <Select label="Proveedor" required value={form.proveedor_id ? String(form.proveedor_id) : ''} onChange={e => f('proveedor_id', e.target.value)}
            error={errors.proveedor_id} placeholder="Selecciona un proveedor"
            options={proveedores.map(p => ({ value: String(p.id), label: p.nombre }))} />

          <Input label="Precio de compra" required type="number" step="0.01" value={String(form.precio_compra)} onChange={e => f('precio_compra', e.target.value)} error={errors.precio_compra} />
          <Input label="Precio de venta" required type="number" step="0.01" value={String(form.precio_venta)} onChange={e => f('precio_venta', e.target.value)} error={errors.precio_venta} />
          <Input label="Stock actual" required type="number" value={String(form.stock_actual)} onChange={e => f('stock_actual', e.target.value)} error={errors.stock_actual} />
          <Input label="Stock mínimo" required type="number" value={String(form.stock_minimo)} onChange={e => f('stock_minimo', e.target.value)} error={errors.stock_minimo} />
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => router.push(`/catalogos/materiales/${id}`)} disabled={submitting}>Cancelar</Button>
        <Button onClick={handleSubmit} loading={submitting}>Guardar Cambios</Button>
      </div>
    </div>
  );
}
