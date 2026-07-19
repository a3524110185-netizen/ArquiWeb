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
import { formatCurrency } from '@/lib/utils';
import { Plus, Search, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import type { Material } from '@/types';

const CATEGORIAS = ['Estructural', 'Acabados', 'Eléctrico', 'Hidrosanitario'];
const UNIDADES = ['m³', 'kg', 'ton', 'Bulto (50kg)', 'Millar', 'Pieza', 'ml', 'm²'];
const PER_PAGE = 6;

const emptyForm = { nombre: '', categoria: 'Estructural', unidad: 'Pieza', stock: 0, stockMinimo: 0, precio: 0, proveedor: '', estado: 'Normal' as 'Normal' | 'Bajo' | 'Crítico' };

function calcEstado(stock: number, min: number): 'Normal' | 'Bajo' | 'Crítico' {
  if (stock === 0) return 'Crítico';
  if (stock < min) return (stock < min * 0.5 ? 'Crítico' : 'Bajo');
  return 'Normal';
}

export default function MaterialesPage() {
  const { materiales, addMaterial, updateMaterial, deleteMaterial } = useStore();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = materiales.filter(m => {
    const q = search.toLowerCase();
    const matchQ = m.nombre.toLowerCase().includes(q) || m.proveedor.toLowerCase().includes(q);
    const matchC = !filterCat || m.categoria === filterCat;
    return matchQ && matchC;
  });

  const { page, setPage, totalPages, paged, totalItems } = usePagination(filtered, PER_PAGE);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!form.proveedor.trim()) e.proveedor = 'El proveedor es requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openEdit = (m: Material) => {
    setForm({ nombre: m.nombre, categoria: m.categoria, unidad: m.unidad, stock: m.stock, stockMinimo: m.stockMinimo, precio: m.precio, proveedor: m.proveedor, estado: m.estado });
    setEditId(m.id); setErrors({}); setModal('edit');
  };
  const openCreate = () => { setForm({ ...emptyForm }); setErrors({}); setEditId(null); setModal('create'); };

  const handleSubmit = () => {
    if (!validate()) return;
    const withEstado = { ...form, estado: calcEstado(form.stock, form.stockMinimo) };
    if (modal === 'create') { addMaterial(withEstado as Omit<Material, 'id'>); toast.success('Material creado'); }
    else if (editId) { updateMaterial(editId, withEstado); toast.success('Material actualizado'); }
    setModal(null);
  };

  const f = (field: string, value: string | number) => setForm(prev => ({ ...prev, [field]: value }));

  const estadoVariant = (e: string) => e === 'Normal' ? 'success' : e === 'Bajo' ? 'warning' : 'danger';

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Inventario de Materiales</CardTitle>
          <Button onClick={openCreate} id="btn-add-material"><Plus size={16} /> Nuevo Material</Button>
        </CardHeader>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input-base pl-9" placeholder="Buscar material o proveedor..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="input-base sm:w-40" value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1); }}>
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-default">
                {['Material', 'Categoría', 'Unidad', 'Stock', 'Stock Mín.', 'Precio Unit.', 'Proveedor', 'Estado', ''].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(m => (
                <tr key={m.id} className="border-b border-default last:border-0 hover:bg-app transition-colors">
                  <td className="py-3 pl-0 px-3">
                    <div className="flex items-center gap-2">
                      {m.estado !== 'Normal' && <AlertTriangle size={14} className={m.estado === 'Crítico' ? 'text-red-500' : 'text-amber-500'} />}
                      <span className="text-xs font-medium text-primary">{m.nombre}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-xs text-secondary">{m.categoria}</td>
                  <td className="py-3 px-3 text-xs text-secondary">{m.unidad}</td>
                  <td className="py-3 px-3 text-xs font-medium text-primary">{m.stock}</td>
                  <td className="py-3 px-3 text-xs text-secondary">{m.stockMinimo}</td>
                  <td className="py-3 px-3 text-xs text-secondary">{formatCurrency(m.precio)}</td>
                  <td className="py-3 px-3 text-xs text-secondary">{m.proveedor}</td>
                  <td className="py-3 px-3"><Badge variant={estadoVariant(m.estado) as 'success' | 'warning' | 'danger'} dot>{m.estado}</Badge></td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg text-secondary hover:text-brand-600 hover:bg-brand-50 transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => setDeleteId(m.id)} className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && <tr><td colSpan={9} className="py-8 text-center text-sm text-muted">No se encontraron materiales</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={totalItems} itemsPerPage={PER_PAGE} />
      </Card>

      <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === 'create' ? 'Nuevo Material' : 'Editar Material'}
        footer={<><Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button><Button onClick={handleSubmit}>{modal === 'create' ? 'Crear' : 'Guardar'}</Button></>}>
        <div className="space-y-4">
          <Input label="Nombre del material" value={form.nombre} onChange={e => f('nombre', e.target.value)} error={errors.nombre} placeholder="Ej. Cemento CPC-30" />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Categoría" options={CATEGORIAS.map(c => ({ value: c, label: c }))} value={form.categoria} onChange={e => f('categoria', e.target.value)} />
            <Select label="Unidad" options={UNIDADES.map(u => ({ value: u, label: u }))} value={form.unidad} onChange={e => f('unidad', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Stock actual" type="number" value={String(form.stock)} onChange={e => f('stock', Number(e.target.value))} />
            <Input label="Stock mínimo" type="number" value={String(form.stockMinimo)} onChange={e => f('stockMinimo', Number(e.target.value))} />
          </div>
          <Input label="Precio unitario ($)" type="number" value={String(form.precio)} onChange={e => f('precio', Number(e.target.value))} />
          <Input label="Proveedor" value={form.proveedor} onChange={e => f('proveedor', e.target.value)} error={errors.proveedor} />
        </div>
      </Modal>

      <ConfirmDialog open={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => { deleteMaterial(deleteId!); toast.success('Material eliminado'); setDeleteId(null); }}
        title="Eliminar material" message="¿Confirmar eliminación de este material?" confirmLabel="Eliminar" />
    </div>
  );
}
