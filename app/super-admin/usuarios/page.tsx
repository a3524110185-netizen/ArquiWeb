'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Search, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function UsuariosGlobalPage() {
  const { usuarios, empresas, deleteUsuario } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [empresaFilter, setEmpresaFilter] = useState('Todas');
  const toast = useToast();

  const filteredUsuarios = usuarios.filter(u => {
    const matchesSearch = u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmpresa = empresaFilter === 'Todas' || u.empresaId === empresaFilter;
    return matchesSearch && matchesEmpresa;
  });

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      deleteUsuario(id);
      toast.success('Usuario eliminado', 'El usuario ha sido eliminado correctamente.');
    }
  };

  const resetPassword = (email: string) => {
    toast.info('Contraseña restablecida', `Se ha enviado un correo a ${email} con la nueva contraseña.`);
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            className="input-base pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="input-base md:w-64"
          value={empresaFilter}
          onChange={e => setEmpresaFilter(e.target.value)}
        >
          <option value="Todas">Todas las Empresas</option>
          {empresas.map(e => (
            <option key={e.id} value={e.id}>{e.nombre}</option>
          ))}
        </select>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-app text-secondary uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Usuario</th>
                <th className="px-6 py-4 font-semibold">Empresa</th>
                <th className="px-6 py-4 font-semibold">Rol</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y border-default">
              {filteredUsuarios.map((u) => (
                <tr key={u.id} className="hover:bg-app transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full gradient-brand text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {u.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-primary">{u.nombre}</div>
                        <div className="text-muted text-xs">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-secondary">
                    {u.empresaNombre || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-secondary">{u.rol}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={u.estado === 'Activo' ? 'success' : 'gray'}>
                      {u.estado}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => resetPassword(u.email)}>
                        Reset PW
                      </Button>
                      <button onClick={() => handleDelete(u.id)} className="p-2 text-secondary hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsuarios.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-secondary">
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
