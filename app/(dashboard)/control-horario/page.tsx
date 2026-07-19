'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { Clock, Search, Calendar as CalendarIcon, User } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function ControlHorarioPage() {
  const { usuarios, horarios, diasNoLaborales, addRegistroHorario, updateRegistroHorario } = useStore();
  const toast = useToast();
  const [time, setTime] = useState(new Date());
  const [selectedUser, setSelectedUser] = useState(usuarios[0]?.id || '');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hoy = new Date().toISOString().split('T')[0];
  const esDiaNoLaboral = diasNoLaborales.some(d => d.fecha === hoy);
  
  const filteredUsers = usuarios.filter(u => u.nombre.toLowerCase().includes(search.toLowerCase()));

  const currentUser = usuarios.find(u => u.id === selectedUser);
  const registroHoy = horarios.find(h => h.trabajadorId === selectedUser && h.fecha === hoy);

  const registrar = (accion: 'entrada' | 'inicioComida' | 'finComida' | 'salida') => {
    if (!currentUser) return;
    const hora = new Date().toTimeString().slice(0, 5);
    
    if (!registroHoy) {
      addRegistroHorario({
        trabajadorId: currentUser.id,
        trabajador: currentUser.nombre,
        fecha: hoy,
        [accion]: hora,
        horasNormales: 0,
        horasExtras: 0,
        estado: 'Incompleto'
      });
    } else {
      updateRegistroHorario(registroHoy.id, { [accion]: hora });
      
      // Si es salida, calcular horas (simulado)
      if (accion === 'salida' && registroHoy.entrada) {
        updateRegistroHorario(registroHoy.id, {
          estado: 'Completo',
          horasNormales: 8,
          horasExtras: esDiaNoLaboral ? 8 : 1 // Si es no laboral, todas son extras
        });
      }
    }
    toast.success(`Registro de ${accion} exitoso`, hora);
  };

  const getStatus = (uid: string) => {
    const r = horarios.find(h => h.trabajadorId === uid && h.fecha === hoy);
    if (!r) return { label: 'Ausente', variant: 'gray' };
    if (r.estado === 'Completo') return { label: 'Completado', variant: 'success' };
    if (r.entrada && !r.salida) return { label: 'En Turno', variant: 'info' };
    return { label: r.estado, variant: 'warning' };
  };

  return (
    <div className="space-y-6">
      {esDiaNoLaboral && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center gap-3">
          <CalendarIcon className="text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Hoy es día no laboral</p>
            <p className="text-xs text-amber-600 dark:text-amber-500">Los registros de tiempo se calcularán como horas extras dobles/triples según ley.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de Registro */}
        <Card className="lg:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 to-sky-500" />
          <div className="text-center py-6">
            <div className="text-6xl font-bold font-mono text-primary tracking-wider tabular-nums">
              {time.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <p className="text-secondary mt-2">{time.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="border-t border-default pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full gradient-brand text-white flex items-center justify-center font-bold text-lg shrink-0">
                {currentUser?.avatar}
              </div>
              <div className="flex-1 w-full">
                <select className="input-base text-lg font-medium" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                  {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre} - {u.rol}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button size="lg" className="h-16 justify-center text-lg bg-emerald-600 hover:bg-emerald-700" onClick={() => registrar('entrada')} disabled={!!registroHoy?.entrada}>
                Entrada {registroHoy?.entrada && <span className="font-mono text-sm ml-2 bg-black/20 px-2 py-1 rounded">{registroHoy.entrada}</span>}
              </Button>
              <Button size="lg" className="h-16 justify-center text-lg bg-amber-500 hover:bg-amber-600" onClick={() => registrar('inicioComida')} disabled={!registroHoy?.entrada || !!registroHoy?.inicioComida}>
                Inicio Comida {registroHoy?.inicioComida && <span className="font-mono text-sm ml-2 bg-black/20 px-2 py-1 rounded">{registroHoy.inicioComida}</span>}
              </Button>
              <Button size="lg" className="h-16 justify-center text-lg bg-sky-500 hover:bg-sky-600" onClick={() => registrar('finComida')} disabled={!registroHoy?.inicioComida || !!registroHoy?.finComida}>
                Fin Comida {registroHoy?.finComida && <span className="font-mono text-sm ml-2 bg-black/20 px-2 py-1 rounded">{registroHoy.finComida}</span>}
              </Button>
              <Button size="lg" className="h-16 justify-center text-lg bg-red-600 hover:bg-red-700" onClick={() => registrar('salida')} disabled={!registroHoy?.entrada || !!registroHoy?.salida}>
                Salida {registroHoy?.salida && <span className="font-mono text-sm ml-2 bg-black/20 px-2 py-1 rounded">{registroHoy.salida}</span>}
              </Button>
            </div>
          </div>
        </Card>

        {/* Status de Empleados */}
        <Card className="flex flex-col h-full">
          <CardHeader className="pb-4">
            <CardTitle>Estatus de Hoy</CardTitle>
          </CardHeader>
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input-base pl-9" placeholder="Buscar empleado..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-[400px] scrollbar-thin">
            {filteredUsers.map(u => {
              const status = getStatus(u.id);
              return (
                <div key={u.id} className={`flex items-center justify-between p-2.5 rounded-xl border border-default cursor-pointer transition-colors ${selectedUser === u.id ? 'bg-brand-50 border-brand-200 dark:bg-brand-900/20' : 'hover:bg-app'}`} onClick={() => setSelectedUser(u.id)}>
                  <div className="flex items-center gap-2 min-w-0">
                    <User size={14} className="text-secondary shrink-0" />
                    <span className="text-xs font-medium text-primary truncate">{u.nombre}</span>
                  </div>
                  <Badge variant={status.variant as any} size="sm">{status.label}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
