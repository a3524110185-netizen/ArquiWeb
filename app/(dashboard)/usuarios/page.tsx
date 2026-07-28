'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { usuariosService, UsuarioApi, RolApi, UsuarioFormInput } from '@/lib/services/usuarios';
import { ApiError } from '@/lib/services/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { rolVariant } from '@/components/ui/Badge';
import Modal, { ConfirmDialog } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/FormFields';
import Pagination, { usePagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime } from '@/lib/utils';
import { Plus, Search, Edit2, Trash2, RotateCcw, Loader2, AlertCircle, Users } from 'lucide-react';

const PER_PAGE = 6;

const emptyForm = { nombre: '', email: '', password: '', telefono: '', rol_id: '' };

const capitalizar = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '—');

export default function UsuariosPage() {
  const toast = useToast();

  const [usuarios, setUsuarios] = useState<UsuarioApi[]>([]);
  const [roles, setRoles] = useState<RolApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'activos' | 'inactivos'>('todos');

  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const param = filterEstado === 'todos' ? 'todos' : filterEstado === 'inactivos' ? '0' : undefined;
      const data = await usuariosService.getUsuarios(param);
      setUsuarios(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  }, [filterEstado]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  useEffect(() => {
    usuariosService.getRoles().then(setRoles);
  }, []);

  const filtered = useMemo(() => usuarios.filter(u => {
    const q = search.toLowerCase();
    const matchQ = u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRol = !filterRol || u.rol?.nombre === filterRol;
    return matchQ && matchRol;
  }), [usuarios, search, filterRol]);

  const { page, setPage, totalPages, paged, totalItems } = usePagination(filtered, PER_PAGE);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!form.email.includes('@')) e.email = 'Email inválido';
    if (!form.rol_id) e.rol_id = 'El rol es requerido';
    if (modal === 'create' && form.password.length < 6) e.password = 'La contraseña debe tener al menos 6 caracteres';
    if (modal === 'edit' && form.password && form.password.length < 6) e.password = 'La contraseña debe tener al menos 6 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openCreate = () => {
    setForm(emptyForm); setErrors({}); setEditId(null); setModal('create');
  };
  const openEdit = (u: UsuarioApi) => {
    setForm({ nombre: u.nombre, email: u.email, password: '', telefono: u.telefono || '', rol_id: String(u.rol?.id ?? u.rol_id ?? '') });
    setEditId(u.id); setErrors({}); setModal('edit');
  };

  const applyApiErrors = (err: any) => {
    if (err instanceof ApiError && err.data?.errors) {
      const fieldErrors: Record<string, string> = {};
      Object.entries(err.data.errors as Record<string, string[]>).forEach(([field, msgs]) => {
        fieldErrors[field] = msgs[0];
      });
      setErrors(fieldErrors);
    }
    toast.error('Error', err.message || 'Ocurrió un error inesperado');
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload: UsuarioFormInput = {
        nombre: form.nombre,
        email: form.email,
        rol_id: Number(form.rol_id),
        telefono: form.telefono,
      };
      if (form.password) payload.password = form.password;

      if (modal === 'create') {
        await usuariosService.createUsuario(payload);
        toast.success('Usuario creado', `${form.nombre} agregado exitosamente`);
      } else if (editId) {
        await usuariosService.updateUsuario(editId, payload);
        toast.success('Usuario actualizado');
      }
      setModal(null);
      cargarUsuarios();
    } catch (err: any) {
      applyApiErrors(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setProcessingId(id);
    try {
      await usuariosService.deleteUsuario(id);
      toast.success('Usuario desactivado');
      cargarUsuarios();
    } catch (err: any) {
      toast.error('Error', err.message || 'No se pudo desactivar el usuario');
    } finally {
      setProcessingId(null);
      setDeleteId(null);
    }
  };

  const handleActivar = async (id: number) => {
    setProcessingId(id);
    try {
      await usuariosService.updateUsuario(id, { activo: true } as any);
      toast.success('Usuario activado');
      cargarUsuarios();
    } catch (err: any) {
      toast.error('Error', err.message || 'No se pudo activar el usuario');
    } finally {
      setProcessingId(null);
    }
  };

  const f = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
          <Button onClick={openCreate} id="btn-add-user">
            <Plus size={16} /> Nuevo Usuario
          </Button>
        </CardHeader>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input-base pl-9" placeholder="Buscar por nombre o email..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <Select
            options={[{ value: '', label: 'Todos los roles' }, ...roles.map(r => ({ value: r.nombre, label: capitalizar(r.nombre) }))]}
            value={filterRol} onChange={e => { setFilterRol(e.target.value); setPage(1); }}
            className="sm:w-44"
          />
          <Select
            options={[
              { value: 'todos', label: 'Todos los estados' },
              { value: 'activos', label: 'Solo activos' },
              { value: 'inactivos', label: 'Solo inactivos' },
            ]}
            value={filterEstado} onChange={e => { setFilterEstado(e.target.value as any); setPage(1); }}
            className="sm:w-44"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="animate-spin text-brand-600" />
            <p className="text-sm text-muted">Cargando usuarios...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="text-red-500 mx-auto" size={36} />
            <p className="text-sm font-medium text-red-500">{error}</p>
            <button onClick={cargarUsuarios} className="text-sm text-brand-600 hover:underline font-medium">Reintentar</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default">
                    {['Usuario', 'Rol', 'Email', 'Teléfono', 'Estado', 'Registrado', ''].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map(u => {
                    const initials = u.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
                    return (
                      <tr key={u.id} className="border-b border-default last:border-0 hover:bg-app transition-colors">
                        <td className="py-3 pl-0 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-xs font-bold text-white shrink-0">
                              {initials}
                            </div>
                            <p className="text-xs font-medium text-primary">{u.nombre}</p>
                          </div>
                        </td>
                        <td className="py-3 px-3"><Badge variant={rolVariant(capitalizar(u.rol?.nombre))}>{capitalizar(u.rol?.nombre)}</Badge></td>
                        <td className="py-3 px-3 text-xs text-secondary max-w-[200px] truncate">{u.email}</td>
                        <td className="py-3 px-3 text-xs text-secondary">{u.telefono || '—'}</td>
                        <td className="py-3 px-3">
                          <Badge variant={u.activo ? 'success' : 'gray'} dot>{u.activo ? 'Activo' : 'Inactivo'}</Badge>
                        </td>
                        <td className="py-3 px-3 text-xs text-secondary">{formatDateTime(u.created_at || '')}</td>
                        <td className="py-3 px-3">
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-secondary hover:text-brand-600 hover:bg-brand-50 transition-colors">
                              <Edit2 size={14} />
                            </button>
                            {u.activo ? (
                              <button onClick={() => setDeleteId(u.id)} disabled={processingId === u.id}
                                className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
                                {processingId === u.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              </button>
                            ) : (
                              <button onClick={() => handleActivar(u.id)} disabled={processingId === u.id}
                                className="p-1.5 rounded-lg text-secondary hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                                title="Activar usuario">
                                {processingId === u.id ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {paged.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted">
                          <Users size={28} />
                          <p className="text-sm">No hay usuarios registrados</p>
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

      {/* Modal Create/Edit */}
      <Modal
        open={modal !== null} onClose={() => setModal(null)}
        title={modal === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)} disabled={submitting}>Cancelar</Button>
            <Button onClick={handleSubmit} loading={submitting}>{modal === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Nombre completo" value={form.nombre} onChange={e => f('nombre', e.target.value)}
            error={errors.nombre} placeholder="Ej. Juan Pérez" />
          <Input label="Email" type="email" value={form.email} onChange={e => f('email', e.target.value)}
            error={errors.email} placeholder="usuario@empresa.mx" />
          <Input label={modal === 'edit' ? 'Nueva contraseña (opcional)' : 'Contraseña'} type="password"
            value={form.password} onChange={e => f('password', e.target.value)}
            error={errors.password} placeholder="Mínimo 6 caracteres" />
          <Input label="Teléfono" value={form.telefono} onChange={e => f('telefono', e.target.value)}
            error={errors.telefono} placeholder="555-0100" />
          <Select label="Rol" options={roles.map(r => ({ value: String(r.id), label: capitalizar(r.nombre) }))}
            value={form.rol_id} onChange={e => f('rol_id', e.target.value)}
            error={errors.rol_id} placeholder="Selecciona un rol" />
        </div>
      </Modal>

      {/* Confirm Desactivar */}
      <ConfirmDialog
        open={deleteId !== null} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Desactivar usuario"
        message="¿Estás seguro de que deseas desactivar este usuario? Podrás reactivarlo más tarde."
        confirmLabel="Desactivar"
      />
    </div>
  );
}
