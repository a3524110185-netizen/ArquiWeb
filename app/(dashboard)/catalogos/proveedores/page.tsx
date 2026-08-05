'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { proveedoresService, ProveedorApi, ProveedorFormInput } from '@/lib/services/proveedores';
import { extractErrorMessage, extractFieldErrors } from '@/lib/services/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal, { ConfirmDialog } from '@/components/ui/Modal';
import { Input } from '@/components/ui/FormFields';
import Pagination, { usePagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { Plus, Search, Edit2, Trash2, Loader2, AlertCircle, Truck, Lock } from 'lucide-react';

const PER_PAGE = 8;

const emptyForm: ProveedorFormInput = { nombre: '', contacto: '', telefono: '', email: '', direccion: '', especialidad: '' };

export default function ProveedoresPage() {
  const { currentUser } = useAuthStore();
  const canEdit = currentUser?.rol?.nombre === 'administrador';
  const toast = useToast();

  const [proveedores, setProveedores] = useState<ProveedorApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ProveedorFormInput>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const cargarProveedores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await proveedoresService.getProveedores();
      setProveedores(data);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Error al cargar los proveedores.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarProveedores(); }, [cargarProveedores]);

  const filtered = useMemo(() => proveedores.filter(p => {
    const q = search.toLowerCase();
    return p.nombre.toLowerCase().includes(q) || (p.contacto || '').toLowerCase().includes(q);
  }), [proveedores, search]);

  const { page, setPage, totalPages, paged, totalItems } = usePagination(filtered, PER_PAGE);

  const openCreate = () => { setForm(emptyForm); setErrors({}); setEditId(null); setModal('create'); };
  const openEdit = (p: ProveedorApi) => {
    setForm({ nombre: p.nombre, contacto: p.contacto || '', telefono: p.telefono || '', email: p.email || '', direccion: p.direccion || '', especialidad: p.especialidad || '' });
    setEditId(p.id); setErrors({}); setModal('edit');
  };

  const f = (field: keyof ProveedorFormInput, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!canEdit || !validate()) return;
    setSubmitting(true);
    try {
      if (modal === 'create') {
        await proveedoresService.crearProveedor(form);
        toast.success('Proveedor creado', `${form.nombre} agregado exitosamente`);
      } else if (editId) {
        await proveedoresService.actualizarProveedor(editId, form);
        toast.success('Proveedor actualizado');
      }
      setModal(null);
      cargarProveedores();
    } catch (err: any) {
      setErrors(extractFieldErrors(err));
      toast.error('Error', extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await proveedoresService.desactivarProveedor(id);
      toast.success('Proveedor desactivado');
      cargarProveedores();
    } catch (err: any) {
      toast.error('Error', extractErrorMessage(err, 'No se pudo desactivar el proveedor'));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Proveedores</CardTitle>
          {canEdit ? (
            <Button onClick={openCreate}><Plus size={16} /> Nuevo Proveedor</Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted"><Lock size={12} /> Solo lectura</span>
          )}
        </CardHeader>

        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input-base pl-9" placeholder="Buscar por nombre o contacto..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="animate-spin text-brand-600" />
            <p className="text-sm text-muted">Cargando proveedores...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="text-red-500 mx-auto" size={36} />
            <p className="text-sm font-medium text-red-500">{error}</p>
            <button onClick={cargarProveedores} className="text-sm text-brand-600 hover:underline font-medium">Reintentar</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default">
                    {['Nombre', 'Contacto', 'Teléfono', 'Email', 'Estado', ''].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map(p => (
                    <tr key={p.id} onClick={() => openEdit(p)} className="border-b border-default last:border-0 hover:bg-app transition-colors cursor-pointer">
                      <td className="py-3 pl-0 px-3 text-xs font-medium text-primary">{p.nombre}</td>
                      <td className="py-3 px-3 text-xs text-secondary">{p.contacto || '—'}</td>
                      <td className="py-3 px-3 text-xs text-secondary">{p.telefono || '—'}</td>
                      <td className="py-3 px-3 text-xs text-secondary max-w-[200px] truncate">{p.email || '—'}</td>
                      <td className="py-3 px-3">
                        <Badge variant={p.activo ? 'success' : 'gray'} dot>{p.activo ? 'Activo' : 'Inactivo'}</Badge>
                      </td>
                      <td className="py-3 px-3" onClick={e => e.stopPropagation()}>
                        {canEdit && (
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-secondary hover:text-brand-600 hover:bg-brand-50 transition-colors">
                              <Edit2 size={14} />
                            </button>
                            {p.activo && (
                              <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted">
                          <Truck size={28} />
                          <p className="text-sm">No hay proveedores registrados</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={totalItems} itemsPerPage={PER_PAGE} />
          </>
        )}
      </Card>

      <Modal
        open={modal !== null} onClose={() => setModal(null)}
        title={modal === 'create' ? 'Nuevo Proveedor' : canEdit ? 'Editar Proveedor' : 'Detalle de Proveedor'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>{canEdit ? 'Cancelar' : 'Cerrar'}</Button>
            {canEdit && <Button onClick={handleSubmit} loading={submitting}>{modal === 'create' ? 'Crear Proveedor' : 'Guardar Cambios'}</Button>}
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Nombre" required disabled={!canEdit} value={form.nombre} onChange={e => f('nombre', e.target.value)} error={errors.nombre} placeholder="Ej. Materiales del Norte S.A." />
          <Input label="Contacto" disabled={!canEdit} value={form.contacto} onChange={e => f('contacto', e.target.value)} error={errors.contacto} placeholder="Nombre del contacto" />
          <Input label="Teléfono" disabled={!canEdit} value={form.telefono} onChange={e => f('telefono', e.target.value)} error={errors.telefono} placeholder="555-0100" />
          <Input label="Email" type="email" disabled={!canEdit} value={form.email} onChange={e => f('email', e.target.value)} error={errors.email} placeholder="contacto@proveedor.com" />
          <Input label="Dirección" disabled={!canEdit} value={form.direccion} onChange={e => f('direccion', e.target.value)} error={errors.direccion} />
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Desactivar proveedor"
        message="¿Estás seguro de que deseas desactivar este proveedor?"
        confirmLabel={deleting ? 'Desactivando...' : 'Desactivar'}
      />
    </div>
  );
}
