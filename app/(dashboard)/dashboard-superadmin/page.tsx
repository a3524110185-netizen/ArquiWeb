'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { superadminService } from '@/lib/services/superadmin';
import type { EstadisticasGlobales } from '@/types';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Building2,
  Users,
  FolderOpen,
  DollarSign,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

const ESTADO_COLORS: Record<string, string> = {
  Activo: '#10b981',
  Activa: '#10b981',
  Inactivo: '#ef4444',
  Inactiva: '#ef4444',
};

const ROL_COLORS = ['#6366f1', '#0ea5e9', '#f59e0b', '#10b981', '#a855f7', '#64748b'];

export default function DashboardSuperadminPage() {
  const { currentUser, isLoading } = useAuthStore();
  const router = useRouter();

  const [stats, setStats] = useState<EstadisticasGlobales | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (currentUser && currentUser.rol.nombre !== 'superadmin') {
      router.replace('/dashboard');
    }
  }, [isLoading, currentUser, router]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await superadminService.getEstadisticas();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'No se pudieron cargar las estadísticas globales.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.rol.nombre === 'superadmin') fetchStats();
  }, [currentUser, fetchStats]);

  if (isLoading || !currentUser || currentUser.rol.nombre !== 'superadmin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-800 via-slate-900 to-black text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold">Panel de Superadministración</h1>
        <p className="mt-2 text-slate-300 text-sm sm:text-base">
          Visión global de todas las empresas registradas en SIGO.
        </p>
      </div>

      {error ? (
        <Card className="p-8 text-center space-y-3 border-red-200 dark:border-red-900/30">
          <AlertCircle className="text-red-500 mx-auto" size={32} />
          <p className="text-sm font-medium text-red-500">{error}</p>
          <button onClick={fetchStats} className="text-sm text-brand-600 hover:underline font-medium inline-flex items-center gap-1.5">
            <RefreshCw size={14} /> Reintentar
          </button>
        </Card>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 flex items-center justify-center shrink-0">
                <Building2 size={24} />
              </div>
              <div>
                <p className="text-xs text-muted font-medium">Total Empresas</p>
                <p className="text-2xl font-bold text-primary mt-0.5">
                  {loading ? <Loader2 size={18} className="animate-spin text-muted" /> : stats?.total_empresas ?? 0}
                </p>
                <p className="text-[10px] text-muted">{stats?.empresas_activas ?? 0} activas</p>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center shrink-0">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs text-muted font-medium">Total Usuarios</p>
                <p className="text-2xl font-bold text-primary mt-0.5">
                  {loading ? <Loader2 size={18} className="animate-spin text-muted" /> : stats?.total_usuarios ?? 0}
                </p>
                <p className="text-[10px] text-muted">En todas las empresas</p>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 flex items-center justify-center shrink-0">
                <FolderOpen size={24} />
              </div>
              <div>
                <p className="text-xs text-muted font-medium">Total Proyectos</p>
                <p className="text-2xl font-bold text-primary mt-0.5">
                  {loading ? <Loader2 size={18} className="animate-spin text-muted" /> : stats?.total_proyectos ?? 0}
                </p>
                <p className="text-[10px] text-muted">Registrados en la plataforma</p>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-xs text-muted font-medium">Total Ventas</p>
                <p className="text-xl font-bold text-primary mt-0.5">
                  {loading ? <Loader2 size={18} className="animate-spin text-muted" /> : formatCurrency(stats?.total_ventas ?? 0)}
                </p>
                <p className="text-[10px] text-muted">Acumulado global</p>
              </div>
            </Card>
          </div>

          {/* Gráficas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-6">
              <CardHeader className="p-0 pb-4 border-b border-default">
                <CardTitle className="text-base">Empresas por Estado</CardTitle>
              </CardHeader>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-muted" />
                </div>
              ) : !stats?.empresas_por_estado?.length ? (
                <p className="text-sm text-muted text-center py-16">Sin datos disponibles.</p>
              ) : (
                <div className="h-64 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.empresas_por_estado}
                        dataKey="total"
                        nameKey="estado"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {stats.empresas_por_estado.map((entry, index) => (
                          <Cell key={entry.estado} fill={ESTADO_COLORS[entry.estado] ?? ROL_COLORS[index % ROL_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <CardHeader className="p-0 pb-4 border-b border-default">
                <CardTitle className="text-base">Usuarios por Rol</CardTitle>
              </CardHeader>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-muted" />
                </div>
              ) : !stats?.usuarios_por_rol?.length ? (
                <p className="text-sm text-muted text-center py-16">Sin datos disponibles.</p>
              ) : (
                <div className="h-64 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.usuarios_por_rol}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="rol" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <RechartsTooltip />
                      <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                        {stats.usuarios_por_rol.map((entry, index) => (
                          <Cell key={entry.rol} fill={ROL_COLORS[index % ROL_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
