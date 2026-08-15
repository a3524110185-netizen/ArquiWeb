'use client';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/FormFields';
import { useToast } from '@/components/ui/Toast';
import { UploadCloud, Loader2 } from 'lucide-react';

export interface EmpresaFormValues {
  nombre_empresa: string;
  direccion: string;
  telefono: string;
  email: string;
  rfc: string;
}

interface EmpresaFormProps {
  values: EmpresaFormValues;
  errors: Record<string, string>;
  onChange: (field: keyof EmpresaFormValues, value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  logoUrl?: string | null;
  onLogoSelect: (file: File) => void;
  subiendoLogo: boolean;
}

export default function EmpresaForm({
  values, errors, onChange, onSubmit, submitting, logoUrl, onLogoSelect, subiendoLogo,
}: EmpresaFormProps) {
  const toast = useToast();

  const handleLogoFile = (file: File | null) => {
    if (!file) return;
    if (!/\.(png|jpe?g|svg|webp)$/i.test(file.name)) {
      toast.error('Archivo no válido', 'Solo se aceptan PNG, JPG, SVG o WEBP');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Archivo muy grande', 'El logo no debe superar 2MB');
      return;
    }
    onLogoSelect(file);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Logo de la empresa</CardTitle></CardHeader>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-20 h-20 rounded-xl border border-default bg-app flex items-center justify-center overflow-hidden shrink-0">
            {subiendoLogo ? (
              <Loader2 size={20} className="animate-spin text-sigo-primary" />
            ) : logoUrl ? (
              <img src={logoUrl} alt="Logo de la empresa" className="w-full h-full object-contain" />
            ) : (
              <UploadCloud size={24} className="text-muted" />
            )}
          </div>
          <label className="w-full sm:flex-1 border-2 border-dashed border-default hover:border-sigo-primary rounded-xl p-4 text-center cursor-pointer transition-colors bg-app">
            <UploadCloud size={20} className="mx-auto text-muted mb-1" />
            <span className="text-xs font-medium text-secondary block">Haz clic para seleccionar un logo</span>
            <span className="text-[10px] text-muted block mt-0.5">PNG, JPG, SVG o WEBP (máx. 2MB)</span>
            <input
              type="file" accept=".png,.jpg,.jpeg,.svg,.webp" className="hidden"
              onChange={e => handleLogoFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Datos de la empresa</CardTitle></CardHeader>
        <div className="space-y-4">
          <Input
            label="Nombre de la empresa" required value={values.nombre_empresa}
            onChange={e => onChange('nombre_empresa', e.target.value)} error={errors.nombre_empresa}
            placeholder="Ej. Constructora ABC"
          />
          <Input
            label="Dirección" value={values.direccion}
            onChange={e => onChange('direccion', e.target.value)} error={errors.direccion}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Teléfono" value={values.telefono}
              onChange={e => onChange('telefono', e.target.value)} error={errors.telefono}
            />
            <Input
              label="Email" type="email" value={values.email}
              onChange={e => onChange('email', e.target.value)} error={errors.email}
            />
          </div>
          <Input
            label="RFC" value={values.rfc}
            onChange={e => onChange('rfc', e.target.value)} error={errors.rfc}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onSubmit} loading={submitting}>Guardar Cambios</Button>
      </div>
    </div>
  );
}
