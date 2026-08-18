'use client';
import { useState, useEffect, useCallback } from 'react';
import { solicitudesService, SolicitudApi } from '@/lib/services/solicitudes';
import { extractErrorMessage } from '@/lib/services/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Modal, { ConfirmDialog } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/FormFields';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime } from '@/lib/utils';
import { Check, X, Loader2, AlertCircle, UserPlus } from 'lucide-react';

export default function SuperadminSolicitudesPage() {
  const toast = useToast();

  const [solicitudes, setSolicitudes] = useState<SolicitudApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [confirmAprobar, setConfirmAprobar] = useState<SolicitudApi | null>(null);
  const [rechazarModal, setRechazarModal] = useState<SolicitudApi | null>(null);
  const [motivo, setMotivo] = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await solicitudesService.listar();
      setSolicitudes(data);
    } catch (err) {
      setError(extractErrorMessage(err, 'Error al cargar las solicitudes.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const handleAprobar = async () => {
    if (!confirmAprobar) return;
    setProcessingId(confirmAprobar.id);
    try {
      await solicitudesService.aprobar(confirmAprobar.id);
      toast.success('Solicitud aprobada', `${confirmAprobar.nombre} ya puede iniciar sesión`);
      cargar();
    } catch (err) {
      toast.error('Error', extractErrorMessage(err, 'No se pudo aprobar la solicitud'));
    } finally {
      setProcessingId(null);
    }
  };

  const cerrarRechazarModal = () => {
    setRechazarModal(null);
    setMotivo('');
  };

  const handleRechazar = async () => {
    if (!rechazarModal) return;
    setProcessingId(rechazarModal.id);
    try {
      await solicitudesService.rechazar(rechazarModal.id, motivo.trim() || undefined);
      toast.success('Solicitud rechazada');
      cerrarRechazarModal();
      cargar();
    } catch (err) {
      toast.error('Error', extractErrorMessage(err, 'No se pudo rechazar la solicitud'));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Registro</CardTitle>
        </CardHeader>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="animate-spin text-sigo-primary" />
            <p className="text-sm text-muted">Cargando solicitudes...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="text-red-500 mx-auto" size={36} />
            <p className="text-sm font-medium text-red-500">{error}</p>
            <button onClick={cargar} className="text-sm text-sigo-primary hover:underline font-medium">Reintentar</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default">
                  {['Fecha', 'Usuario', 'Email', 'Teléfono', 'Empresa', 'Departamento', ''].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s) => (
                  <tr key={s.id} className="border-b border-default last:border-0 hover:bg-app transition-colors">
                    <td className="py-3 pl-0 px-3 text-xs text-secondary whitespace-nowrap">{formatDateTime(s.created_at)}</td>
                    <td className="py-3 px-3 text-xs font-medium text-primary">{s.nombre}</td>
                    <td className="py-3 px-3 text-xs text-secondary max-w-[200px] truncate">{s.email}</td>
                    <td className="py-3 px-3 text-xs text-secondary">{s.telefono || '—'}</td>
                    <td className="py-3 px-3 text-xs text-secondary">{s.empresa?.nombre || '—'}</td>
                    <td className="py-3 px-3 text-xs text-secondary">{s.departamento?.nombre || '—'}</td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setConfirmAprobar(s)}
                          disabled={processingId === s.id}
                          title="Aprobar solicitud"
                          className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors border border-emerald-200 dark:border-emerald-900/30 disabled:opacity-50"
                        >
                          {processingId === s.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        </button>
                        <button
                          onClick={() => setRechazarModal(s)}
                          disabled={processingId === s.id}
                          title="Rechazar solicitud"
                          className="p-1.5 rounded-lg text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-red-200 dark:border-red-900/30 disabled:opacity-50"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {solicitudes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted">
                        <UserPlus size={28} />
                        <p className="text-sm">No hay solicitudes pendientes</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={confirmAprobar !== null}
        onClose={() => setConfirmAprobar(null)}
        onConfirm={handleAprobar}
        title="Aprobar solicitud"
        message={`¿Aprobar el registro de ${confirmAprobar?.nombre}? Podrá iniciar sesión de inmediato.`}
        confirmLabel="Aprobar"
        variant="primary"
      />

      <Modal
        open={rechazarModal !== null}
        onClose={cerrarRechazarModal}
        title="Rechazar Solicitud"
        footer={
          <>
            <Button variant="secondary" onClick={cerrarRechazarModal} disabled={processingId === rechazarModal?.id}>Cancelar</Button>
            <Button variant="danger" onClick={handleRechazar} loading={processingId === rechazarModal?.id}>Rechazar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary">
            Rechazar la solicitud de <span className="font-semibold text-primary">{rechazarModal?.nombre}</span>.
          </p>
          <Textarea
            label="Motivo (opcional)"
            rows={3}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Explica el motivo del rechazo..."
          />
        </div>
      </Modal>
    </div>
  );
}
