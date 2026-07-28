'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { rhService, HorarioApi, DIAS_SEMANA, DIA_LABEL, DiaSemana } from '@/lib/services/rh';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Clock, Loader2, AlertCircle, Lock, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

const emptyHorario = (dia: DiaSemana): HorarioApi => ({
  dia_semana: dia, es_laboral: false, hora_inicio: '08:00', hora_fin: '17:00',
});

export default function HorariosPage() {
  const { currentUser } = useAuthStore();
  const canEdit = currentUser?.rol?.nombre === 'administrador';
  const toast = useToast();

  const [horarios, setHorarios] = useState<Record<DiaSemana, HorarioApi>>(() => {
    const initial = {} as Record<DiaSemana, HorarioApi>;
    DIAS_SEMANA.forEach(d => { initial[d] = emptyHorario(d); });
    return initial;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingDia, setSavingDia] = useState<DiaSemana | null>(null);
  const [savingAll, setSavingAll] = useState(false);

  const cargarHorarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await rhService.getHorarios();
      setHorarios(prev => {
        const next = { ...prev };
        DIAS_SEMANA.forEach(d => { next[d] = emptyHorario(d); });
        data.forEach(h => {
          const dia = h.dia_semana?.toLowerCase() as DiaSemana;
          if (DIAS_SEMANA.includes(dia)) next[dia] = h;
        });
        return next;
      });
    } catch (err: any) {
      setError(err.message || 'Error al cargar la configuración horaria.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarHorarios();
  }, [cargarHorarios]);

  const updateDia = (dia: DiaSemana, patch: Partial<HorarioApi>) => {
    setHorarios(prev => ({ ...prev, [dia]: { ...prev[dia], ...patch } }));
  };

  const guardarDia = async (dia: DiaSemana) => {
    const h = horarios[dia];
    setSavingDia(dia);
    try {
      const payload = { dia_semana: h.dia_semana, es_laboral: h.es_laboral, hora_inicio: h.hora_inicio, hora_fin: h.hora_fin };
      const saved = h.id
        ? await rhService.actualizarHorario(h.id, payload)
        : await rhService.crearHorario(payload);
      updateDia(dia, saved);
      toast.success(`Horario de ${DIA_LABEL[dia]} guardado`);
    } catch (err: any) {
      toast.error('Error', err.message || `No se pudo guardar el horario de ${DIA_LABEL[dia]}`);
    } finally {
      setSavingDia(null);
    }
  };

  const guardarTodo = async () => {
    setSavingAll(true);
    try {
      await Promise.all(DIAS_SEMANA.map(async dia => {
        const h = horarios[dia];
        const payload = { dia_semana: h.dia_semana, es_laboral: h.es_laboral, hora_inicio: h.hora_inicio, hora_fin: h.hora_fin };
        const saved = h.id
          ? await rhService.actualizarHorario(h.id, payload)
          : await rhService.crearHorario(payload);
        updateDia(dia, saved);
      }));
      toast.success('Horario semanal guardado');
    } catch (err: any) {
      toast.error('Error', err.message || 'No se pudo guardar el horario completo');
    } finally {
      setSavingAll(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-brand-600" />
            <CardTitle>Configuración de Horario Laboral</CardTitle>
          </div>
          {canEdit ? (
            <Button onClick={guardarTodo} loading={savingAll} disabled={loading || !!error}>
              <Save size={16} /> Guardar Todo
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <Lock size={12} /> Solo lectura
            </span>
          )}
        </CardHeader>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="animate-spin text-brand-600" />
            <p className="text-sm text-muted">Cargando configuración horaria...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="text-red-500 mx-auto" size={36} />
            <p className="text-sm font-medium text-red-500">{error}</p>
            <button onClick={cargarHorarios} className="text-sm text-brand-600 hover:underline font-medium">Reintentar</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default">
                  {['Día', 'Es laboral', 'Hora inicio', 'Hora fin', canEdit ? '' : undefined].filter(Boolean).map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DIAS_SEMANA.map(dia => {
                  const h = horarios[dia];
                  return (
                    <tr key={dia} className="border-b border-default last:border-0 hover:bg-app transition-colors">
                      <td className="py-3 pl-0 px-3 font-medium text-primary">{DIA_LABEL[dia]}</td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          disabled={!canEdit}
                          onClick={() => updateDia(dia, { es_laboral: !h.es_laboral })}
                          className={cn(
                            'relative w-10 h-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                            h.es_laboral ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
                          )}
                        >
                          <span className={cn(
                            'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                            h.es_laboral && 'translate-x-4'
                          )} />
                        </button>
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="time"
                          className="input-base w-32"
                          value={h.hora_inicio || ''}
                          disabled={!canEdit || !h.es_laboral}
                          onChange={e => updateDia(dia, { hora_inicio: e.target.value })}
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="time"
                          className="input-base w-32"
                          value={h.hora_fin || ''}
                          disabled={!canEdit || !h.es_laboral}
                          onChange={e => updateDia(dia, { hora_fin: e.target.value })}
                        />
                      </td>
                      {canEdit && (
                        <td className="py-3 px-3">
                          <Button size="sm" variant="secondary" onClick={() => guardarDia(dia)} loading={savingDia === dia}>
                            Guardar
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
