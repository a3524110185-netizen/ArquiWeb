'use client';
import { useStore } from '@/store/useStore';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

export default function VentasPage() {
  const { ventas } = useStore();

  const totalVentas = ventas.reduce((acc, v) => acc + v.total, 0);
  const ventasCobradas = ventas.filter(v => v.estado === 'Pagada').reduce((acc, v) => acc + v.total, 0);
  const ventasPendientes = ventas.filter(v => v.estado === 'Pendiente').reduce((acc, v) => acc + v.total, 0);

  // Group by month for chart (simulated)
  const chartData = [
    { name: 'Ene', total: 1200000 },
    { name: 'Feb', total: 1900000 },
    { name: 'Mar', total: 1500000 },
    { name: 'Abr', total: 2800000 },
    { name: 'May', total: totalVentas }, // Current month simulated
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center shrink-0">
            <TrendingUp size={24} className="text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-secondary">Ventas Totales (Mes)</p>
            <p className="text-2xl font-bold text-primary">${totalVentas.toLocaleString('es-MX')}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
            <DollarSign size={24} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-secondary">Cobrado</p>
            <p className="text-2xl font-bold text-emerald-600">${ventasCobradas.toLocaleString('es-MX')}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
            <Calendar size={24} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-secondary">Por Cobrar</p>
            <p className="text-2xl font-bold text-amber-600">${ventasPendientes.toLocaleString('es-MX')}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2 h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle>Histórico de Ventas</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} tickFormatter={v => `$${v/1000000}M`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <RechartsTooltip
                  formatter={(value) => [`$${Number(value).toLocaleString('es-MX')}`, 'Total']}
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="total" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* List */}
        <Card className="h-[400px] flex flex-col">
          <CardHeader className="border-b border-default">
            <CardTitle>Últimas Facturas</CardTitle>
          </CardHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {ventas.map(v => (
              <div key={v.id} className="flex flex-col gap-2 p-3 rounded-xl border border-default bg-app">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primary">{v.numero}</span>
                  <Badge variant={v.estado === 'Pagada' ? 'success' : v.estado === 'Pendiente' ? 'warning' : 'gray'}>
                    {v.estado}
                  </Badge>
                </div>
                <p className="text-xs font-medium text-secondary truncate">{v.clienteNombre}</p>
                <div className="flex justify-between items-center mt-1 pt-2 border-t border-default/50">
                  <span className="text-[10px] text-muted">{new Date(v.fechaVenta).toLocaleDateString()}</span>
                  <span className="font-bold text-brand-600">${v.total.toLocaleString('es-MX')}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
