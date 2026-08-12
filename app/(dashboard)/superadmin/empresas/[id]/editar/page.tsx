'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { superadminService } from '@/lib/services/superadmin';
import { ApiError } from '@/lib/services/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/FormFields';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, Save, Building2, Loader2, AlertCircle } from 'lucide-react';

export default function EditarEmpresaPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState('');
  const [rfc, setRfc] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function cargar() {
      setLoading(true);
      setError(null);
      try {
        const empresa = await superadminService.getEmpresa(id);
        setNombre(empresa.nombre);
        setRfc(empresa.rfc || '');
        setDireccion(empresa.direccion || '');
        setTelefono(empresa.telefono || '');
        setEmail(empresa.email || '');
      } catch (err: any) {
        setError(err.message || 'No se pudo cargar la empresa.');
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, [id]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!nombre.trim()) e.nombre = 'El nombre es requerido';
    if (email && !email.includes('@')) e.email = 'Email inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await superadminService.updateEmpresa(id, { nombre, rfc, direccion, telefono, email });
      toast.success('Empresa actualizada correctamente');
      router.push(`/superadmin/empresas/${id}`);
    } catch (err: any) {
      if (err instanceof ApiError && err.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(err.data.errors as Record<string, string[]>).forEach(([field, msgs]) => {
          fieldErrors[field] = msgs[0];
        });
        setErrors(fieldErrors);
      }
      toast.error('Error al guardar', err.message || 'No se pudo actualizar la empresa');
    } finally {
      setSubmitting(false);
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

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-12">
        <Card className="p-8 text-center space-y-4 border-red-200 dark:border-red-900/30">
          <AlertCircle className="text-red-500 mx-auto" size={28} />
          <p className="text-sm text-muted">{error}</p>
          <Link href="/superadmin/empresas" className="btn-secondary inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Volver a lista
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/superadmin/empresas/${id}`}
          className="p-2 rounded-xl border border-default bg-card text-secondary hover:text-primary hover:bg-app transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-primary">Editar Empresa</h1>
          <p className="text-sm text-muted">Actualiza los datos de la empresa</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <CardHeader className="p-0 pb-4 border-b border-default">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 size={18} className="text-brand-600" />
              <span>Datos de la Empresa</span>
            </CardTitle>
          </CardHeader>

          <Input label="Nombre" required value={nombre} onChange={(e) => setNombre(e.target.value)}
            error={errors.nombre} placeholder="Ej. Constructora del Norte" />
          <Input label="RFC" value={rfc} onChange={(e) => setRfc(e.target.value)}
            error={errors.rfc} placeholder="ABC123456XYZ" />
          <Input label="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)}
            error={errors.direccion} placeholder="Calle, número, colonia, ciudad" />
          <Input label="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)}
            error={errors.telefono} placeholder="555-0100" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            error={errors.email} placeholder="contacto@empresa.mx" />
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link href={`/superadmin/empresas/${id}`} className="btn-secondary">Cancelar</Link>
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
