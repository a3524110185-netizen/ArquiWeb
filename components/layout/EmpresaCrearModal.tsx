'use client';
import { useState } from 'react';
import { empresasService, EmpresaFormInput } from '@/lib/services/empresas';
import { extractErrorMessage, extractFieldErrors } from '@/lib/services/api';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/FormFields';

interface EmpresaCrearModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const emptyForm: EmpresaFormInput = {
  nombre: '', razon_social: '', rfc: '', direccion: '', telefono: '', email: '',
};

export default function EmpresaCrearModal({ open, onClose, onCreated }: EmpresaCrearModalProps) {
  const toast = useToast();
  const [form, setForm] = useState<EmpresaFormInput>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const f = (field: keyof EmpresaFormInput, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleClose = () => {
    if (loading) return;
    setForm(emptyForm);
    setErrors({});
    onClose();
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!form.razon_social.trim()) e.razon_social = 'La razón social es requerida';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: EmpresaFormInput = {
        nombre: form.nombre.trim(),
        razon_social: form.razon_social.trim(),
        ...(form.rfc?.trim() && { rfc: form.rfc.trim() }),
        ...(form.direccion?.trim() && { direccion: form.direccion.trim() }),
        ...(form.telefono?.trim() && { telefono: form.telefono.trim() }),
        ...(form.email?.trim() && { email: form.email.trim() }),
      };
      const empresa = await empresasService.crearEmpresa(payload);
      toast.success('Empresa creada', `${empresa.nombre} fue creada exitosamente`);
      setForm(emptyForm);
      setErrors({});
      onCreated();
      onClose();
    } catch (err) {
      setErrors(extractFieldErrors(err));
      toast.error('Error', extractErrorMessage(err, 'No se pudo crear la empresa'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Nueva Empresa"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSubmit} loading={loading}>Crear Empresa</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Input
            label="Nombre" required
            value={form.nombre} onChange={e => f('nombre', e.target.value)}
            error={errors.nombre} placeholder="Nombre comercial de la empresa"
            autoFocus
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="Razón Social" required
            value={form.razon_social} onChange={e => f('razon_social', e.target.value)}
            error={errors.razon_social} placeholder="Razón social completa"
          />
        </div>
        <Input
          label="RFC"
          value={form.rfc} onChange={e => f('rfc', e.target.value)}
          error={errors.rfc} placeholder="RFC de la empresa"
        />
        <Input
          label="Teléfono" type="tel"
          value={form.telefono} onChange={e => f('telefono', e.target.value)}
          error={errors.telefono} placeholder="55-0000-0000"
        />
        <div className="sm:col-span-2">
          <Input
            label="Email" type="email"
            value={form.email} onChange={e => f('email', e.target.value)}
            error={errors.email} placeholder="contacto@empresa.com"
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="Dirección"
            value={form.direccion} onChange={e => f('direccion', e.target.value)}
            error={errors.direccion} placeholder="Dirección fiscal"
          />
        </div>
      </div>
    </Modal>
  );
}
