'use client';
import { useState, useEffect } from 'react';
import { configuracionService } from '@/lib/services/configuracion';
import { extractErrorMessage, extractFieldErrors } from '@/lib/services/api';
import { useToast } from '@/components/ui/Toast';
import EmpresaForm, { EmpresaFormValues } from '@/components/configuracion/EmpresaForm';
import { Building2, Loader2, AlertCircle } from 'lucide-react';

const emptyForm: EmpresaFormValues = {
  nombre_empresa: '', direccion: '', telefono: '', email: '', rfc: '',
};

export default function ConfiguracionEmpresaPage() {
  const toast = useToast();
  const [form, setForm] = useState<EmpresaFormValues>(emptyForm);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [subiendoLogo, setSubiendoLogo] = useState(false);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const config = await configuracionService.obtener();
      setForm({
        nombre_empresa: config.nombre_empresa || '',
        direccion: config.direccion || '',
        telefono: config.telefono || '',
        email: config.email || '',
        rfc: config.rfc || '',
      });
      setLogoUrl(config.logo_path || null);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'No se pudo cargar la configuración de la empresa.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleChange = (field: keyof EmpresaFormValues, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre_empresa.trim()) e.nombre_empresa = 'El nombre de la empresa es requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await configuracionService.actualizar(form);
      toast.success('Configuración guardada', 'Los datos de la empresa se actualizaron correctamente.');
    } catch (err: any) {
      setErrors(prev => ({ ...prev, ...extractFieldErrors(err) }));
      toast.error('Error', extractErrorMessage(err, 'No se pudo guardar la configuración.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogoSelect = async (file: File) => {
    setSubiendoLogo(true);
    try {
      const config = await configuracionService.subirLogo(file);
      setLogoUrl(config.logo_path || null);
      toast.success('Logo actualizado', 'El logo se subió correctamente.');
    } catch (err: any) {
      toast.error('Error', extractErrorMessage(err, 'No se pudo subir el logo.'));
    } finally {
      setSubiendoLogo(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-sigo-primary" />
        <p className="text-sm text-muted">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Building2 className="text-sigo-primary" size={26} /> Configuración de la Empresa
        </h1>
        <p className="text-sm text-muted">Información general que se muestra en reportes y documentos</p>
      </div>

      {error ? (
        <div className="py-12 text-center space-y-3">
          <AlertCircle className="text-red-500 mx-auto" size={36} />
          <p className="text-sm font-medium text-red-500">{error}</p>
          <button onClick={cargar} className="text-sm text-sigo-primary hover:underline font-medium">Reintentar</button>
        </div>
      ) : (
        <EmpresaForm
          values={form}
          errors={errors}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          logoUrl={logoUrl}
          onLogoSelect={handleLogoSelect}
          subiendoLogo={subiendoLogo}
        />
      )}
    </div>
  );
}
