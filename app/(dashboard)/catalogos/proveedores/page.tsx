'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal, { ConfirmDialog } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/FormFields';
import Pagination, { usePagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { Plus, Search, Edit2, Trash2, Star } from 'lucide-react';
import type { Proveedor } from '@/types';

const ESPECIALIDADES = ['Materiales de construcción', 'Agregados y cementos', 'Consultoría y diseño estructural', 'Maquinaria y equipo', 'Instalaciones eléctricas', 'Instalaciones hidrosanitarias', 'Prefabricados', 'Transportes'];
const PER_PAGE = 6;
const emptyForm = { empresa: '', contacto: '', email: '', telefono: '', especialidad: ESPECIALIDADES[0], estado: 'Activo' as 'Activo' | 'Inactivo', calificacion: 5 };

export default function ProveedoresPage() {
  const { proveedores, addProveedor, updateProveedor, deleteProveedor } = useStore();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = proveedores.filter(p => {
    const q = search.toLowerCase();
    return p.empresa.toLowerCase().includes(q) || p.contacto.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
  });

  const { page, setPage, totalPages, paged, totalItems } = usePagination(filtered, PER_PAGE);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.empresa.trim()) e.empresa = 'El nombre de empresa es requerido';
    if (!form.email.includes('@')) e.email = 'Email inválido';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const openEdit = (p: Proveedor) => {
    setForm({ empresa: p.empresa, contacto: p.contacto, email: p.email, telefono: p.telefono, especialidad: p.especialidad, estado: p.estado, calificacion: p.calificacion });
    setEditId(p.id); setErrors({}); setModal('edit');
  };
  const openCreate = () => { setForm({ ...emptyForm }); setErrors({}); setEditId(null); setModal('create'); };

  const handleSubmit = () => {
    if (!validate()) return;
    if (modal === 'create') { addProveedor(form as Omit<Proveedor, 'id'>); toast.success('Proveedor creado'); }
    else if (editId) { updateProveedor(editId, form); toast.success('Proveedor actualizado'); }
    setModal(null);
  };

  const f = (field: string, value: string | number) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Proveedores y Contratistas</CardTitle>
          <Button onClick={openCreate} id="btn-add-proveedor"><Plus size={16} /> Nuevo Proveedor</Button>
        </CardHeader>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input-base pl-9" placeholder="Buscar empresa, contacto o email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-default">
                {['Empresa', 'Contacto', 'Email', 'Teléfono', 'Especialidad', 'Calificación', 'Estado', ''].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(p => (
                <tr key={p.id} className="border-b border-default last:border-0 hover:bg-app transition-colors">
                  <td className="py-3 pl-0 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-300 font-bold text-xs shrink-0">
                        {p.empresa.charAt(0)}
                      </div>
                      <span className="text-xs font-medium text-primary">{p.empresa}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-xs text-secondary">{p.contacto}</td>
                  <td className="py-3 px-3 text-xs text-secondary">{p.email}</td>
                  <td className="py-3 px-3 text-xs text-secondary">{p.telefono}</td>
                  <td className="py-3 px-3 text-xs text-secondary max-w-[160px] truncate">{p.especialidad}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-medium text-primary">{p.calificacion}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3"><Badge variant={p.estado === 'Activo' ? 'success' : 'gray'} dot>{p.estado}</Badge></td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-secondary hover:text-brand-600 hover:bg-brand-50 transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-sm text-muted">No se encontraron proveedores</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={totalItems} itemsPerPage={PER_PAGE} />
      </Card>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === 'create' ? 'Nuevo Proveedor' : 'Editar Proveedor'}
        footer={<><Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button><Button onClick={handleSubmit}>{modal === 'create' ? 'Crear' : 'Guardar'}</Button></>}>
        <div className="space-y-4">
          <Input label="Nombre de empresa" value={form.empresa} onChange={e => f('empresa', e.target.value)} error={errors.empresa} />
          <Input label="Contacto principal" value={form.contacto} onChange={e => f('contacto', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" type="email" value={form.email} onChange={e => f('email', e.target.value)} error={errors.email} />
            <Input label="Teléfono" value={form.telefono} onChange={e => f('telefono', e.target.value)} />
          </div>
          <Select label="Especialidad" options={ESPECIALIDADES.map(e => ({ value: e, label: e }))} value={form.especialidad} onChange={e => f('especialidad', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Estado" options={[{ value: 'Activo', label: 'Activo' }, { value: 'Inactivo', label: 'Inactivo' }]} value={form.estado} onChange={e => f('estado', e.target.value)} />
            <Input label="Calificación (1-5)" type="number" min="1" max="5" step="0.1" value={String(form.calificacion)} onChange={e => f('calificacion', Number(e.target.value))} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => { deleteProveedor(deleteId!); toast.success('Proveedor eliminado'); setDeleteId(null); }}
        title="Eliminar proveedor" message="¿Confirmar eliminación?" confirmLabel="Eliminar" />
    </div>
  );
}
