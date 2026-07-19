'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { Input, Select, Textarea } from '@/components/ui/FormFields';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Building2, ArrowLeft, UploadCloud } from 'lucide-react';
import type { GastoCategoria } from '@/types';

const emptyForm = { proyectoId: '', categoria: 'Materiales' as GastoCategoria, monto: '', fecha: new Date().toISOString().split('T')[0], descripcion: '' };

export default function GastosNuevoPage() {
  const { proyectos, addGasto, darkMode } = useStore();
  const toast = useToast();
  const router = useRouter();
  const [form, setForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.proyectoId) e.proyectoId = 'Selecciona un proyecto';
    if (!form.monto || Number(form.monto) <= 0) e.monto = 'Ingresa un monto válido';
    if (!form.fecha) e.fecha = 'Selecciona una fecha';
    if (!form.descripcion.trim()) e.descripcion = 'Ingresa una descripción';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      const p = proyectos.find(x => x.id === form.proyectoId);
      addGasto({ proyecto: p?.nombre ?? '', proyectoId: form.proyectoId, categoria: form.categoria, monto: Number(form.monto), fecha: form.fecha, descripcion: form.descripcion, capturista: 'Usuario Capturista' });
      toast.success('Gasto registrado exitosamente');
      setForm({ ...emptyForm });
      setLoading(false);
    }, 800);
  };

  const f = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
      {/* Header Capturista */}
      <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">ArquiWeb</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Panel de Captura</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="text-slate-500">
          <ArrowLeft size={16} /> Volver
        </Button>
      </header>

      {/* Form Area */}
      <main className="flex-1 p-4 sm:p-8 flex justify-center items-start">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden fade-in">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Registrar Gasto de Obra</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ingresa los detalles del gasto y adjunta el comprobante (ticket o factura).</p>
          </div>

          <div className="p-6 space-y-5">
            <Select label="Proyecto *" options={proyectos.map(p => ({ value: p.id, label: p.nombre }))} placeholder="Seleccionar proyecto"
              value={form.proyectoId} onChange={e => f('proyectoId', e.target.value)} error={errors.proyectoId} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Select label="Categoría *" options={['Materiales', 'Mano de obra', 'Equipo', 'Transporte', 'Otros'].map(c => ({ value: c, label: c }))}
                value={form.categoria} onChange={e => f('categoria', e.target.value)} />
              <Input label="Fecha *" type="date" value={form.fecha} onChange={e => f('fecha', e.target.value)} error={errors.fecha} />
            </div>

            <Input label="Monto total ($) *" type="number" placeholder="0.00" value={form.monto} onChange={e => f('monto', e.target.value)} error={errors.monto} />

            <Textarea label="Descripción del gasto *" rows={3} placeholder="¿Qué se compró o pagó?" value={form.descripcion} onChange={e => f('descripcion', e.target.value)} error={errors.descripcion} />

            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Comprobante (opcional)</label>
              <div className="mt-1 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                <UploadCloud size={32} className="text-brand-500 mb-2" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Haz clic para subir un archivo</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PDF, JPG o PNG (Max. 5MB)</p>
                <input type="file" className="hidden" accept=".pdf,image/*" />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setForm({ ...emptyForm })}>Limpiar</Button>
            <Button onClick={handleSubmit} loading={loading}>Guardar Gasto</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
