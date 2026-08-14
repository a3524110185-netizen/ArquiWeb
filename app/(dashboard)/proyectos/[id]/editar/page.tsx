'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { proyectosService, ProyectoApi, Cliente, UsuarioProyecto } from '@/lib/services/proyectos';
import { resolveMediaUrl } from '@/lib/utils';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { 
  ArrowLeft, 
  Save, 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Upload, 
  Loader2,
  Users,
  UserPlus,
  Trash2,
  HardHat,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';
import LocationPicker from '@/components/ui/LocationPicker';

export default function EditarProyectoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const toast = useToast();

  const [loadingProyecto, setLoadingProyecto] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // Personal Asignado y Disponibles
  const [usuariosAsignados, setUsuariosAsignados] = useState<UsuarioProyecto[]>([]);
  const [supervisoresDisponibles, setSupervisoresDisponibles] = useState<UsuarioProyecto[]>([]);
  const [ingenierosDisponibles, setIngenierosDisponibles] = useState<UsuarioProyecto[]>([]);

  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('');
  const [selectedIngeniero, setSelectedIngeniero] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [assigningMasivo, setAssigningMasivo] = useState<'supervisor' | 'ingeniero' | null>(null);

  // Datos Formulario General
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [clienteId, setClienteId] = useState<string>('');
  const [ubicacion, setUbicacion] = useState('');
  const [latitud, setLatitud] = useState<string>('');
  const [longitud, setLongitud] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [presupuesto, setPresupuesto] = useState<string>('');
  const [estado, setEstado] = useState<string>('planeado');
  const [imagenPortada, setImagenPortada] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Cargar Proyecto y Personal
  const loadData = useCallback(async () => {
    setLoadingProyecto(true);
    try {
      const [proyectoData, clientesData] = await Promise.all([
        proyectosService.getProyecto(id),
        proyectosService.getClientes(),
      ]);

      setNombre(proyectoData.nombre || '');
      setDescripcion(proyectoData.descripcion || '');
      setClienteId(proyectoData.cliente_id ? String(proyectoData.cliente_id) : '');
      setUbicacion(proyectoData.ubicacion || '');
      setLatitud(proyectoData.latitud !== null && proyectoData.latitud !== undefined ? String(proyectoData.latitud) : '');
      setLongitud(proyectoData.longitud !== null && proyectoData.longitud !== undefined ? String(proyectoData.longitud) : '');
      setFechaInicio(proyectoData.fecha_inicio ? proyectoData.fecha_inicio.split('T')[0] : '');
      setFechaFin(proyectoData.fecha_fin ? proyectoData.fecha_fin.split('T')[0] : '');
      setPresupuesto(proyectoData.presupuesto !== null && proyectoData.presupuesto !== undefined ? String(proyectoData.presupuesto) : '');
      setEstado(proyectoData.estado || 'planeado');
      if (proyectoData.imagen_portada) {
        setImagePreview(resolveMediaUrl(proyectoData.imagen_portada));
      }

      setClientes(clientesData);
      setUsuariosAsignados(proyectoData.usuarios || []);

      // Cargar disponibles
      loadDisponibles(id);
    } catch (err: any) {
      console.error('Error al obtener proyecto:', err);
      toast.error('Error', err.message || 'No se pudo cargar la información del proyecto');
    } finally {
      setLoadingProyecto(false);
    }
  }, [id]);

  const loadDisponibles = async (proyId: string) => {
    try {
      const [sups, ings] = await Promise.all([
        proyectosService.getUsuariosDisponibles(proyId, 'supervisor'),
        proyectosService.getUsuariosDisponibles(proyId, 'ingeniero'),
      ]);
      setSupervisoresDisponibles(sups);
      setIngenierosDisponibles(ings);
    } catch (err) {
      console.error('Error al obtener usuarios disponibles:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Manejar Imagen Preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagenPortada(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Asignar Usuario (Supervisor o Ingeniero)
  const handleAsignarUsuario = async (usuarioId: string, rol: 'supervisor' | 'ingeniero') => {
    if (!usuarioId) return;
    setAssigning(true);
    try {
      await proyectosService.asignarUsuario(id, usuarioId, rol);
      toast.success('Usuario asignado', `Se asignó el ${rol} correctamente al proyecto`);
      if (rol === 'supervisor') setSelectedSupervisor('');
      if (rol === 'ingeniero') setSelectedIngeniero('');
      
      // Recargar proyecto y lista de usuarios
      const proyectoActualizado = await proyectosService.getProyecto(id);
      setUsuariosAsignados(proyectoActualizado.usuarios || []);
      await loadDisponibles(id);
    } catch (err: any) {
      console.error('Error al asignar usuario:', err);
      toast.error('Error al asignar', err.message || 'No se pudo asignar el usuario');
    } finally {
      setAssigning(false);
    }
  };

  // Asignar todos los disponibles de un rol de una sola vez
  const handleAsignarTodos = async (rol: 'supervisor' | 'ingeniero') => {
    const lista = rol === 'supervisor' ? supervisoresDisponibles : ingenierosDisponibles;
    if (lista.length === 0) return;
    if (!confirm(`¿Deseas asignar los ${lista.length} ${rol === 'supervisor' ? 'supervisores' : 'ingenieros'} disponibles a este proyecto?`)) return;

    setAssigningMasivo(rol);
    try {
      const usuarioIds = lista.map((u) => u.id);
      const resultado = await proyectosService.asignarMasivo(id, usuarioIds, rol);
      const omitidos = resultado.total - resultado.asignados;

      if (omitidos > 0) {
        toast.warning('Asignación parcial', `${resultado.asignados} asignados, ${omitidos} omitidos`);
      } else {
        toast.success('Personal asignado', `${resultado.asignados} usuarios asignados correctamente`);
      }

      const proyectoActualizado = await proyectosService.getProyecto(id);
      setUsuariosAsignados(proyectoActualizado.usuarios || []);
      await loadDisponibles(id);
    } catch (err: any) {
      console.error('Error al asignar usuarios en masa:', err);
      toast.error('Error al asignar', err.message || 'No se pudo completar la asignación masiva');
    } finally {
      setAssigningMasivo(null);
    }
  };

  // Remover Usuario
  const handleRemoverUsuario = async (usuarioId: number) => {
    if (!confirm('¿Estás seguro de remover a este usuario del proyecto?')) return;
    try {
      await proyectosService.removerUsuario(id, usuarioId);
      toast.success('Usuario removido', 'El usuario fue removido del proyecto');
      setUsuariosAsignados((prev) => prev.filter((u) => u.id !== usuarioId));
      await loadDisponibles(id);
    } catch (err: any) {
      console.error('Error al remover usuario:', err);
      toast.error('Error', err.message || 'No se pudo remover al usuario');
    }
  };

  // Guardar datos generales del Proyecto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !ubicacion.trim() || !fechaInicio || !fechaFin) {
      toast.error('Campos incompletos', 'Por favor llena los campos requeridos');
      return;
    }

    setSubmitting(true);
    try {
      await proyectosService.updateProyecto(id, {
        nombre,
        descripcion,
        cliente_id: clienteId ? Number(clienteId) : null,
        ubicacion,
        latitud: latitud ? Number(latitud) : null,
        longitud: longitud ? Number(longitud) : null,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        presupuesto: presupuesto ? Number(presupuesto) : 0,
        estado,
        ...(imagenPortada ? { imagen_portada: imagenPortada } : {}),
      });

      toast.success('Proyecto actualizado', 'Los datos del proyecto han sido guardados');
      router.push(`/proyectos/${id}`);
    } catch (err: any) {
      console.error('Error al actualizar proyecto:', err);
      toast.error('Error al guardar', err.message || 'No se pudieron guardar los cambios');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProyecto) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="animate-spin text-sigo-primary" />
        <p className="text-sm font-medium text-secondary">Cargando proyecto...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/proyectos/${id}`}
            className="p-2 rounded-xl border border-default bg-card text-secondary hover:text-primary hover:bg-app transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary">Editar Proyecto</h1>
            <p className="text-sm text-muted">Actualiza los datos y el personal de la obra</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Datos Generales */}
        <Card className="p-6 space-y-6">
          <CardHeader className="p-0 pb-4 border-b border-default">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 size={18} className="text-sigo-primary" />
              <span>Datos Generales del Proyecto</span>
            </CardTitle>
          </CardHeader>

          {/* Nombre, Cliente, Estado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-secondary mb-1.5">
                Nombre del Proyecto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="input-base font-medium"
              >
                <option value="planeado">Planeado</option>
                <option value="a_tiempo">A Tiempo</option>
                <option value="retrasado">Retrasado</option>
                <option value="critico">Crítico</option>
                <option value="completado">Completado</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-secondary mb-1.5">Cliente</label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="input-base"
              >
                <option value="">-- Sin Cliente --</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">Descripción</label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="input-base resize-none"
            />
          </div>

          {/* Ubicación con Mapa */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <LocationPicker 
                ubicacion={ubicacion} 
                latitud={latitud} 
                longitud={longitud} 
                onChange={(ub, lat, lng) => {
                  setUbicacion(ub);
                  setLatitud(lat !== null ? lat.toString() : '');
                  setLongitud(lng !== null ? lng.toString() : '');
                }} 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">Presupuesto ($ MXN)</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="number"
                  step="0.01"
                  value={presupuesto}
                  onChange={(e) => setPresupuesto(e.target.value)}
                  className="input-base pl-9"
                />
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">
                Fecha de Inicio <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="date"
                  required
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="input-base pl-9"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">
                Fecha Estimada de Fin <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="date"
                  required
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="input-base pl-9"
                />
              </div>
            </div>
          </div>

          {/* Imagen de Portada */}
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">
              Imagen de Portada
            </label>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="w-20 h-20 rounded-xl object-cover border border-default shrink-0"
                />
              )}
              <label className="w-full sm:flex-1 border-2 border-dashed border-default hover:border-sigo-primary rounded-xl p-4 text-center cursor-pointer transition-colors bg-app">
                <Upload size={20} className="mx-auto text-muted mb-1" />
                <span className="text-xs font-medium text-secondary block">
                  {imagenPortada ? imagenPortada.name : 'Cambiar imagen de portada'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </Card>

        {/* Card Asignar Personal */}
        <Card className="p-6 space-y-6">
          <CardHeader className="p-0 pb-4 border-b border-default flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users size={18} className="text-sigo-primary" />
              <span>Asignar Personal al Proyecto</span>
            </CardTitle>
          </CardHeader>

          {/* Selectores de asignación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-app p-4 rounded-xl border border-default">
            {/* Select Supervisor */}
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-amber-500" />
                <span>Asignar Supervisor</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedSupervisor}
                  onChange={(e) => setSelectedSupervisor(e.target.value)}
                  className="input-base text-xs flex-1"
                  disabled={assigning}
                >
                  <option value="">-- Seleccionar Supervisor --</option>
                  {supervisoresDisponibles.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} ({s.email})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleAsignarUsuario(selectedSupervisor, 'supervisor')}
                  disabled={!selectedSupervisor || assigning}
                  className="btn-primary btn-sm px-3 shrink-0"
                >
                  <UserPlus size={14} />
                  <span>Asignar</span>
                </button>
              </div>
              {supervisoresDisponibles.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleAsignarTodos('supervisor')}
                  disabled={assigning || assigningMasivo !== null}
                  className="mt-2 text-xs text-sigo-primary hover:underline font-medium inline-flex items-center gap-1 disabled:opacity-50 disabled:no-underline"
                >
                  {assigningMasivo === 'supervisor' ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Users size={12} />
                  )}
                  Asignar todos los {supervisoresDisponibles.length} disponibles
                </button>
              )}
            </div>

            {/* Select Ingeniero */}
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 flex items-center gap-1.5">
                <HardHat size={14} className="text-emerald-500" />
                <span>Asignar Ingeniero</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedIngeniero}
                  onChange={(e) => setSelectedIngeniero(e.target.value)}
                  className="input-base text-xs flex-1"
                  disabled={assigning}
                >
                  <option value="">-- Seleccionar Ingeniero --</option>
                  {ingenierosDisponibles.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.nombre} ({ing.email})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleAsignarUsuario(selectedIngeniero, 'ingeniero')}
                  disabled={!selectedIngeniero || assigning}
                  className="btn-primary btn-sm px-3 shrink-0"
                >
                  <UserPlus size={14} />
                  <span>Asignar</span>
                </button>
              </div>
              {ingenierosDisponibles.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleAsignarTodos('ingeniero')}
                  disabled={assigning || assigningMasivo !== null}
                  className="mt-2 text-xs text-sigo-primary hover:underline font-medium inline-flex items-center gap-1 disabled:opacity-50 disabled:no-underline"
                >
                  {assigningMasivo === 'ingeniero' ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Users size={12} />
                  )}
                  Asignar todos los {ingenierosDisponibles.length} disponibles
                </button>
              )}
            </div>
          </div>

          {/* Lista de Personal Asignado */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
              Personal Asignado Actual ({usuariosAsignados.length})
            </h4>

            {usuariosAsignados.length === 0 ? (
              <p className="text-xs text-muted italic p-3 text-center border border-dashed border-default rounded-xl">
                No hay supervisores o ingenieros asignados a este proyecto aún.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {usuariosAsignados.map((u) => {
                  const rolNombre = u.pivot?.rol_proyecto || u.rol?.nombre || 'Miembro';
                  return (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-default bg-card hover:bg-app transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full gradient-brand text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {u.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-primary truncate">{u.nombre}</p>
                          <p className="text-[10px] text-muted capitalize truncate">
                            {rolNombre} • {u.email}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoverUsuario(u.id)}
                        className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors shrink-0"
                        title="Remover de proyecto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3">
          <Link href={`/proyectos/${id}`} className="btn-secondary">
            Cancelar
          </Link>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
