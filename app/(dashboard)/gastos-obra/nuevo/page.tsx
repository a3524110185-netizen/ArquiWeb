'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { gastosObraService, GastoObraFormInput } from '@/lib/services/gastosObra';
import { categoriasGastoService, CategoriaGastoApi } from '@/lib/services/categoriasGasto';
import { proyectosService, ProyectoApi } from '@/lib/services/proyectos';
import { proveedoresService, ProveedorApi } from '@/lib/services/proveedores';
import { extractErrorMessage, extractFieldErrors } from '@/lib/services/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/FormFields';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, DollarSign, Loader2, UploadCloud, X } from 'lucide-react';

const emptyForm = {
  proyecto_id: '', categoria_id: '', proveedor_id: '', monto: '', fecha: new Date().toISOString().split('T')[0], descripcion: '',
};

export default function NuevoGastoPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const rol = currentUser?.rol?.nombre || '';
  const canManage = rol === 'administrador' || rol === 'gerente';
  const toast = useToast();

  useEffect(() => {
    if (currentUser && !canManage) router.replace('/gastos-obra');
  }, [currentUser, canManage, router]);

  const [proyectos, setProyectos] = useState<ProyectoApi[]>([]);
  const [categorias, setCategorias] = useState<CategoriaGastoApi[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorApi[]>([]);
  const [loadingBase, setLoadingBase] = useState(true);

  const [form, setForm] = useState(emptyForm);
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoadingBase(true);
    Promise.all([
      proyectosService.getProyectos(),
      categoriasGastoService.listar(),
      proveedoresService.getProveedores(),
    ]).then(([p, c, pr]) => {
      setProyectos(p); setCategorias(c); setProveedores(pr);
    }).finally(() => setLoadingBase(false));
  }, []);

  const f = (field: keyof typeof emptyForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleFile = (file: File | null) => {
    if (file && !/\.(pdf|png|jpe?g)$/i.test(file.name)) {
      toast.error('Archivo no válido', 'Solo se aceptan PDF, JPG o PNG');
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error('Archivo muy grande', 'El comprobante no debe superar 5MB');
      return;
    }
    setComprobante(file);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.proyecto_id) e.proyecto_id = 'Selecciona un proyecto';
    if (!form.categoria_id) e.categoria_id = 'Selecciona una categoría';
    if (!form.monto || Number(form.monto) <= 0) e.monto = 'Ingresa un monto válido';
    if (!form.fecha) e.fecha = 'Selecciona una fecha';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload: GastoObraFormInput = {
        proyecto_id: form.proyecto_id,
        categoria_id: form.categoria_id,
        proveedor_id: form.proveedor_id || null,
        monto: form.monto,
        fecha: form.fecha,
        descripcion: form.descripcion || undefined,
        comprobante,
      };
      const gasto = await gastosObraService.crear(payload);
      toast.success('Gasto registrado', 'El gasto se guardó correctamente');
      router.push(`/gastos-obra/${gasto.id}`);
    } catch (err: any) {
      setErrors(prev => ({ ...prev, ...extractFieldErrors(err) }));
      toast.error('Error', extractErrorMessage(err, 'No se pudo registrar el gasto'));
    } finally {
      setSubmitting(false);
    }
  };

  if (currentUser && !canManage) return null;

  if (loadingBase) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-brand-600" />
        <p className="text-sm text-muted">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-app transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <DollarSign className="text-brand-600" size={22} /> Nuevo Gasto de Obra
        </h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Datos del gasto</CardTitle></CardHeader>
        <div className="space-y-4">
          <Select label="Proyecto" required placeholder="Selecciona un proyecto" value={form.proyecto_id}
            onChange={e => f('proyecto_id', e.target.value)} error={errors.proyecto_id}
            options={proyectos.map(p => ({ value: String(p.id), label: p.nombre }))} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Categoría" required placeholder="Selecciona una categoría" value={form.categoria_id}
              onChange={e => f('categoria_id', e.target.value)} error={errors.categoria_id}
              options={categorias.map(c => ({ value: String(c.id), label: c.nombre }))} />
            <Select label="Proveedor (opcional)" placeholder="Selecciona un proveedor" value={form.proveedor_id}
              onChange={e => f('proveedor_id', e.target.value)}
              options={proveedores.map(p => ({ value: String(p.id), label: p.nombre }))} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Monto ($)" type="number" min="0" step="0.01" required value={form.monto}
              onChange={e => f('monto', e.target.value)} error={errors.monto} placeholder="0.00" />
            <Input label="Fecha" type="date" required value={form.fecha}
              onChange={e => f('fecha', e.target.value)} error={errors.fecha} />
          </div>

          <Textarea label="Descripción (opcional)" rows={3} value={form.descripcion}
            onChange={e => f('descripcion', e.target.value)} placeholder="¿Qué se compró o pagó?" />

          <div>
            <label className="text-xs font-medium text-secondary mb-1 block">Comprobante (opcional)</label>
            {comprobante ? (
              <div className="flex items-center justify-between p-3 rounded-xl border border-default bg-app">
                <span className="text-sm text-primary truncate">{comprobante.name}</span>
                <button onClick={() => setComprobante(null)} className="p-1 rounded-lg text-secondary hover:text-red-500 transition-colors">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-default rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-app transition-colors cursor-pointer">
                <UploadCloud size={28} className="text-brand-500 mb-2" />
                <p className="text-sm font-medium text-primary">Haz clic para subir un archivo</p>
                <p className="text-xs text-muted mt-1">PDF, JPG o PNG (máx. 5MB)</p>
                <input type="file" className="hidden" accept=".pdf,image/*" onChange={e => handleFile(e.target.files?.[0] || null)} />
              </label>
            )}
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => router.back()} disabled={submitting}>Cancelar</Button>
        <Button onClick={handleGuardar} loading={submitting}>Guardar Gasto</Button>
      </div>
    </div>
  );
}
