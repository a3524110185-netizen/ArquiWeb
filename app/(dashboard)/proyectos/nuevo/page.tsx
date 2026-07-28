'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { proyectosService, Cliente } from '@/lib/services/proyectos';
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
  Loader2 
} from 'lucide-react';
import Link from 'next/link';
import LocationPicker from '@/components/ui/LocationPicker';

export default function NuevoProyectoPage() {
  const router = useRouter();
  const toast = useToast();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [clienteId, setClienteId] = useState<string>('');
  const [ubicacion, setUbicacion] = useState('');
  const [latitud, setLatitud] = useState<string>('');
  const [longitud, setLongitud] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [presupuesto, setPresupuesto] = useState<string>('');
  const [imagenPortada, setImagenPortada] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    async function loadClientes() {
      try {
        const data = await proyectosService.getClientes();
        setClientes(data);
      } catch (err) {
        console.error('Error cargando clientes:', err);
        toast.error('Error', 'No se pudieron cargar los clientes');
      } finally {
        setLoadingClientes(false);
      }
    }
    loadClientes();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagenPortada(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !ubicacion.trim() || !fechaInicio || !fechaFin) {
      toast.error('Campos incompletos', 'Por favor llena los campos requeridos');
      return;
    }

    setSubmitting(true);
    try {
      await proyectosService.createProyecto({
        nombre,
        descripcion,
        cliente_id: clienteId ? Number(clienteId) : null,
        ubicacion,
        latitud: latitud ? Number(latitud) : null,
        longitud: longitud ? Number(longitud) : null,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        presupuesto: presupuesto ? Number(presupuesto) : 0,
        imagen_portada: imagenPortada,
      });

      toast.success('Éxito', 'Proyecto creado correctamente');
      router.push('/proyectos');
    } catch (err: any) {
      console.error('Error al crear proyecto:', err);
      toast.error('Error al guardar', err.message || 'No se pudo crear el proyecto');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button & title */}
      <div className="flex items-center gap-4">
        <Link
          href="/proyectos"
          className="p-2 rounded-xl border border-default bg-card text-secondary hover:text-primary hover:bg-app transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-primary">Nuevo Proyecto</h1>
          <p className="text-sm text-muted">Ingresa los datos generales para crear la obra</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-6">
          <CardHeader className="p-0 pb-4 border-b border-default">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 size={18} className="text-brand-600" />
              <span>Datos Generales</span>
            </CardTitle>
          </CardHeader>

          {/* Nombre y Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">
                Nombre del Proyecto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Torre Residencial Palmas"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">
                Cliente
              </label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="input-base"
                disabled={loadingClientes}
              >
                <option value="">-- Seleccionar Cliente --</option>
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
            <label className="block text-xs font-semibold text-secondary mb-1.5">
              Descripción
            </label>
            <textarea
              rows={3}
              placeholder="Detalles u objetivos principales del proyecto..."
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
              <label className="block text-xs font-semibold text-secondary mb-1.5">
                Presupuesto ($ MXN)
              </label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
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
              <label className="w-full sm:flex-1 border-2 border-dashed border-default hover:border-brand-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-app">
                <Upload size={20} className="mx-auto text-muted mb-1" />
                <span className="text-xs font-medium text-secondary block">
                  {imagenPortada ? imagenPortada.name : 'Haz clic para seleccionar o arrastra una imagen'}
                </span>
                <span className="text-[10px] text-muted block mt-0.5">JPG, PNG o WEBP</span>
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

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/proyectos" className="btn-secondary">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Crear Proyecto</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
