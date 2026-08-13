'use client';

import { useState, useEffect } from 'react';
import Modal, { ConfirmDialog } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { proyectosService, UsuarioProyecto } from '@/lib/services/proyectos';
import { Loader2, Plus, Trash2, ShieldCheck, HardHat, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface GestionarEquipoModalProps {
  open: boolean;
  onClose: () => void;
  proyectoId: number;
  usuariosActuales: UsuarioProyecto[];
  onUpdate: () => void;
}

export default function GestionarEquipoModal({
  open,
  onClose,
  proyectoId,
  usuariosActuales,
  onUpdate
}: GestionarEquipoModalProps) {
  const [disponibles, setDisponibles] = useState<UsuarioProyecto[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [asignandoTodos, setAsignandoTodos] = useState(false);
  const [confirmMasivoOpen, setConfirmMasivoOpen] = useState(false);

  const [selectedRol, setSelectedRol] = useState<'supervisor' | 'ingeniero'>('supervisor');
  const [selectedUsuarioId, setSelectedUsuarioId] = useState<string>('');

  useEffect(() => {
    if (open) {
      cargarDisponibles(selectedRol);
    }
  }, [open, selectedRol, proyectoId]);

  const cargarDisponibles = async (rol: 'supervisor' | 'ingeniero') => {
    setLoading(true);
    try {
      const data = await proyectosService.getUsuariosDisponibles(proyectoId, rol);
      setDisponibles(data);
    } catch (error: any) {
      toast.error('Error al cargar usuarios disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleAsignar = async () => {
    if (!selectedUsuarioId) return;
    setAdding(true);
    try {
      await proyectosService.asignarUsuario(proyectoId, selectedUsuarioId, selectedRol);
      toast.success('Usuario asignado correctamente');
      setSelectedUsuarioId('');
      onUpdate();
      cargarDisponibles(selectedRol); // Reload list
    } catch (error: any) {
      toast.error(error.message || 'Error al asignar usuario');
    } finally {
      setAdding(false);
    }
  };

  const handleRemover = async (usuarioId: number) => {
    setRemovingId(usuarioId);
    try {
      await proyectosService.removerUsuario(proyectoId, usuarioId);
      toast.success('Usuario removido correctamente');
      onUpdate();
      cargarDisponibles(selectedRol); // Reload list
    } catch (error: any) {
      toast.error(error.message || 'Error al remover usuario');
    } finally {
      setRemovingId(null);
    }
  };

  const asignarTodos = async () => {
    if (disponibles.length === 0) return;
    setAsignandoTodos(true);
    try {
      const usuarioIds = disponibles.map(u => u.id);
      const resultado = await proyectosService.asignarMasivo(proyectoId, usuarioIds, selectedRol);
      const omitidos = resultado.total - resultado.asignados;

      if (omitidos > 0) {
        toast(`${resultado.asignados} asignados, ${omitidos} omitidos`, { icon: '⚠️' });
      } else {
        toast.success(`${resultado.asignados} usuarios asignados correctamente`);
      }

      onUpdate();
      cargarDisponibles(selectedRol);
    } catch (error: any) {
      toast.error(error.message || 'Error al asignar usuarios');
    } finally {
      setAsignandoTodos(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Gestionar Equipo de Proyecto" size="lg">
      <div className="space-y-6">
        
        {/* Sección de asignación */}
        <div className="p-4 bg-app rounded-xl border border-default space-y-4">
          <h3 className="text-sm font-semibold text-primary">Asignar Nuevo Personal</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              className="form-select flex-1 bg-card text-primary border border-default rounded-lg px-3 py-2"
              value={selectedRol}
              onChange={(e) => {
                setSelectedRol(e.target.value as 'supervisor' | 'ingeniero');
                setSelectedUsuarioId('');
              }}
            >
              <option value="supervisor">Supervisor</option>
              <option value="ingeniero">Ingeniero</option>
            </select>
            
            <select
              className="form-select flex-1 bg-card text-primary border border-default rounded-lg px-3 py-2"
              value={selectedUsuarioId}
              onChange={(e) => setSelectedUsuarioId(e.target.value)}
              disabled={loading}
            >
              <option value="">Seleccionar usuario...</option>
              {disponibles.map(u => (
                <option key={u.id} value={u.id}>{u.nombre}</option>
              ))}
            </select>

            <Button
              onClick={handleAsignar}
              disabled={!selectedUsuarioId || adding}
              className="shrink-0"
            >
              {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              <span className="ml-2">Asignar</span>
            </Button>
          </div>

          {disponibles.length > 0 && (
            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmMasivoOpen(true)}
                disabled={asignandoTodos || loading}
              >
                {asignandoTodos ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />}
                <span className="ml-1.5">Asignar todos ({disponibles.length})</span>
              </Button>
            </div>
          )}
        </div>

        {/* Lista actual */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-3">Personal Asignado ({usuariosActuales.length})</h3>
          
          {usuariosActuales.length === 0 ? (
            <p className="text-sm text-muted py-4 text-center">No hay personal asignado a este proyecto.</p>
          ) : (
            <div className="space-y-2">
              {usuariosActuales.map((usuario) => {
                const rolNombre = usuario.pivot?.rol_proyecto || usuario.rol?.nombre || 'Miembro';
                const isSupervisor = rolNombre.toLowerCase().includes('supervisor');
                const isIngeniero = rolNombre.toLowerCase().includes('ingeniero');
                
                return (
                  <div key={usuario.id} className="flex items-center justify-between p-3 rounded-xl border border-default">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-brand text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {usuario.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary">{usuario.nombre}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {isSupervisor && <ShieldCheck size={12} className="text-amber-500 shrink-0" />}
                          {isIngeniero && <HardHat size={12} className="text-emerald-500 shrink-0" />}
                          <span className="text-xs text-muted capitalize">{rolNombre}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemover(usuario.id)}
                      disabled={removingId === usuario.id}
                      className="px-2"
                      title="Remover"
                    >
                      {removingId === usuario.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      <ConfirmDialog
        open={confirmMasivoOpen}
        onClose={() => setConfirmMasivoOpen(false)}
        onConfirm={asignarTodos}
        title="Asignación masiva"
        message={`¿Deseas asignar los ${disponibles.length} ${selectedRol === 'supervisor' ? 'supervisores' : 'ingenieros'} disponibles a este proyecto?`}
        confirmLabel="Asignar todos"
        variant="primary"
      />
    </Modal>
  );
}
