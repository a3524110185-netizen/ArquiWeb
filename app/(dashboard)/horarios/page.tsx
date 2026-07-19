'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import Tabs, { useTabs } from '@/components/ui/Tabs';

function DigitalClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <div className="text-center py-4">
      <div className="text-5xl font-bold font-mono text-brand-600 tracking-widest">
        {pad(time.getHours())}:{pad(time.getMinutes())}:{pad(time.getSeconds())}
      </div>
      <div className="text-sm text-secondary mt-1">
        {time.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
}

export default function HorariosPage() {
  const { horarios, usuarios, addRegistroHorario, updateRegistroHorario } = useStore();
  const { activeTab, setActiveTab } = useTabs('dia');
  const [selectedTrab, setSelectedTrab] = useState('u1');

  const trabajadores = usuarios.filter(u => ['u1', 'u5', 'u8'].includes(u.id));
  const trabajadorNombre = trabajadores.find(t => t.id === selectedTrab)?.nombre ?? '';

  const hoy = '2025-05-30';
  const registroHoy = horarios.find(h => h.trabajadorId === selectedTrab && h.fecha === hoy);

  const semanaFechas = ['2025-05-26', '2025-05-27', '2025-05-28', '2025-05-29', '2025-05-30'];
  const semanaRegistros = horarios.filter(h => h.trabajadorId === selectedTrab && semanaFechas.includes(h.fecha));

  const registrarAccion = (accion: 'entrada' | 'inicioComida' | 'finComida' | 'salida') => {
    const hora = new Date().toTimeString().slice(0, 5);
    if (!registroHoy) {
      addRegistroHorario({ trabajadorId: selectedTrab, trabajador: trabajadorNombre, fecha: hoy, [accion]: hora, horasNormales: 0, horasExtras: 0, estado: 'Incompleto' });
    } else {
      updateRegistroHorario(registroHoy.id, { [accion]: hora });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Reloj */}
        <Card className="lg:col-span-2">
          <DigitalClock />
          <div className="mt-4">
            <label className="text-xs font-medium text-secondary mb-2 block">Trabajador</label>
            <select className="input-base" value={selectedTrab} onChange={e => setSelectedTrab(e.target.value)}>
              {trabajadores.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            {[
              { label: 'Entrada', action: 'entrada' as const, color: 'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100', disabled: !!registroHoy?.entrada },
              { label: 'Inicio Comida', action: 'inicioComida' as const, color: 'text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100', disabled: !!registroHoy?.inicioComida },
              { label: 'Fin Comida', action: 'finComida' as const, color: 'text-brand-600 border-brand-200 bg-brand-50 hover:bg-brand-100', disabled: !!registroHoy?.finComida },
              { label: 'Salida', action: 'salida' as const, color: 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100', disabled: !!registroHoy?.salida },
            ].map(b => (
              <button key={b.action} onClick={() => registrarAccion(b.action)} disabled={b.disabled}
                className={`p-3 rounded-xl border font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${b.color}`}>
                {b.label}
                {registroHoy?.[b.action] && <div className="text-xs font-mono mt-0.5">{registroHoy[b.action]}</div>}
              </button>
            ))}
          </div>
        </Card>

        {/* Resumen hoy */}
        <Card>
          <CardTitle className="mb-3">Hoy – {formatDate(hoy)}</CardTitle>
          {registroHoy ? (
            <div className="space-y-2">
              {[
                { label: 'Entrada', value: registroHoy.entrada },
                { label: 'Inicio comida', value: registroHoy.inicioComida },
                { label: 'Fin comida', value: registroHoy.finComida },
                { label: 'Salida', value: registroHoy.salida },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-sm py-2 border-b border-default last:border-0">
                  <span className="text-secondary">{r.label}</span>
                  <span className="font-mono font-medium text-primary">{r.value ?? '–'}</span>
                </div>
              ))}
              <div className="pt-2 flex justify-between">
                <span className="text-xs text-secondary">Horas normales</span>
                <span className="text-xs font-bold text-primary">{registroHoy.horasNormales}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-secondary">Horas extras</span>
                <span className="text-xs font-bold text-amber-600">{registroHoy.horasExtras}h</span>
              </div>
              <Badge variant={registroHoy.estado === 'Completo' ? 'success' : 'warning'} dot className="mt-1">{registroHoy.estado}</Badge>
            </div>
          ) : (
            <p className="text-sm text-muted text-center py-8">Sin registro hoy</p>
          )}
        </Card>
      </div>

      {/* Vista Semanal */}
      <Card>
        <CardHeader>
          <CardTitle>Vista Semanal – {trabajadorNombre}</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-default">
                {['Fecha', 'Entrada', 'Inicio Comida', 'Fin Comida', 'Salida', 'H. Normales', 'H. Extras', 'Estado'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {semanaFechas.map(fecha => {
                const reg = semanaRegistros.find(r => r.fecha === fecha);
                return (
                  <tr key={fecha} className="border-b border-default last:border-0 hover:bg-app transition-colors">
                    <td className="py-3 pl-0 px-3 text-xs font-medium text-primary">{formatDate(fecha)}</td>
                    {['entrada', 'inicioComida', 'finComida', 'salida'].map(campo => (
                      <td key={campo} className="py-3 px-3 font-mono text-xs text-secondary">
                        {reg?.[campo as keyof typeof reg] ?? '–'}
                      </td>
                    ))}
                    <td className="py-3 px-3 text-xs font-medium text-primary">{reg?.horasNormales ?? 0}h</td>
                    <td className="py-3 px-3 text-xs font-medium text-amber-600">{reg?.horasExtras ?? 0}h</td>
                    <td className="py-3 px-3">
                      {reg
                        ? <Badge variant={reg.estado === 'Completo' ? 'success' : reg.estado === 'Ausente' ? 'danger' : 'warning'} dot>{reg.estado}</Badge>
                        : <Badge variant="gray" dot>Sin registro</Badge>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-brand-50 dark:bg-brand-900/10">
                <td colSpan={5} className="py-2 pl-0 px-3 text-xs font-semibold text-primary">Total semana</td>
                <td className="py-2 px-3 text-xs font-bold text-primary">
                  {semanaRegistros.reduce((a, r) => a + r.horasNormales, 0)}h
                </td>
                <td className="py-2 px-3 text-xs font-bold text-amber-600">
                  {semanaRegistros.reduce((a, r) => a + r.horasExtras, 0)}h
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
