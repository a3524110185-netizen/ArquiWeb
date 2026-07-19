'use client';
import { useStore } from '@/store/useStore';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge, { severidadVariant } from '@/components/ui/Badge';
import { formatCurrency, timeAgo } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, Camera, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const tendencia = [
  { dia: 'Lun', incidencias: 1, reportes: 3 },
  { dia: 'Mar', incidencias: 2, reportes: 4 },
  { dia: 'Mié', incidencias: 0, reportes: 5 },
  { dia: 'Jue', incidencias: 3, reportes: 2 },
  { dia: 'Vie', incidencias: 1, reportes: 6 },
  { dia: 'Sáb', incidencias: 0, reportes: 1 },
  { dia: 'Hoy', incidencias: 2, reportes: 3 },
];

export default function DashboardEjecutivoPage() {
  const { reportes, incidencias, gastos, proyectos } = useStore();

  const hoy = '2025-05-31';
  const reportesHoy = reportes.filter(r => r.fecha === hoy);
  const incAbiertas = incidencias.filter(i => i.estado === 'Abierto' || i.estado === 'En Progreso');
  const fotosHoy = reportesHoy.flatMap(r => r.fotos).slice(0, 4);
  const avancePromedio = Math.round(proyectos.reduce((a, p) => a + p.avanceFisico, 0) / proyectos.length);
  const gastosTotal = gastos.reduce((a, g) => a + g.monto, 0);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avance Promedio', value: `${avancePromedio}%`, sub: 'Todos los proyectos', icon: TrendingUp, color: '#2563EB', bg: '#DBEAFE' },
          { label: 'Reportes Hoy', value: `${reportesHoy.length}`, sub: 'Enviados desde campo', icon: FileText, color: '#059669', bg: '#D1FAE5' },
          { label: 'Incidencias Abiertas', value: `${incAbiertas.length}`, sub: 'Requieren atención', icon: AlertTriangle, color: '#EF4444', bg: '#FEE2E2' },
          { label: 'Fotos Subidas Hoy', value: `${reportesHoy.flatMap(r => r.fotos).length}`, sub: 'Evidencias de campo', icon: Camera, color: '#7C3AED', bg: '#EDE9FE' },
        ].map(k => (
          <Card key={k.label} className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20 -translate-y-8 translate-x-8" style={{ background: k.color }} />
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: k.bg }}>
              <k.icon size={18} style={{ color: k.color }} />
            </div>
            <p className="text-2xl font-bold text-primary">{k.value}</p>
            <p className="text-xs font-medium text-secondary mt-0.5">{k.label}</p>
            <p className="text-[10px] text-muted mt-0.5">{k.sub}</p>
          </Card>
        ))}
      </div>

      {/* Últimas fotos */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Fotos de Campo</CardTitle>
          <Link href="/galeria-evidencias" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
            Ver galería <ArrowRight size={12} />
          </Link>
        </CardHeader>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {fotosHoy.map((foto, i) => (
            <div key={i} className="aspect-video rounded-xl overflow-hidden">
              <img src={foto} alt="Evidencia" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
          ))}
          {fotosHoy.length === 0 && (
            <div className="col-span-4 py-8 text-center text-sm text-muted">Sin fotos registradas hoy</div>
          )}
        </div>
      </Card>

      {/* Tendencia 7 días + Incidencias críticas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Tendencia 7 Días</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={tendencia} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="incidencias" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} name="Incidencias" />
              <Line type="monotone" dataKey="reportes" stroke="#2563EB" strokeWidth={2} dot={{ r: 4 }} name="Reportes" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incidencias Activas</CardTitle>
            <Link href="/incidencias-criticas" className="text-xs text-brand-600 hover:underline"><ArrowRight size={12} /></Link>
          </CardHeader>
          <div className="space-y-2">
            {incAbiertas.slice(0, 4).map(i => (
              <Link key={i.id} href={`/incidencias/${i.id}`}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-app transition-colors group">
                <Badge variant={severidadVariant(i.severidad)} size="sm">{i.severidad}</Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-primary truncate group-hover:text-brand-600">{i.titulo}</p>
                  <p className="text-[10px] text-muted">{timeAgo(i.fechaCreacion)}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
