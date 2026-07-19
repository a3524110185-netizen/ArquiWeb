'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal, { ConfirmDialog } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/FormFields';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';

export default function DiasNoLaboralesPage() {
  const { diasNoLaborales, setDiasNoLaborales } = useStore();
  const toast = useToast();
  const [modal, setModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ fecha: '', nombre: '' });
  const [errors, setErrors] = useState<{ fecha?: string; nombre?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!form.fecha) e.fecha = 'Selecciona una fecha';
    if (!form.nombre.trim()) e.nombre = 'Ingresa el nombre';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const newId = `nl_${Date.now()}`;
    setDiasNoLaborales([...diasNoLaborales, { id: newId, fecha: form.fecha, nombre: form.nombre, tipo: 'Empresa' }]);
    toast.success('Día no laboral registrado');
    setModal(false);
    setForm({ fecha: '', nombre: '' });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setDiasNoLaborales(diasNoLaborales.filter(d => d.id !== deleteId));
    toast.success('Registro eliminado');
    setDeleteId(null);
  };

  const isPasado = (fecha: string) => new Date(fecha) < new Date(new Date().toDateString());

  return (
    <div className="space-y-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Días Oficiales No Laborales</CardTitle>
          <Button onClick={() => setModal(true)}><Plus size={16} /> Nuevo Registro</Button>
        </CardHeader>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-default">
                <th className="text-left py-2 px-3 text-xs font-semibold text-secondary pl-0">Fecha</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-secondary">Nombre</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-secondary">Tipo</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-secondary">Estado</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-secondary pr-0">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {diasNoLaborales.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).map(d => (
                <tr key={d.id} className="border-b border-default last:border-0 hover:bg-app transition-colors">
                  <td className="py-3 px-3 pl-0">
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={14} className="text-brand-500" />
                      <span className="font-medium text-primary">{formatDate(d.fecha)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-secondary">{d.nombre}</td>
                  <td className="py-3 px-3 text-secondary">{d.tipo}</td>
                  <td className="py-3 px-3">
                    {isPasado(d.fecha) ? <Badge variant="gray">Pasado</Badge> : <Badge variant="success">Próximo</Badge>}
                  </td>
                  <td className="py-3 px-3 pr-0">
                    <button onClick={() => setDeleteId(d.id)} className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {diasNoLaborales.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-muted">No hay registros de días no laborales</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Registrar Día No Laboral"
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button><Button onClick={handleSubmit}>Guardar</Button></>}>
        <div className="space-y-4">
          <Input label="Fecha" type="date" value={form.fecha} onChange={e => setForm(prev => ({ ...prev, fecha: e.target.value }))} error={errors.fecha} />
          <Textarea label="Nombre (Ej. Festivo Oficial)" value={form.nombre} onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))} error={errors.nombre} rows={2} />
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Eliminar registro" message="¿Estás seguro de eliminar este día no laboral?" confirmLabel="Eliminar" />
    </div>
  );
}
