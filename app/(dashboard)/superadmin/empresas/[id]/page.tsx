'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { superadminService, UsuarioSuperAdminApi } from '@/lib/services/superadmin';
import type { EmpresaApi } from '@/types';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Select } from '@/components/ui/FormFields';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft, Edit2, Power, Building2, Mail, Phone, MapPin,
  FileText, Users, Loader2, AlertCircle, ShieldCheck, UserCog,
} from 'lucide-react';

export default function SuperadminEmpresaDetallePage() {
  const params = useParams();
  const id = params.id as string;
  const toast = useToast();

  const [empresa, setEmpresa] = useState<EmpresaApi | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioSuperAdminApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [selectedUsuarioId, setSelectedUsuarioId] = useState('');
  const [asignando, setAsignando] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setLoadingUsuarios(true);
    setError(null);
    try {
      const empresaData = await superadminService.getEmpresa(id);
      setEmpresa(empresaData);
      setLoading(false);

      const usuariosData = await superadminService.getUsuariosPorEmpresa(id);
      setUsuarios(usuariosData);
    } catch (err: any) {
      setError(err.message || 'No se pudo cargar la empresa.');
    } finally {
      setLoading(false);
      setLoadingUsuarios(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleToggleEstado = async () => {
    if (!empresa) return;
    setToggling(true);
    try {
      await superadminService.toggleEmpresaEstado(empresa.id);
      toast.success(empresa.activo ? 'Empresa desactivada' : 'Empresa activada');
      fetchAll();
    } catch (err: any) {
      toast.error('Error', err.message || 'No se pudo cambiar el estado');
    } finally {
      setToggling(false);
    }
  };

  const openAdminModal = () => { setSelectedUsuarioId(''); setAdminModalOpen(true); };

  const handleAsignarAdmin = async () => {
    if (!empresa || !selectedUsuarioId) return;
    setAsignando(true);
    try {
      await superadminService.asignarAdmin(empresa.id, selectedUsuarioId);
      toast.success('Administrador asignado correctamente');
      setAdminModalOpen(false);
      fetchAll();
    } catch (err: any) {
      toast.error('Error', err.message || 'No se pudo asignar el administrador');
    } finally {
      setAsignando(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="animate-spin text-brand-600" />
        <p className="text-sm font-medium text-secondary">Cargando empresa...</p>
      </div>
    );
  }

  if (error || !empresa) {
    return (
      <div className="max-w-xl mx-auto my-12">
        <Card className="p-8 text-center space-y-4 border-red-200 dark:border-red-900/30">
          <AlertCircle className="text-red-500 mx-auto" size={28} />
          <h2 className="text-lg font-bold text-primary">Empresa no encontrada</h2>
          <p className="text-sm text-muted">{error || 'La empresa no existe.'}</p>
          <Link href="/superadmin/empresas" className="btn-secondary inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Volver a lista
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link href="/superadmin/empresas" className="btn-secondary inline-flex items-center gap-2 text-xs">
          <ArrowLeft size={16} /> Volver a lista
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/superadmin/empresas/${empresa.id}/editar`} className="btn-secondary inline-flex items-center gap-2 text-xs">
            <Edit2 size={16} /> Editar
          </Link>
          <Button variant={empresa.activo ? 'danger' : 'success'} size="sm" onClick={handleToggleEstado} loading={toggling}>
            <Power size={14} /> {empresa.activo ? 'Desactivar' : 'Activar'}
          </Button>
        </div>
      </div>

      {/* Info general */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-brand text-white flex items-center justify-center shrink-0 shadow-sm">
            <Building2 size={30} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-primary">{empresa.nombre}</h1>
              <Badge variant={empresa.activo ? 'success' : 'gray'} dot>{empresa.activo ? 'Activa' : 'Inactiva'}</Badge>
            </div>
            <p className="text-xs text-muted mt-1">Registrada el {formatDate(empresa.created_at)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-default">
          <div className="flex items-center gap-2 text-sm text-secondary">
            <FileText size={16} className="text-brand-500 shrink-0" /> RFC: {empresa.rfc || '—'}
          </div>
          <div className="flex items-center gap-2 text-sm text-secondary">
            <Mail size={16} className="text-brand-500 shrink-0" /> {empresa.email || '—'}
          </div>
          <div className="flex items-center gap-2 text-sm text-secondary">
            <Phone size={16} className="text-brand-500 shrink-0" /> {empresa.telefono || '—'}
          </div>
          <div className="flex items-center gap-2 text-sm text-secondary">
            <MapPin size={16} className="text-brand-500 shrink-0" /> {empresa.direccion || '—'}
          </div>
        </div>
      </Card>

      {/* Usuarios de la empresa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={18} className="text-brand-600" /> Usuarios de la Empresa
          </CardTitle>
          <Button size="sm" onClick={openAdminModal}>
            <ShieldCheck size={14} /> Asignar Administrador
          </Button>
        </CardHeader>

        {loadingUsuarios ? (
          <div className="py-10 flex justify-center"><Loader2 size={24} className="animate-spin text-muted" /></div>
        ) : usuarios.length === 0 ? (
          <p className="text-sm text-muted text-center py-10">Esta empresa no tiene usuarios registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default">
                  {['Usuario', 'Email', 'Rol', 'Estado'].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-default last:border-0 hover:bg-app transition-colors">
                    <td className="py-3 pl-0 px-3 text-xs font-medium text-primary">{u.nombre}</td>
                    <td className="py-3 px-3 text-xs text-secondary">{u.email}</td>
                    <td className="py-3 px-3 text-xs text-secondary capitalize">{u.rol?.nombre || '—'}</td>
                    <td className="py-3 px-3">
                      <Badge variant={u.activo ? 'success' : 'gray'} dot>{u.activo ? 'Activo' : 'Inactivo'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Asignar Admin */}
      <Modal
        open={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        title="Asignar Administrador"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAdminModalOpen(false)} disabled={asignando}>Cancelar</Button>
            <Button onClick={handleAsignarAdmin} loading={asignando} disabled={!selectedUsuarioId}>Asignar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary flex items-start gap-2">
            <UserCog size={16} className="text-brand-500 shrink-0 mt-0.5" />
            Selecciona un usuario de esta empresa para asignarlo como administrador.
          </p>
          <Select
            label="Usuario"
            options={usuarios.map((u) => ({ value: String(u.id), label: `${u.nombre} (${u.email})` }))}
            value={selectedUsuarioId}
            onChange={(e) => setSelectedUsuarioId(e.target.value)}
            placeholder="Selecciona un usuario"
          />
        </div>
      </Modal>
    </div>
  );
}
