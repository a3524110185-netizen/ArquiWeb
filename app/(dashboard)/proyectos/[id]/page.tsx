'use client';
import { useStore } from '@/store/useStore';
import { useParams } from 'next/navigation';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge, { proyectoEstadoVariant, severidadVariant } from '@/components/ui/Badge';
import { formatCurrency, timeAgo } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FolderOpen, AlertTriangle, Users, DollarSign, Calendar, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ProyectoDetallePage() {
  const params = useParams();
  const id = params.id as string;
  const { proyectos, incidencias, gastos, usuarios, actividad } = useStore();

  const proyecto = proyectos.find(p => p.id === id) || proyectos[0];

  const incProyecto = incidencias.filter(i => i.proyectoId === proyecto.id);
  const incCriticas = incProyecto.filter(i => i.severidad === 'Crítica' || i.severidad === 'Alta');
  const gastosProy = gastos.filter(g => g.proyectoId === proyecto.id);
  const equipoProy = usuarios.filter(u => proyecto.equipo.includes(u.id));
  const actProy = actividad.filter(a => a.proyecto === proyecto.nombre).slice(0, 5);

  const avanceHistorico = [
    { mes: 'Ene', avance: 10 },
    { mes: 'Feb', avance: 25 },
    { mes: 'Mar', avance: 32 },
    { mes: 'Abr', avance: 40 },
    { mes: 'May', avance: proyecto.avanceFisico },
  ];

  const gastosTotal = gastosProy.reduce((a, g) => a + g.monto, 0);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-card rounded-2xl border border-default shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-bold text-primary">{proyecto.nombre}</h1>
            <Badge variant={proyectoEstadoVariant(proyecto.estado)} dot>{proyecto.estado}</Badge>
          </div>
          <p className="text-sm text-secondary max-w-3xl">{proyecto.descripcion}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted">
            <span className="flex items-center gap-1"><MapPin size={14} /> {proyecto.ubicacion}</span>
            <span className="flex items-center gap-1"><Calendar size={14} /> {proyecto.fechaInicio} – {proyecto.fechaFin}</span>
            <span className="flex items-center gap-1"><FolderOpen size={14} /> Resp: {proyecto.responsable}</span>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <p className="text-sm font-semibold text-secondary mb-1">Avance Físico</p>
          <div className="text-3xl font-bold text-brand-600 mb-2">{proyecto.avanceFisico}%</div>
          <div className="w-32 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-brand-600" style={{ width: `${proyecto.avanceFisico}%` }} />
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><CheckCircle size={24} /></div>
          <div><p className="text-xs text-secondary mb-1">Financiero</p><p className="text-xl font-bold text-primary">{proyecto.avanceFinanciero}%</p></div>
        </Card>
        <Card padding="md" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0"><AlertTriangle size={24} /></div>
          <div><p className="text-xs text-secondary mb-1">Incidencias</p><p className="text-xl font-bold text-primary">{incCriticas.length} críticas</p></div>
        </Card>
        <Card padding="md" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0"><DollarSign size={24} /></div>
          <div><p className="text-xs text-secondary mb-1">Gastos</p><p className="text-xl font-bold text-primary">{formatCurrency(gastosTotal)}</p></div>
        </Card>
        <Card padding="md" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0"><Users size={24} /></div>
          <div><p className="text-xs text-secondary mb-1">Equipo</p><p className="text-xl font-bold text-primary">{equipoProy.length} personas</p></div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avance Histórico & Equipo */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Avance Físico Histórico</CardTitle></CardHeader>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={avanceHistorico} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Line type="monotone" dataKey="avance" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <CardHeader><CardTitle>Equipo Asignado</CardTitle></CardHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {equipoProy.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl border border-default hover:bg-app transition-colors">
                  <div className="w-10 h-10 rounded-full gradient-brand text-white flex items-center justify-center text-sm font-bold shrink-0">{u.avatar}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary truncate">{u.nombre}</p>
                    <p className="text-[10px] text-muted">{u.rol}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar Project */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Incidencias Recientes</CardTitle>
              <Link href="/incidencias" className="text-xs text-brand-600 hover:underline">Ver todas</Link>
            </CardHeader>
            <div className="space-y-3">
              {incProyecto.slice(0, 4).map(i => (
                <Link key={i.id} href={`/incidencias/${i.id}`} className="block p-3 rounded-xl bg-app hover:bg-brand-50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-semibold text-primary truncate pr-2">{i.titulo}</p>
                    <Badge variant={severidadVariant(i.severidad)}>{i.severidad}</Badge>
                  </div>
                  <p className="text-[10px] text-muted">{timeAgo(i.fechaCreacion)}</p>
                </Link>
              ))}
              {incProyecto.length === 0 && <p className="text-xs text-muted text-center py-4">No hay incidencias registradas</p>}
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>Actividad Reciente</CardTitle></CardHeader>
            <div className="space-y-4">
              {actProy.map(a => (
                <div key={a.id} className="flex gap-3 relative">
                  <div className="absolute left-[7px] top-4 bottom-0 w-px bg-border" />
                  <div className="w-4 h-4 rounded-full bg-brand-100 border border-brand-300 shrink-0 z-10" />
                  <div className="pb-1">
                    <p className="text-xs font-medium text-primary leading-tight">{a.descripcion}</p>
                    <p className="text-[10px] text-muted mt-0.5">{timeAgo(a.fecha)} · {a.usuario}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
