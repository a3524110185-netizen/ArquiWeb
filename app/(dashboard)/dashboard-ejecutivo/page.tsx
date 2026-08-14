'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { dashboardService, DashboardEjecutivoApi } from '@/lib/services/dashboard';
import { proyectosService } from '@/lib/services/proyectos';
import { extractErrorMessage } from '@/lib/services/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge, { BadgeVariant } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  LayoutDashboard, DollarSign, AlertTriangle, Boxes, Users, FolderOpen, TrendingUp,
  Loader2, AlertCircle, RefreshCw, ArrowRight,
} from 'lucide-react';

const CHART_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--chart-6)'];

const estadoIncidenciaVariant: Record<string, BadgeVariant> = {
  abierta: 'danger', en_progreso: 'warning', resuelta: 'success', cerrada: 'gray',
};
function estadoIncidenciaLabel(estado: string): string {
  const map: Record<string, string> = {
    abierta: 'Abierta', en_progreso: 'En progreso', resuelta: 'Resuelta', cerrada: 'Cerrada',
  };
  return map[estado] || estado;
}

export default function DashboardEjecutivoPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const rol = currentUser?.rol?.nombre || '';
  const tieneAcceso = rol === 'administrador' || rol === 'gerente';

  const [data, setData] = useState<DashboardEjecutivoApi | null>(null);
  const [avancePromedio, setAvancePromedio] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboard = await dashboardService.obtenerDashboardCompleto();
      setData(dashboard);
      try {
        const proyectos = await proyectosService.getProyectos();
        if (proyectos.length > 0) {
          const promedio = proyectos.reduce((acc, p) => acc + (p.avance ?? p.avance_fisico ?? 0), 0) / proyectos.length;
          setAvancePromedio(Math.round(promedio));
        } else {
          setAvancePromedio(0);
        }
      } catch {
        setAvancePromedio(null);
      }
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Error al cargar el dashboard ejecutivo.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser && !tieneAcceso) { router.replace('/dashboard'); return; }
    if (currentUser) cargar();
  }, [currentUser, tieneAcceso, cargar, router]);

  if (currentUser && !tieneAcceso) return null;

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-sigo-primary" />
        <p className="text-sm text-muted">Cargando dashboard ejecutivo...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-16 text-center space-y-3">
        <AlertCircle className="text-red-500 mx-auto" size={36} />
        <p className="text-sm font-medium text-red-500">{error || 'No se pudo cargar el dashboard.'}</p>
        <button onClick={cargar} className="text-sm text-sigo-primary hover:underline font-medium">Reintentar</button>
      </div>
    );
  }

  const kpis = data.kpis;
  const tendencias = data.tendencias || { labels: [], datasets: [] };
  const distribuciones = data.distribuciones || { labels: [], data: [] };
  const ventas = data.actividad_reciente?.ventas || [];
  const incidencias = data.actividad_reciente?.incidencias || [];

  const tendenciaData = tendencias.labels.map((label, i) => {
    const point: Record<string, string | number> = { label };
    tendencias.datasets.forEach(ds => { point[ds.label] = ds.data[i] ?? 0; });
    return point;
  });

  const distribucionData = distribuciones.labels.map((label, i) => ({
    estado: label, total: distribuciones.data[i] ?? 0,
  }));

  const kpiCards = [
    {
      key: 'ventas_mes', label: 'Ventas del Mes', icon: DollarSign,
      value: formatCurrency(kpis.total_ventas_mes ?? 0), sub: 'Total facturado este mes',
      color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', href: '/comercial/ventas',
    },
    {
      key: 'incidencias_pendientes', label: 'Incidencias Pendientes', icon: AlertTriangle,
      value: String(kpis.incidencias_pendientes ?? 0), sub: 'Abiertas o en progreso',
      color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', href: '/incidencias',
    },
    {
      key: 'stock_bajo', label: 'Materiales Stock Bajo', icon: Boxes,
      value: String(kpis.stock_bajo ?? 0), sub: 'Requieren reabastecimiento',
      color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', href: '/comercial/inventario',
    },
    {
      key: 'total_empleados', label: 'Total Empleados', icon: Users,
      value: String(kpis.total_empleados ?? 0), sub: 'Usuarios activos',
      color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', href: '/usuarios',
    },
    {
      key: 'proyectos_activos', label: 'Proyectos Activos', icon: FolderOpen,
      value: `${kpis.proyectos_activos ?? 0} / ${kpis.total_proyectos ?? 0}`,
      sub: 'En ejecución / total', color: 'text-sigo-primary', bg: 'bg-sigo-primary/10 dark:bg-sigo-primary/20', href: '/proyectos',
    },
    {
      key: 'avance_promedio', label: 'Avance Promedio', icon: TrendingUp,
      value: avancePromedio != null ? `${avancePromedio}%` : '—', sub: 'Físico de proyectos',
      color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/20', href: '/proyectos',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <LayoutDashboard className="text-sigo-primary" size={26} /> Dashboard Ejecutivo
          </h1>
          <p className="text-sm text-muted">Indicadores generales del negocio</p>
        </div>
        <button onClick={cargar} className="inline-flex items-center gap-1.5 text-xs text-sigo-primary hover:text-sigo-primary font-medium transition-colors">
          <RefreshCw size={13} /> Actualizar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map(k => (
          <Link key={k.key} href={k.href}>
            <Card className="p-5 flex items-center gap-4 h-full" hover>
              <div className={`w-12 h-12 rounded-xl ${k.bg} ${k.color} flex items-center justify-center shrink-0`}>
                <k.icon size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted font-medium truncate">{k.label}</p>
                <p className="text-2xl font-bold text-primary mt-0.5">{k.value}</p>
                <p className="text-[10px] mt-0.5 text-muted">{k.sub}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tendencias de ventas */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Ventas — Últimos 6 Meses</CardTitle></CardHeader>
          {tendenciaData.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted">Sin datos de ventas</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={tendenciaData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={(v) => formatCurrency(Number(v))} width={80} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(value: any) => formatCurrency(Number(value))}
                />
                {tendencias.datasets.map((ds, i) => (
                  <Line key={ds.label} type="monotone" dataKey={ds.label}
                    stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Proyectos por estado */}
        <Card>
          <CardHeader><CardTitle>Proyectos por Estado</CardTitle></CardHeader>
          {distribucionData.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted">Sin datos de proyectos</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={distribucionData} layout="vertical" margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <YAxis type="category" dataKey="estado" width={90} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                  {distribucionData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ventas recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Últimas Ventas</CardTitle>
            <Link href="/comercial/ventas" className="text-xs text-sigo-primary hover:underline flex items-center gap-1">
              Ver todas <ArrowRight size={12} />
            </Link>
          </CardHeader>
          <div className="space-y-1">
            {ventas.slice(0, 5).map((v, i) => {
              const contenido = (
                <>
                  <div className="min-w-0">
                    <p className="text-xs font-mono font-medium text-primary group-hover:text-sigo-primary">{v.folio}</p>
                    <p className="text-[10px] text-muted truncate">{v.cliente || '—'} · {formatDate(v.fecha)}</p>
                  </div>
                  <span className="text-xs font-semibold text-primary shrink-0">{formatCurrency(v.total)}</span>
                </>
              );
              return v.id != null ? (
                <Link key={v.id} href={`/comercial/ventas/${v.id}`}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-app transition-colors group">
                  {contenido}
                </Link>
              ) : (
                <div key={`${v.folio}-${i}`} className="flex items-center justify-between gap-3 p-2.5 rounded-xl">
                  {contenido}
                </div>
              );
            })}
            {ventas.length === 0 && <p className="py-8 text-center text-sm text-muted">Sin ventas recientes</p>}
          </div>
        </Card>

        {/* Incidencias recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Últimas Incidencias</CardTitle>
            <Link href="/incidencias" className="text-xs text-sigo-primary hover:underline flex items-center gap-1">
              Ver todas <ArrowRight size={12} />
            </Link>
          </CardHeader>
          <div className="space-y-1">
            {incidencias.slice(0, 5).map((inc, i) => {
              const contenido = (
                <>
                  <Badge variant={estadoIncidenciaVariant[inc.estado] || 'gray'} size="sm">{estadoIncidenciaLabel(inc.estado)}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-primary truncate group-hover:text-sigo-primary">{inc.titulo}</p>
                    <p className="text-[10px] text-muted truncate">{formatDate(inc.fecha)}</p>
                  </div>
                </>
              );
              return inc.id != null ? (
                <Link key={inc.id} href={`/incidencias/${inc.id}`}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-app transition-colors group">
                  {contenido}
                </Link>
              ) : (
                <div key={`${inc.titulo}-${i}`} className="flex items-start gap-3 p-2.5 rounded-xl">
                  {contenido}
                </div>
              );
            })}
            {incidencias.length === 0 && <p className="py-8 text-center text-sm text-muted">Sin incidencias recientes</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
