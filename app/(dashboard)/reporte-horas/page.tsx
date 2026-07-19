'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Search, Download, Clock, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReporteHorasPage() {
  const { horarios } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  const filtered = horarios.filter(h =>
    h.trabajador.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by worker for summary
  const summaryMap = new Map();
  filtered.forEach(h => {
    if (!summaryMap.has(h.trabajadorId)) {
      summaryMap.set(h.trabajadorId, {
        trabajador: h.trabajador,
        horasNormales: 0,
        horasExtras: 0,
        diasTrabajados: 0,
      });
    }
    const data = summaryMap.get(h.trabajadorId);
    data.horasNormales += h.horasNormales;
    data.horasExtras += h.horasExtras;
    if (h.estado === 'Completo') data.diasTrabajados += 1;
  });

  const summaryData = Array.from(summaryMap.values());

  const handleExport = () => {
    toast.success('Reporte Exportado', 'El archivo Excel se está descargando.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar trabajador..."
            className="input-base pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleExport} className="w-full sm:w-auto">
          <Download size={18} /> Exportar Excel
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle>Horas Acumuladas por Trabajador</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summaryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="trabajador" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                <Tooltip
                  cursor={{ fill: 'var(--bg-app)' }}
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                />
                <Bar dataKey="horasNormales" name="Horas Normales" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                <Bar dataKey="horasExtras" name="Horas Extras" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="h-[400px] flex flex-col">
          <CardHeader className="border-b border-default">
            <CardTitle>Resumen Semanal</CardTitle>
          </CardHeader>
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
            {summaryData.map((data, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-default bg-app flex flex-col gap-3">
                <h4 className="font-bold text-primary">{data.trabajador}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-wider mb-1">H. Normales</p>
                    <p className="text-lg font-bold text-blue-600">{data.horasNormales}h</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-wider mb-1">H. Extras</p>
                    <p className="text-lg font-bold text-amber-500">{data.horasExtras}h</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-default/50 flex items-center gap-2 text-xs text-secondary">
                  <Calendar size={14} />
                  <span>{data.diasTrabajados} días laborados</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-default bg-app/50">
          <h3 className="font-semibold text-primary">Detalle de Registros</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-app text-secondary uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Trabajador</th>
                <th className="px-6 py-4 text-center">Entrada / Salida</th>
                <th className="px-6 py-4 text-center">Normales</th>
                <th className="px-6 py-4 text-center">Extras</th>
                <th className="px-6 py-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y border-default">
              {filtered.map(h => (
                <tr key={h.id} className="hover:bg-app transition-colors">
                  <td className="px-6 py-4 text-secondary">{new Date(h.fecha).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium text-primary">{h.trabajador}</td>
                  <td className="px-6 py-4 text-center">
                    {h.entrada ? (
                      <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {h.entrada} - {h.salida || '...'}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-blue-600">{h.horasNormales}</td>
                  <td className="px-6 py-4 text-center font-bold text-amber-500">{h.horasExtras > 0 ? h.horasExtras : '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <Badge variant={
                      h.estado === 'Completo' ? 'success' :
                      h.estado === 'Incompleto' ? 'warning' : 'danger'
                    }>{h.estado}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
