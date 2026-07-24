'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/store/useAuthStore';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { rolVariant } from '@/components/ui/Badge';
import Modal, { ConfirmDialog } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/FormFields';
import Pagination, { usePagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime } from '@/lib/utils';
import { Plus, Search, Edit2, Trash2, UserCheck, UserX } from 'lucide-react';
import type { Usuario, Role } from '@/types';

const ROLES: Role[] = ['Administrador', 'Gerente', 'Supervisor', 'Capturista', 'Ingeniero', 'Ventas', 'Almacenista', 'Operativo'];
const PER_PAGE = 6;

const emptyForm = { nombre: '', rol: 'Operativo' as Role, email: '', telefono: '', estado: 'Activo' as 'Activo' | 'Inactivo', avatar: '' };

export default function UsuariosPage() {
  const { usuarios, addUsuario, updateUsuario, deleteUsuario } = useStore();
  const { currentUser } = useAuthStore();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = usuarios.filter(u => {
    const q = search.toLowerCase();
    const matchQ = u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRol = !filterRol || u.rol === filterRol;
    return matchQ && matchRol;
  });

  const { page, setPage, totalPages, paged, totalItems } = usePagination(filtered, PER_PAGE);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!form.email.includes('@')) e.email = 'Email inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openCreate = () => {
    setForm(emptyForm); setErrors({}); setEditId(null); setModal('create');
  };
  const openEdit = (u: Usuario) => {
    setForm({ nombre: u.nombre, rol: u.rol, email: u.email, telefono: u.telefono, estado: u.estado, avatar: u.avatar });
    setEditId(u.id); setErrors({}); setModal('edit');
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const initials = form.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
    if (modal === 'create') {
      addUsuario({ ...form, avatar: initials, ultimoAcceso: new Date().toISOString(), empresaId: (currentUser as any)?.empresaId || 'e1' });
      toast.success('Usuario creado', `${form.nombre} agregado exitosamente`);
    } else if (editId) {
      updateUsuario(editId, { ...form, avatar: initials });
      toast.success('Usuario actualizado');
    }
    setModal(null);
  };

  const handleDelete = (id: string) => {
    deleteUsuario(id);
    toast.success('Usuario eliminado');
    setDeleteId(null);
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
            options={[{ value: '', label: 'Todos los roles' }, ...ROLES.map(r => ({ value: r, label: r }))]}
            value={filterRol} onChange={e => { setFilterRol(e.target.value); setPage(1); }}
            className="sm:w-44"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-default">
                {['Usuario', 'Rol', 'Email', 'Teléfono', 'Estado', 'Último Acceso', ''].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(u => (
                <tr key={u.id} className="border-b border-default last:border-0 hover:bg-app transition-colors">
                  <td className="py-3 pl-0 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {u.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-primary">{u.nombre}</p>
                        {u.proyecto && <p className="text-[10px] text-muted">{u.proyecto}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3"><Badge variant={rolVariant(u.rol)}>{u.rol}</Badge></td>
                  <td className="py-3 px-3 text-xs text-secondary">{u.email}</td>
                  <td className="py-3 px-3 text-xs text-secondary">{u.telefono}</td>
                  <td className="py-3 px-3">
                    <Badge variant={u.estado === 'Activo' ? 'success' : 'gray'} dot>{u.estado}</Badge>
                  </td>
                  <td className="py-3 px-3 text-xs text-secondary">{formatDateTime(u.ultimoAcceso)}</td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-secondary hover:text-brand-600 hover:bg-brand-50 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setDeleteId(u.id)} className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-sm text-muted">No se encontraron usuarios</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={totalItems} itemsPerPage={PER_PAGE} />
      </Card>

      {/* Modal Create/Edit */}
      <Modal
        open={modal !== null} onClose={() => setModal(null)}
        title={modal === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button>
            <Button onClick={handleSubmit}>{modal === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Nombre completo" value={form.nombre} onChange={e => f('nombre', e.target.value)}
            error={errors.nombre} placeholder="Ej. Juan Pérez" />
          <Input label="Email" type="email" value={form.email} onChange={e => f('email', e.target.value)}
            error={errors.email} placeholder="usuario@empresa.mx" />
          <Input label="Teléfono" value={form.telefono} onChange={e => f('telefono', e.target.value)}
            placeholder="555-0100" />
          <Select label="Rol" options={ROLES.map(r => ({ value: r, label: r }))} value={form.rol}
            onChange={e => f('rol', e.target.value)} />
          <Select label="Estado" options={[{ value: 'Activo', label: 'Activo' }, { value: 'Inactivo', label: 'Inactivo' }]}
            value={form.estado} onChange={e => f('estado', e.target.value)} />
        </div>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={deleteId !== null} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Eliminar usuario"
        message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
      />
    </div>
  );
}
