'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { empresasService } from '@/lib/services/empresas';
import { ApiError } from '@/lib/services/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/FormFields';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, Save, Building2, Loader2 } from 'lucide-react';

export default function NuevaEmpresaPage() {
  const router = useRouter();
  const toast = useToast();

  const [nombre, setNombre] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [rfc, setRfc] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!razonSocial.trim()) e.razon_social = 'La razón social es requerida';
    if (email && !email.includes('@')) e.email = 'Email inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await empresasService.crearEmpresa({ nombre, razon_social: razonSocial, rfc, direccion, telefono, email });
      toast.success('Empresa creada', `${nombre} se agregó exitosamente`);
      router.push('/superadmin/empresas');
    } catch (err: any) {
      if (err instanceof ApiError && err.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(err.data.errors as Record<string, string[]>).forEach(([field, msgs]) => {
          fieldErrors[field] = msgs[0];
        });
        setErrors(fieldErrors);
      }
      toast.error('Error al guardar', err.message || 'No se pudo crear la empresa');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/superadmin/empresas"
          className="p-2 rounded-xl border border-default bg-card text-secondary hover:text-primary hover:bg-app transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-primary">Nueva Empresa</h1>
          <p className="text-sm text-muted">Registra una nueva empresa en la plataforma</p>
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
          <Input label="Razón Social" required value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)}
            error={errors.razon_social} placeholder="Ej. Constructora del Norte S.A. de C.V." />
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
          <Link href="/superadmin/empresas" className="btn-secondary">Cancelar</Link>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Crear Empresa</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
