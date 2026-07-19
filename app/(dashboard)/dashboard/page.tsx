'use client';
import { useStore } from '@/store/useStore';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge, { severidadVariant, proyectoEstadoVariant } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  FolderOpen, AlertTriangle, Clock, DollarSign,
  TrendingUp, TrendingDown, ArrowRight, CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

// KPI Card
function KpiCard({ title, value, subtitle, icon: Icon, trend, color }: {
  title: string; value: string; subtitle?: string;
  icon: React.ElementType; trend?: { value: number; label: string }; color: string;
}) {
  const positive = trend && trend.value >= 0;
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -translate-y-8 translate-x-8`}
        style={{ background: color }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-secondary mb-1">{title}</p>
          <p className="text-2xl font-bold text-primary">{value}</p>
          {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: color + '20' }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-default">
          {positive
            ? <TrendingUp size={12} className="text-emerald-500" />
            : <TrendingDown size={12} className="text-red-500" />}
          <span className={`text-xs font-medium ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
            {positive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-xs text-muted">{trend.label}</span>
        </div>
      )}
    </Card>
  );
}

const COLORS = ['#2563EB', '#0EA5E9', '#7C3AED', '#059669', '#D97706'];

export default function DashboardPage() {
  const { proyectos, incidencias, gastos, horarios } = useStore();

  const proyectosActivos = proyectos.filter(p => p.estado === 'En progreso').length;
  const incidenciasCriticas = incidencias.filter(i => (i.severidad === 'Crítica' || i.severidad === 'Alta') && i.estado !== 'Cerrado' && i.estado !== 'Resuelto').length;
  const gastosTotal = gastos.reduce((acc, g) => acc + g.monto, 0);
  const horasHoy = horarios.filter(h => h.fecha === '2025-05-30').reduce((acc, h) => acc + h.horasNormales + h.horasExtras, 0);

  // Avance físico vs financiero
  const avanceData = proyectos.map(p => ({
    name: p.nombre.split(' ').slice(0, 2).join(' '),
    físico: p.avanceFisico,
    financiero: p.avanceFinanciero,
  }));

  // Tendencia 7 días (simulada)
  const tendenciaData = [
    { dia: 'Lun', incidencias: 1, reportes: 3 },
    { dia: 'Mar', incidencias: 2, reportes: 4 },
    { dia: 'Mié', incidencias: 0, reportes: 5 },
    { dia: 'Jue', incidencias: 3, reportes: 2 },
    { dia: 'Vie', incidencias: 1, reportes: 6 },
    { dia: 'Sáb', incidencias: 0, reportes: 1 },
    { dia: 'Hoy', incidencias: 2, reportes: 3 },
  ];

  // Gastos por categoría
  const gastosCat: Record<string, number> = {};
  gastos.forEach(g => { gastosCat[g.categoria] = (gastosCat[g.categoria] ?? 0) + g.monto; });
  const gastosChartData = Object.entries(gastosCat).map(([name, value]) => ({ name, value }));

  const incCriticas = incidencias.filter(i => i.severidad === 'Crítica' || i.severidad === 'Alta').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Proyectos Activos" value={`${proyectosActivos}`} subtitle={`${proyectos.length} en total`}
          icon={FolderOpen} color="#2563EB" trend={{ value: 0, label: 'sin cambios' }} />
        <KpiCard title="Incidencias Críticas/Alta" value={`${incidenciasCriticas}`} subtitle="Sin resolver"
          icon={AlertTriangle} color="#EF4444" trend={{ value: -1, label: 'vs ayer' }} />
        <KpiCard title="Horas Trabajadas Hoy" value={`${horasHoy}h`} subtitle="3 trabajadores"
          icon={Clock} color="#0EA5E9" trend={{ value: 5, label: 'vs promedio' }} />
        <KpiCard title="Gastos del Mes" value={formatCurrency(gastosTotal)} subtitle="Todos los proyectos"
          icon={DollarSign} color="#7C3AED" trend={{ value: 12, label: 'vs mes anterior' }} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Avance físico vs financiero */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Avance Físico vs Financiero (%)</CardTitle>
            <span className="text-xs text-muted">Por proyecto</span>
          </CardHeader>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={avanceData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                formatter={(v: any) => [`${v}%`]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="físico" fill="#2563EB" radius={[4, 4, 0, 0]} name="Físico" />
              <Bar dataKey="financiero" fill="#0EA5E9" radius={[4, 4, 0, 0]} name="Financiero" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Gastos por categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoría</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={gastosChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                dataKey="value" nameKey="name" paddingAngle={3}>
                {gastosChartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                formatter={(v: any) => [formatCurrency(v)]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {gastosChartData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-secondary">{d.name}</span>
                </div>
                <span className="font-medium text-primary">{formatCurrency(d.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tendencia + Incidencias */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tendencia 7 días */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tendencia Semanal</CardTitle>
            <span className="text-xs text-muted">Últimos 7 días</span>
          </CardHeader>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={tendenciaData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="incidencias" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} name="Incidencias" />
              <Line type="monotone" dataKey="reportes" stroke="#2563EB" strokeWidth={2} dot={{ r: 4 }} name="Reportes" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Incidencias críticas */}
        <Card>
          <CardHeader>
            <CardTitle>Incidencias Críticas/Alta</CardTitle>
            <Link href="/incidencias-criticas" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
              Ver todas <ArrowRight size={12} />
            </Link>
          </CardHeader>
          <div className="space-y-3">
            {incCriticas.map(inc => (
              <Link key={inc.id} href={`/incidencias/${inc.id}`}
                className="block p-3 rounded-lg bg-app hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-medium text-primary truncate">{inc.titulo}</p>
                  <Badge variant={severidadVariant(inc.severidad)} size="sm">{inc.severidad}</Badge>
                </div>
                <p className="text-[10px] text-muted">{inc.proyecto}</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Proyectos resumen */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Proyectos</CardTitle>
          <Link href="/proyectos/p1" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
            Ver detalle <ArrowRight size={12} />
          </Link>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-default">
                {['Proyecto', 'Responsable', 'Avance Físico', 'Avance Financiero', 'Estado', 'Fecha Fin'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0 last:pr-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {proyectos.map(p => (
                <tr key={p.id} className="border-b border-default last:border-0 hover:bg-app transition-colors">
                  <td className="py-3 px-3 pl-0">
                    <p className="text-xs font-medium text-primary">{p.nombre}</p>
                  </td>
                  <td className="py-3 px-3 text-xs text-secondary">{p.responsable}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="progress-bar w-24 flex-shrink-0">
                        <div className="progress-fill" style={{ width: `${p.avanceFisico}%` }} />
                      </div>
                      <span className="text-xs font-medium text-primary">{p.avanceFisico}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="progress-bar w-24 flex-shrink-0">
                        <div className="progress-fill" style={{ width: `${p.avanceFinanciero}%`, background: 'linear-gradient(90deg, #7C3AED, #0EA5E9)' }} />
                      </div>
                      <span className="text-xs font-medium text-primary">{p.avanceFinanciero}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={proyectoEstadoVariant(p.estado)} dot>{p.estado}</Badge>
                  </td>
                  <td className="py-3 px-3 pr-0 text-xs text-secondary">{formatDate(p.fechaFin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
