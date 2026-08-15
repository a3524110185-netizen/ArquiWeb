'use client';
import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { usuariosService } from '@/lib/services/usuarios';
import { extractErrorMessage, extractFieldErrors } from '@/lib/services/api';
import { useToast } from '@/components/ui/Toast';
import PerfilForm, { PerfilFormValues } from '@/components/perfil/PerfilForm';
import { UserCircle } from 'lucide-react';

export default function PerfilPage() {
  const { currentUser, updateCurrentUser } = useAuthStore();
  const toast = useToast();

  const [form, setForm] = useState<PerfilFormValues>({
    nombre: currentUser?.nombre || '',
    email: currentUser?.email || '',
    telefono: currentUser?.telefono || '',
  });
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(currentUser?.foto_perfil || null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof PerfilFormValues, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleFotoSelect = (file: File) => {
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Email inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    if (!validate()) return;
    setSubmitting(true);
    try {
      const actualizado = await usuariosService.updateUsuario(currentUser.id, {
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        foto_perfil: fotoFile || undefined,
      });
      updateCurrentUser({
        nombre: actualizado.nombre,
        email: actualizado.email,
        telefono: actualizado.telefono || '',
        foto_perfil: actualizado.foto_perfil || null,
      });
      setFotoFile(null);
      toast.success('Perfil actualizado', 'Tus datos se guardaron correctamente.');
    } catch (err: any) {
      setErrors(prev => ({ ...prev, ...extractFieldErrors(err) }));
      toast.error('Error', extractErrorMessage(err, 'No se pudo actualizar el perfil.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <UserCircle className="text-sigo-primary" size={26} /> Mi Perfil
        </h1>
        <p className="text-sm text-muted">Consulta y edita tu información personal</p>
      </div>

      <PerfilForm
        values={form}
        errors={errors}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitting={submitting}
        fotoPreview={fotoPreview}
        onFotoSelect={handleFotoSelect}
        rol={currentUser?.rol?.nombre || ''}
        departamento={currentUser?.departamento?.nombre || ''}
        empresa={currentUser?.empresa_actual?.nombre || ''}
      />
    </div>
  );
}
