'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Timer, LogIn, Coffee, LogOut as LogOutIcon,
  CheckCircle2, Clock, MapPin, Calendar, User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type EstadoJornada = 'sin_registrar' | 'en_jornada' | 'en_comida' | 'finalizada';

interface RegistroHoy {
  estado: EstadoJornada;
  entrada?: string;
  inicio_comida?: string;
  fin_comida?: string;
  salida?: string;
  horas_trabajadas?: number;
}

// ─── Componentes auxiliares ────────────────────────────────────────────────────
function Reloj() {
  const [hora, setHora] = useState('');
  const [fecha, setFecha] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setHora(now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setFecha(now.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-center mb-8">
      <div className="text-6xl font-bold text-primary tabular-nums tracking-tight">{hora}</div>
      <div className="text-secondary mt-2 capitalize">{fecha}</div>
    </div>
  );
}

function BotonAccion({
  icon: Icon,
  label,
  descripcion,
  color,
  onClick,
  disabled,
}: {
  icon: React.ElementType;
  label: string;
  descripcion: string;
  color: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center gap-3 px-8 py-6 rounded-2xl border-2 transition-all duration-200',
        'hover:-translate-y-1 hover:shadow-xl active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none',
        color
      )}
    >
      <Icon size={32} />
      <div className="text-center">
        <p className="font-bold text-base">{label}</p>
        <p className="text-xs opacity-75 mt-0.5">{descripcion}</p>
      </div>
    </button>
  );
}

function PasoRegistro({ hora, label, done }: { hora?: string; label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', done ? 'bg-emerald-500' : 'bg-default border-2 border-default')}>
        {done ? <CheckCircle2 size={18} className="text-white" /> : <div className="w-2 h-2 rounded-full bg-muted" />}
      </div>
      <div>
        <p className={cn('text-sm font-medium', done ? 'text-primary' : 'text-muted')}>{label}</p>
        {hora && <p className="text-xs text-muted">{hora}</p>}
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function AsistenciaPage() {
  const { currentUser } = useAuthStore();
  const [registro, setRegistro] = useState<RegistroHoy | null>(null);
  const [loading, setLoading] = useState(true);
  const [accionLoading, setAccionLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'ok' | 'error' } | null>(null);

  // Mostrar mensaje temporal
  const mostrarMensaje = (texto: string, tipo: 'ok' | 'error') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 4000);
  };

  // Cargar estado del día
  const cargarRegistro = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/asistencia/hoy`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setRegistro(data.data || { estado: 'sin_registrar' });
      } else {
        setRegistro({ estado: 'sin_registrar' });
      }
    } catch {
      setRegistro({ estado: 'sin_registrar' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarRegistro();
  }, [cargarRegistro]);

  // Ejecutar acción de asistencia
  const ejecutarAccion = async (accion: 'entrada' | 'inicio-comida' | 'fin-comida' | 'salida') => {
    setAccionLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/asistencia/${accion}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        mostrarMensaje(data.message || 'Registrado correctamente', 'ok');
        await cargarRegistro();
      } else {
        mostrarMensaje(data.message || 'Error al registrar', 'error');
      }
    } catch {
      mostrarMensaje('Error de conexión con el servidor', 'error');
    } finally {
      setAccionLoading(false);
    }
  };

  const estado = registro?.estado || 'sin_registrar';

  const botonesConfig = [
    {
      id: 'entrada',
      icon: LogIn,
      label: 'Entrada',
      descripcion: 'Iniciar jornada',
      color: 'border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white',
      enabled: estado === 'sin_registrar',
    },
    {
      id: 'inicio-comida',
      icon: Coffee,
      label: 'Inicio Comida',
      descripcion: 'Tomar descanso',
      color: 'border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white',
      enabled: estado === 'en_jornada',
    },
    {
      id: 'fin-comida',
      icon: Coffee,
      label: 'Fin Comida',
      descripcion: 'Regresar al trabajo',
      color: 'border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white',
      enabled: estado === 'en_comida',
    },
    {
      id: 'salida',
      icon: LogOutIcon,
      label: 'Salida',
      descripcion: 'Finalizar jornada',
      color: 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white',
      enabled: estado === 'en_jornada',
    },
  ] as const;

  const estadoLabel: Record<EstadoJornada, { texto: string; color: string }> = {
    sin_registrar: { texto: 'Sin registro hoy', color: 'text-muted' },
    en_jornada:    { texto: 'En jornada laboral ✅', color: 'text-emerald-500' },
    en_comida:     { texto: 'En descanso de comida ☕', color: 'text-amber-500' },
    finalizada:    { texto: 'Jornada finalizada 🏁', color: 'text-blue-500' },
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Timer size={28} className="text-brand-500" />
          Registro de Asistencia
        </h1>
        <p className="text-secondary mt-1">Reloj checador — registra tu jornada laboral</p>
      </div>

      {/* Tarjeta principal */}
      <div className="bg-card border border-default rounded-2xl p-6 mb-4">
        {/* Reloj */}
        <Reloj />

        {/* Info del usuario */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-app border border-default mb-6">
          <User size={16} className="text-muted shrink-0" />
          <div>
            <p className="text-sm font-semibold text-primary">{currentUser?.nombre || 'Usuario'}</p>
            <p className="text-xs text-muted capitalize">{currentUser?.rol?.nombre}</p>
          </div>
          <div className="ml-auto text-right">
            <p className={cn('text-sm font-semibold', estadoLabel[estado].color)}>
              {estadoLabel[estado].texto}
            </p>
          </div>
        </div>

        {/* Mensaje de feedback */}
        {mensaje && (
          <div className={cn(
            'mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2',
            mensaje.tipo === 'ok'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500'
              : 'bg-red-500/10 border border-red-500/30 text-red-500'
          )}>
            <CheckCircle2 size={16} className="shrink-0" />
            {mensaje.texto}
          </div>
        )}

        {/* Botones de acción */}
        {estado !== 'finalizada' ? (
          loading ? (
            <div className="flex justify-center py-6">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {botonesConfig.map(btn => (
                <BotonAccion
                  key={btn.id}
                  icon={btn.icon}
                  label={btn.label}
                  descripcion={btn.descripcion}
                  color={btn.color}
                  onClick={() => ejecutarAccion(btn.id as any)}
                  disabled={!btn.enabled || accionLoading}
                />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-6">
            <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3" />
            <p className="text-lg font-semibold text-primary">Jornada completada</p>
            <p className="text-secondary text-sm mt-1">
              {registro?.horas_trabajadas
                ? `${registro.horas_trabajadas.toFixed(1)} horas trabajadas hoy`
                : 'Buen trabajo hoy'}
            </p>
          </div>
        )}
      </div>

      {/* Timeline del día */}
      {registro && (
        <div className="bg-card border border-default rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
            <Clock size={16} />
            Timeline de hoy
          </h2>
          <div className="space-y-3">
            <PasoRegistro label="Entrada" hora={registro.entrada} done={!!registro.entrada} />
            <PasoRegistro label="Inicio comida" hora={registro.inicio_comida} done={!!registro.inicio_comida} />
            <PasoRegistro label="Fin comida" hora={registro.fin_comida} done={!!registro.fin_comida} />
            <PasoRegistro label="Salida" hora={registro.salida} done={!!registro.salida} />
          </div>
        </div>
      )}
    </div>
  );
}
