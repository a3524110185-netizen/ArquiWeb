'use client';
import { Input } from '@/components/ui/FormFields';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { UploadCloud, User } from 'lucide-react';

export interface PerfilFormValues {
  nombre: string;
  email: string;
  telefono: string;
}

interface PerfilFormProps {
  values: PerfilFormValues;
  errors: Record<string, string>;
  onChange: (field: keyof PerfilFormValues, value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  fotoPreview?: string | null;
  onFotoSelect: (file: File) => void;
  rol: string;
  departamento: string;
  empresa: string;
}

export default function PerfilForm({
  values, errors, onChange, onSubmit, submitting, fotoPreview, onFotoSelect, rol, departamento, empresa,
}: PerfilFormProps) {
  const toast = useToast();

  const handleFotoFile = (file: File | null) => {
    if (!file) return;
    if (!/\.(png|jpe?g|webp)$/i.test(file.name)) {
      toast.error('Archivo no válido', 'Solo se aceptan PNG, JPG o WEBP');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Archivo muy grande', 'La foto no debe superar 3MB');
      return;
    }
    onFotoSelect(file);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Foto de perfil</CardTitle></CardHeader>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-20 h-20 rounded-full border border-default bg-app flex items-center justify-center overflow-hidden shrink-0">
            {fotoPreview ? (
              <img src={fotoPreview} alt="Foto de perfil" className="w-full h-full object-cover" />
            ) : (
              <User size={28} className="text-muted" />
            )}
          </div>
          <label className="w-full sm:flex-1 border-2 border-dashed border-default hover:border-sigo-primary rounded-xl p-4 text-center cursor-pointer transition-colors bg-app">
            <UploadCloud size={20} className="mx-auto text-muted mb-1" />
            <span className="text-xs font-medium text-secondary block">Haz clic para cambiar tu foto</span>
            <span className="text-[10px] text-muted block mt-0.5">PNG, JPG o WEBP (máx. 3MB)</span>
            <input
              type="file" accept=".png,.jpg,.jpeg,.webp" className="hidden"
              onChange={e => handleFotoFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Datos personales</CardTitle></CardHeader>
        <div className="space-y-4">
          <Input
            label="Nombre completo" required value={values.nombre}
            onChange={e => onChange('nombre', e.target.value)} error={errors.nombre}
          />
          <Input
            label="Email" type="email" required value={values.email}
            onChange={e => onChange('email', e.target.value)} error={errors.email}
          />
          <Input
            label="Teléfono" value={values.telefono}
            onChange={e => onChange('telefono', e.target.value)} error={errors.telefono}
          />
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Información de la cuenta</CardTitle></CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Rol</p>
            <p className="font-medium text-primary capitalize">{rol || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Departamento</p>
            <p className="font-medium text-primary">{departamento || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Empresa</p>
            <p className="font-medium text-primary">{empresa || '—'}</p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onSubmit} loading={submitting}>Guardar Cambios</Button>
      </div>
    </div>
  );
}
