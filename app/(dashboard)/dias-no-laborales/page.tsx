'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { rhService, DiaNoLaboralApi, TipoDiaNoLaboral } from '@/lib/services/rh';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { BadgeVariant } from '@/components/ui/Badge';
import Modal, { ConfirmDialog } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/FormFields';
import { useToast } from '@/components/ui/Toast';
import { formatDate, cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Plus, Trash2, ChevronLeft, ChevronRight, Loader2, AlertCircle, Lock } from 'lucide-react';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const TIPO_OPTIONS: { value: TipoDiaNoLaboral; label: string }[] = [
  { value: 'festivo', label: 'Festivo' },
  { value: 'vacaciones', label: 'Vacaciones' },
  { value: 'descanso', label: 'Descanso' },
];

const tipoVariant: Record<TipoDiaNoLaboral, BadgeVariant> = {
  festivo: 'danger', vacaciones: 'info', descanso: 'gray',
};

const emptyForm = { fecha: '', descripcion: '', tipo: 'festivo' as TipoDiaNoLaboral };

export default function DiasNoLaboralesPage() {
  const { currentUser } = useAuthStore();
  const canEdit = currentUser?.rol?.nombre === 'administrador';
  const toast = useToast();

  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [anio, setAnio] = useState(hoy.getFullYear());

  const [dias, setDias] = useState<DiaNoLaboralApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const cargarDias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await rhService.getDiasNoLaborales(mes, anio);
      setDias(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los días no laborales.');
    } finally {
      setLoading(false);
    }
  }, [mes, anio]);

  useEffect(() => {
    cargarDias();
  }, [cargarDias]);

  const diasPorFecha = useMemo(() => {
    const map = new Map<string, DiaNoLaboralApi>();
    dias.forEach(d => map.set(d.fecha, d));
    return map;
  }, [dias]);

  const semanas = useMemo(() => {
    const primerDia = new Date(anio, mes - 1, 1);
    const totalDias = new Date(anio, mes, 0).getDate();
    const offset = (primerDia.getDay() + 6) % 7; // Lunes = 0
    const celdas: (number | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= totalDias; d++) celdas.push(d);
    while (celdas.length % 7 !== 0) celdas.push(null);
    const filas: (number | null)[][] = [];
    for (let i = 0; i < celdas.length; i += 7) filas.push(celdas.slice(i, i + 7));
    return filas;
  }, [mes, anio]);

  const cambiarMes = (delta: number) => {
    let nuevoMes = mes + delta;
    let nuevoAnio = anio;
    if (nuevoMes < 1) { nuevoMes = 12; nuevoAnio -= 1; }
    if (nuevoMes > 12) { nuevoMes = 1; nuevoAnio += 1; }
    setMes(nuevoMes);
    setAnio(nuevoAnio);
  };

  const fechaKey = (dia: number) => `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fecha) e.fecha = 'Selecciona una fecha';
    if (!form.descripcion.trim()) e.descripcion = 'Ingresa una descripción';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await rhService.crearDiaNoLaboral(form);
      toast.success('Día no laboral registrado');
      setModal(false);
      setForm(emptyForm);
      cargarDias();
    } catch (err: any) {
      toast.error('Error', err.message || 'No se pudo registrar el día no laboral');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await rhService.eliminarDiaNoLaboral(id);
      toast.success('Registro eliminado');
      cargarDias();
    } catch (err: any) {
      toast.error('Error', err.message || 'No se pudo eliminar el registro');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const isPasado = (fecha: string) => new Date(fecha) < new Date(new Date().toDateString());

  return (
    <div className="space-y-4 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarIcon size={20} className="text-brand-600" />
            <CardTitle>Días Oficiales No Laborales</CardTitle>
          </div>
          {canEdit ? (
            <Button onClick={() => { setForm(emptyForm); setErrors({}); setModal(true); }}>
              <Plus size={16} /> Agregar Día
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <Lock size={12} /> Solo lectura
            </span>
          )}
        </CardHeader>

        {/* Selector de mes/año */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button onClick={() => cambiarMes(-1)} className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-app transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-semibold text-primary min-w-[160px] text-center">{MESES[mes - 1]} {anio}</span>
          <button onClick={() => cambiarMes(1)} className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-app transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="animate-spin text-brand-600" />
            <p className="text-sm text-muted">Cargando calendario...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="text-red-500 mx-auto" size={36} />
            <p className="text-sm font-medium text-red-500">{error}</p>
            <button onClick={cargarDias} className="text-sm text-brand-600 hover:underline font-medium">Reintentar</button>
          </div>
        ) : (
          <>
            {/* Calendario */}
            <div className="mb-6">
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-muted py-1">{d}</div>
                ))}
              </div>
              {semanas.map((fila, i) => (
                <div key={i} className="grid grid-cols-7 gap-1 mb-1">
                  {fila.map((dia, j) => {
                    if (dia === null) return <div key={j} className="aspect-square" />;
                    const key = fechaKey(dia);
                    const registro = diasPorFecha.get(key);
                    return (
                      <div
                        key={j}
                        title={registro?.descripcion}
                        className={cn(
                          'aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium border transition-colors',
                          registro
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400'
                            : 'border-transparent text-secondary hover:bg-app'
                        )}
                      >
                        {dia}
                        {registro && <span className="w-1 h-1 rounded-full bg-red-500 mt-0.5" />}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Lista */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-secondary pl-0">Fecha</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-secondary">Descripción</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-secondary">Tipo</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-secondary">Estado</th>
                    {canEdit && <th className="text-left py-2 px-3 text-xs font-semibold text-secondary pr-0">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {[...dias].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()).map(d => (
                    <tr key={d.id} className="border-b border-default last:border-0 hover:bg-app transition-colors">
                      <td className="py-3 px-3 pl-0">
                        <div className="flex items-center gap-2">
                          <CalendarIcon size={14} className="text-brand-500" />
                          <span className="font-medium text-primary">{formatDate(d.fecha)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-secondary">{d.descripcion}</td>
                      <td className="py-3 px-3"><Badge variant={tipoVariant[d.tipo] || 'gray'}>{TIPO_OPTIONS.find(t => t.value === d.tipo)?.label || d.tipo}</Badge></td>
                      <td className="py-3 px-3">
                        {isPasado(d.fecha) ? <Badge variant="gray">Pasado</Badge> : <Badge variant="success">Próximo</Badge>}
                      </td>
                      {canEdit && (
                        <td className="py-3 px-3 pr-0">
                          <button onClick={() => setDeleteId(d.id)} className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {dias.length === 0 && (
                    <tr><td colSpan={canEdit ? 5 : 4} className="py-8 text-center text-muted">No hay días no laborales registrados en {MESES[mes - 1]} {anio}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Registrar Día No Laboral"
        footer={<><Button variant="secondary" onClick={() => setModal(false)} disabled={submitting}>Cancelar</Button><Button onClick={handleSubmit} loading={submitting}>Guardar</Button></>}>
        <div className="space-y-4">
          <Input label="Fecha" type="date" value={form.fecha} onChange={e => setForm(prev => ({ ...prev, fecha: e.target.value }))} error={errors.fecha} />
          <Input label="Descripción" value={form.descripcion} onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))} error={errors.descripcion} placeholder="Ej. Día de la Independencia" />
          <Select label="Tipo" options={TIPO_OPTIONS} value={form.tipo} onChange={e => setForm(prev => ({ ...prev, tipo: e.target.value as TipoDiaNoLaboral }))} />
        </div>
      </Modal>

      <ConfirmDialog open={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Eliminar registro" message="¿Estás seguro de eliminar este día no laboral?" confirmLabel={deleting ? 'Eliminando...' : 'Eliminar'} />
    </div>
  );
}
