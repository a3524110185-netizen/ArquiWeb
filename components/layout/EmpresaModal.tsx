'use client';
import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { extractErrorMessage } from '@/lib/services/api';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import EmpresaCrearModal from '@/components/layout/EmpresaCrearModal';
import { Building2, Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EmpresaModal() {
  const { currentUser, cambiarEmpresa } = useAuthStore();
  const toast = useToast();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCrearModal, setShowCrearModal] = useState(false);

  const empresas = currentUser?.empresas_disponibles;
  const shouldShow = !!currentUser
    && currentUser.rol?.nombre === 'administrador'
    && (empresas?.length ?? 0) > 1
    && !currentUser.empresa_actual;

  if (!shouldShow || !empresas) return null;

  const handleContinuar = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      await cambiarEmpresa(selectedId);
      window.location.reload();
    } catch (err) {
      toast.error('Error', extractErrorMessage(err, 'No se pudo seleccionar la empresa'));
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        open
        onClose={() => {}}
        title="Seleccionar Empresa"
        size="lg"
        footer={
          <Button onClick={handleContinuar} disabled={!selectedId || loading} loading={loading} className="w-full sm:w-auto ml-auto">
            Continuar
          </Button>
        }
      >
        <p className="text-sm text-secondary mb-4">Administras varias empresas. Elige con cuál quieres trabajar.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {empresas.map(e => {
            const isSelected = e.id === selectedId;
            return (
              <button
                key={e.id}
                onClick={() => setSelectedId(e.id)}
                className={cn(
                  'relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
                  isSelected ? 'border-sigo-primary bg-sigo-primary/10 dark:bg-sigo-primary/20' : 'border-default bg-app'
                )}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-sigo-primary text-white flex items-center justify-center">
                    <Check size={12} />
                  </span>
                )}
                <div className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center',
                  isSelected ? 'bg-sigo-primary text-white' : 'bg-card text-sigo-primary border border-default'
                )}>
                  <Building2 size={28} />
                </div>
                <p className="text-sm font-semibold text-primary">{e.nombre}</p>
              </button>
            );
          })}
          <button
            onClick={() => setShowCrearModal(true)}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-default text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-sigo-primary hover:shadow-lg"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-card text-sigo-primary border border-default">
              <Plus size={28} />
            </div>
            <p className="text-sm font-semibold text-primary">Crear Empresa</p>
          </button>
        </div>
      </Modal>
      <EmpresaCrearModal
        open={showCrearModal}
        onClose={() => setShowCrearModal(false)}
        onCreated={() => window.location.reload()}
      />
    </>
  );
}
