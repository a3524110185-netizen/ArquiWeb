'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { extractErrorMessage } from '@/lib/services/api';
import { useToast } from '@/components/ui/Toast';
import EmpresaCrearModal from '@/components/layout/EmpresaCrearModal';
import { Building2, ChevronDown, Check, AlertTriangle, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EmpresaSelector() {
  const { currentUser, cambiarEmpresa } = useAuthStore();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCrearModal, setShowCrearModal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser || currentUser.rol?.nombre !== 'administrador') return null;

  const empresas = currentUser.empresas_disponibles;
  const crearModal = (
    <EmpresaCrearModal
      open={showCrearModal}
      onClose={() => setShowCrearModal(false)}
      onCreated={() => window.location.reload()}
    />
  );

  // Admin sin empresas asignadas: un solo botón directo, sin dropdown
  if (empresas && empresas.length === 0) {
    return (
      <>
        <button
          onClick={() => setShowCrearModal(true)}
          title="No tienes empresas asignadas — Crear Empresa"
          className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 text-xs text-amber-700 dark:text-amber-400 font-medium hover:border-amber-400 transition-colors"
        >
          <AlertTriangle size={12} className="shrink-0" />
          <span className="hidden sm:inline">Sin empresa</span>
          <Plus size={12} className="shrink-0" />
        </button>
        {crearModal}
      </>
    );
  }

  // Solo 1 empresa disponible (o el campo no vino): badge estático + botón para crear otra
  if (!empresas || empresas.length <= 1) {
    return (
      <>
        <div className="flex items-center gap-1.5">
          {currentUser.empresa_actual && (
            <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-app border border-default text-xs text-secondary font-medium">
              <Building2 size={12} className="shrink-0" />
              <span className="hidden sm:inline max-w-[140px] truncate">{currentUser.empresa_actual.nombre}</span>
            </span>
          )}
          <button
            onClick={() => setShowCrearModal(true)}
            title="Nueva Empresa"
            className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-app border border-default text-xs text-secondary font-medium hover:text-primary hover:border-brand-600 transition-colors"
          >
            <Plus size={12} className="shrink-0" />
            <span className="hidden sm:inline">Nueva Empresa</span>
          </button>
        </div>
        {crearModal}
      </>
    );
  }

  if (!currentUser.empresa_actual) return null;

  const handleSelect = async (empresaId: number) => {
    if (empresaId === currentUser.empresa_actual?.id) { setOpen(false); return; }
    setLoading(true);
    try {
      await cambiarEmpresa(empresaId);
      toast.success('Empresa cambiada', 'Actualizando datos...');
      window.location.reload();
    } catch (err) {
      toast.error('Error', extractErrorMessage(err, 'No se pudo cambiar de empresa'));
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-app border border-default text-xs text-secondary font-medium hover:text-primary hover:border-brand-600 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : <Building2 size={12} />}
        <span className="max-w-[140px] truncate">{currentUser.empresa_actual.nombre}</span>
        <ChevronDown size={12} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-default rounded-xl shadow-xl z-50 fade-in overflow-hidden">
          <div className="px-4 py-2.5 border-b border-default">
            <p className="text-xs font-semibold text-primary">Cambiar de empresa</p>
          </div>
          <div className="max-h-72 overflow-y-auto scrollbar-thin">
            {empresas.map(e => {
              const isActual = e.id === currentUser.empresa_actual?.id;
              return (
                <button
                  key={e.id}
                  onClick={() => handleSelect(e.id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs transition-colors hover:bg-app',
                    isActual ? 'text-primary font-semibold' : 'text-secondary'
                  )}
                >
                  <Building2 size={14} className="shrink-0 text-muted" />
                  <span className="flex-1 truncate">{e.nombre}</span>
                  {isActual && <Check size={14} className="text-brand-600 shrink-0" />}
                </button>
              );
            })}
          </div>
          <div className="border-t border-default">
            <button
              onClick={() => { setOpen(false); setShowCrearModal(true); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs font-medium text-brand-600 hover:bg-app transition-colors"
            >
              <Plus size={14} className="shrink-0" />
              Crear Empresa
            </button>
          </div>
        </div>
      )}
      {crearModal}
    </div>
  );
}
