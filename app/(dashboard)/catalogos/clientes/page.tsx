'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { clientesService, ClienteApi, ClienteFormInput } from '@/lib/services/clientes';
import { extractErrorMessage, extractFieldErrors } from '@/lib/services/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal, { ConfirmDialog } from '@/components/ui/Modal';
import { Input } from '@/components/ui/FormFields';
import Pagination, { usePagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { Plus, Search, Edit2, Trash2, Loader2, AlertCircle, Briefcase, Lock } from 'lucide-react';

const PER_PAGE = 8;

const emptyForm: ClienteFormInput = { nombre: '', rfc: '', contacto: '', telefono: '', email: '', direccion: '' };

export default function ClientesPage() {
  const { currentUser } = useAuthStore();
  const canEdit = currentUser?.rol?.nombre === 'administrador';
  const toast = useToast();

  const [clientes, setClientes] = useState<ClienteApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ClienteFormInput>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const cargarClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientesService.getClientes();
      setClientes(data);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Error al cargar los clientes.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarClientes(); }, [cargarClientes]);

  const filtered = useMemo(() => clientes.filter(c => {
    const q = search.toLowerCase();
    return c.nombre.toLowerCase().includes(q) || (c.rfc || '').toLowerCase().includes(q);
  }), [clientes, search]);

  const { page, setPage, totalPages, paged, totalItems } = usePagination(filtered, PER_PAGE);

  const openCreate = () => { setForm(emptyForm); setErrors({}); setEditId(null); setModal('create'); };
  const openEdit = (c: ClienteApi) => {
    setForm({ nombre: c.nombre, rfc: c.rfc || '', contacto: c.contacto || '', telefono: c.telefono || '', email: c.email || '', direccion: c.direccion || '' });
    setEditId(c.id); setErrors({}); setModal('edit');
  };

  const f = (field: keyof ClienteFormInput, value: string) => {
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
        await clientesService.crearCliente(form);
        toast.success('Cliente creado', `${form.nombre} agregado exitosamente`);
      } else if (editId) {
        await clientesService.actualizarCliente(editId, form);
        toast.success('Cliente actualizado');
      }
      setModal(null);
      cargarClientes();
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
      await clientesService.desactivarCliente(id);
      toast.success('Cliente desactivado');
      cargarClientes();
    } catch (err: any) {
      toast.error('Error', extractErrorMessage(err, 'No se pudo desactivar el cliente'));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Directorio de Clientes</CardTitle>
          {canEdit ? (
            <Button onClick={openCreate}><Plus size={16} /> Nuevo Cliente</Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted"><Lock size={12} /> Solo lectura</span>
          )}
        </CardHeader>

        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input-base pl-9" placeholder="Buscar por nombre o RFC..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="animate-spin text-brand-600" />
            <p className="text-sm text-muted">Cargando clientes...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="text-red-500 mx-auto" size={36} />
            <p className="text-sm font-medium text-red-500">{error}</p>
            <button onClick={cargarClientes} className="text-sm text-brand-600 hover:underline font-medium">Reintentar</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default">
                    {['Nombre', 'RFC', 'Contacto', 'Teléfono', 'Email', 'Estado', ''].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map(c => (
                    <tr key={c.id} onClick={() => openEdit(c)} className="border-b border-default last:border-0 hover:bg-app transition-colors cursor-pointer">
                      <td className="py-3 pl-0 px-3 text-xs font-medium text-primary">{c.nombre}</td>
                      <td className="py-3 px-3 font-mono text-xs text-secondary">{c.rfc || '—'}</td>
                      <td className="py-3 px-3 text-xs text-secondary">{c.contacto || '—'}</td>
                      <td className="py-3 px-3 text-xs text-secondary">{c.telefono || '—'}</td>
                      <td className="py-3 px-3 text-xs text-secondary max-w-[200px] truncate">{c.email || '—'}</td>
                      <td className="py-3 px-3">
                        <Badge variant={c.activo ? 'success' : 'gray'} dot>{c.activo ? 'Activo' : 'Inactivo'}</Badge>
                      </td>
                      <td className="py-3 px-3" onClick={e => e.stopPropagation()}>
                        {canEdit && (
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-secondary hover:text-brand-600 hover:bg-brand-50 transition-colors">
                              <Edit2 size={14} />
                            </button>
                            {c.activo && (
                              <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors">
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
                      <td colSpan={7} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted">
                          <Briefcase size={28} />
                          <p className="text-sm">No hay clientes registrados</p>
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
        title={modal === 'create' ? 'Nuevo Cliente' : canEdit ? 'Editar Cliente' : 'Detalle de Cliente'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>{canEdit ? 'Cancelar' : 'Cerrar'}</Button>
            {canEdit && <Button onClick={handleSubmit} loading={submitting}>{modal === 'create' ? 'Crear Cliente' : 'Guardar Cambios'}</Button>}
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Nombre" required disabled={!canEdit} value={form.nombre} onChange={e => f('nombre', e.target.value)} error={errors.nombre} placeholder="Ej. Grupo Constructor XYZ" />
          <Input label="RFC" disabled={!canEdit} value={form.rfc} onChange={e => f('rfc', e.target.value)} error={errors.rfc} placeholder="RFC del cliente" />
          <Input label="Contacto" disabled={!canEdit} value={form.contacto} onChange={e => f('contacto', e.target.value)} error={errors.contacto} placeholder="Nombre del contacto" />
          <Input label="Teléfono" disabled={!canEdit} value={form.telefono} onChange={e => f('telefono', e.target.value)} error={errors.telefono} placeholder="555-0100" />
          <Input label="Email" type="email" disabled={!canEdit} value={form.email} onChange={e => f('email', e.target.value)} error={errors.email} placeholder="contacto@cliente.com" />
          <Input label="Dirección" disabled={!canEdit} value={form.direccion} onChange={e => f('direccion', e.target.value)} error={errors.direccion} />
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Desactivar cliente"
        message="¿Estás seguro de que deseas desactivar este cliente?"
        confirmLabel={deleting ? 'Desactivando...' : 'Desactivar'}
      />
    </div>
  );
}
