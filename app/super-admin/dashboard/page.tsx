'use client';
import { useStore } from '@/store/useStore';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Building2, Users, FolderOpen, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

export default function SuperAdminDashboard() {
  const { empresas, usuarios, proyectos, incidencias, auditorias } = useStore();

  const kpis = [
    { title: 'Empresas Activas', value: empresas.length, icon: Building2, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/20' },
    { title: 'Usuarios Totales', value: usuarios.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/20' },
    { title: 'Proyectos', value: proyectos.length, icon: FolderOpen, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
    { title: 'Incidencias Globales', value: incidencias.length, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-500/20' },
  ];

  // Prepare chart data
  const chartData = empresas.map(empresa => ({
    name: empresa.nombre,
    Proyectos: proyectos.filter(p => p.empresaId === empresa.id).length,
  }));

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const recentAudits = auditorias.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Card key={i} className="flex items-center gap-4 p-6">
              <div className={`w-12 h-12 rounded-xl ${kpi.bg} flex items-center justify-center shrink-0`}>
                <Icon size={24} className={kpi.color} />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary">{kpi.title}</p>
                <p className="text-2xl font-bold text-primary">{kpi.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle>Proyectos por Empresa</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} allowDecimals={false} />
                <RechartsTooltip
                  cursor={{ fill: 'var(--bg-app)' }}
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="Proyectos" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-[400px]">
          <CardHeader>
            <CardTitle>Actividad Reciente (Auditoría)</CardTitle>
          </CardHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 scrollbar-thin">
            {recentAudits.map(audit => (
              <div key={audit.id} className="flex flex-col gap-1 border-b border-default pb-4 last:border-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">{audit.usuarioNombre}</span>
                  <span className="text-xs text-muted">{new Date(audit.fecha).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-sigo-primary/10 text-sigo-primary dark:bg-sigo-primary/30 dark:text-sigo-primary-light">
                    {audit.accion.toUpperCase()}
                  </span>
                  <span className="text-xs text-secondary">{audit.recurso}</span>
                </div>
                <p className="text-sm text-secondary mt-1">{audit.detalle}</p>
                {audit.empresaNombre && <p className="text-xs text-muted">Empresa: {audit.empresaNombre}</p>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
