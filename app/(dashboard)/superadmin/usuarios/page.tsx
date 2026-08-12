'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { superadminService, UsuarioSuperAdminApi } from '@/lib/services/superadmin';
import { usuariosService, RolApi } from '@/lib/services/usuarios';
import type { EmpresaApi } from '@/types';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge, { rolVariant } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Select } from '@/components/ui/FormFields';
import { useToast } from '@/components/ui/Toast';
import { Search, Power, UserCog, Loader2, AlertCircle, Users } from 'lucide-react';

const capitalizar = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '—');

export default function SuperadminUsuariosPage() {
  const toast = useToast();

  const [usuarios, setUsuarios] = useState<UsuarioSuperAdminApi[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaApi[]>([]);
  const [roles, setRoles] = useState<RolApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');

  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rolModalUser, setRolModalUser] = useState<UsuarioSuperAdminApi | null>(null);
  const [selectedRolId, setSelectedRolId] = useState('');
  const [cambiandoRol, setCambiandoRol] = useState(false);

  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await superadminService.getUsuarios({ empresa_id: filterEmpresa || undefined });
      setUsuarios(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  }, [filterEmpresa]);

  useEffect(() => { cargarUsuarios(); }, [cargarUsuarios]);

  useEffect(() => {
    superadminService.getEmpresas().then(setEmpresas).catch(() => {});
    usuariosService.getRoles().then(setRoles).catch(() => {});
  }, []);

  const filtered = useMemo(() => usuarios.filter((u) => {
    const q = search.toLowerCase();
    return u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  }), [usuarios, search]);

  const handleToggleEstado = async (u: UsuarioSuperAdminApi) => {
    setProcessingId(u.id);
    try {
      await superadminService.toggleUsuarioEstado(u.id);
      toast.success(u.activo ? 'Usuario desactivado' : 'Usuario activado');
      cargarUsuarios();
    } catch (err: any) {
      toast.error('Error', err.message || 'No se pudo cambiar el estado del usuario');
    } finally {
      setProcessingId(null);
    }
  };

  const openRolModal = (u: UsuarioSuperAdminApi) => {
    setSelectedRolId(String(u.rol?.id ?? u.rol_id ?? ''));
    setRolModalUser(u);
  };

  const handleCambiarRol = async () => {
    if (!rolModalUser || !selectedRolId) return;
    setCambiandoRol(true);
    try {
      await superadminService.cambiarRol(rolModalUser.id, selectedRolId);
      toast.success('Rol actualizado correctamente');
      setRolModalUser(null);
      cargarUsuarios();
    } catch (err: any) {
      toast.error('Error', err.message || 'No se pudo cambiar el rol');
    } finally {
      setCambiandoRol(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Usuarios Globales</CardTitle>
        </CardHeader>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input-base pl-9" placeholder="Buscar por nombre o email..." value={search}
              onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select
            options={[{ value: '', label: 'Todas las empresas' }, ...empresas.map((e) => ({ value: String(e.id), label: e.nombre }))]}
            value={filterEmpresa} onChange={(e) => setFilterEmpresa(e.target.value)}
            className="sm:w-56"
          />
        </div>

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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default">
                  {['Usuario', 'Email', 'Empresa', 'Rol', 'Estado', ''].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-default last:border-0 hover:bg-app transition-colors">
                    <td className="py-3 pl-0 px-3 text-xs font-medium text-primary">{u.nombre}</td>
                    <td className="py-3 px-3 text-xs text-secondary max-w-[200px] truncate">{u.email}</td>
                    <td className="py-3 px-3 text-xs text-secondary">{u.empresa?.nombre || '—'}</td>
                    <td className="py-3 px-3"><Badge variant={rolVariant(capitalizar(u.rol?.nombre))}>{capitalizar(u.rol?.nombre)}</Badge></td>
                    <td className="py-3 px-3">
                      <Badge variant={u.activo ? 'success' : 'gray'} dot>{u.activo ? 'Activo' : 'Inactivo'}</Badge>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1">
                        <button onClick={() => openRolModal(u)}
                          title="Cambiar rol"
                          className="p-1.5 rounded-lg text-secondary hover:text-brand-600 hover:bg-brand-50 transition-colors">
                          <UserCog size={14} />
                        </button>
                        <button onClick={() => handleToggleEstado(u)} disabled={processingId === u.id}
                          title={u.activo ? 'Desactivar' : 'Activar'}
                          className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
                          {processingId === u.id ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
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
        )}
      </Card>

      {/* Modal Cambiar Rol */}
      <Modal
        open={rolModalUser !== null}
        onClose={() => setRolModalUser(null)}
        title="Cambiar Rol de Usuario"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRolModalUser(null)} disabled={cambiandoRol}>Cancelar</Button>
            <Button onClick={handleCambiarRol} loading={cambiandoRol} disabled={!selectedRolId}>Guardar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary">
            Selecciona el nuevo rol para <span className="font-semibold text-primary">{rolModalUser?.nombre}</span>.
          </p>
          <Select
            label="Rol"
            options={roles.map((r) => ({ value: String(r.id), label: capitalizar(r.nombre) }))}
            value={selectedRolId}
            onChange={(e) => setSelectedRolId(e.target.value)}
            placeholder="Selecciona un rol"
          />
        </div>
      </Modal>
    </div>
  );
}
