'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { gastosObraService, GastoObraApi, ResumenGastosApi } from '@/lib/services/gastosObra';
import { categoriasGastoService, CategoriaGastoApi } from '@/lib/services/categoriasGasto';
import { proyectosService, ProyectoApi } from '@/lib/services/proyectos';
import { extractErrorMessage } from '@/lib/services/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Select } from '@/components/ui/FormFields';
import Pagination from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Plus, Search, Trash2, Paperclip, Loader2, AlertCircle, DollarSign } from 'lucide-react';

const CHART_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--chart-6)'];
const PER_PAGE_FALLBACK = 10;

export default function GastosObraPage() {
  const router = useRouter();
  const toast = useToast();
  const { currentUser } = useAuthStore();
  const rol = currentUser?.rol?.nombre || '';
  const canManage = rol === 'administrador' || rol === 'gerente';

  const [gastos, setGastos] = useState<GastoObraApi[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: PER_PAGE_FALLBACK });
  const [categorias, setCategorias] = useState<CategoriaGastoApi[]>([]);
  const [proyectos, setProyectos] = useState<ProyectoApi[]>([]);
  const [resumen, setResumen] = useState<ResumenGastosApi | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');
  const [filtroProyecto, setFiltroProyecto] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const [confirmEliminar, setConfirmEliminar] = useState<GastoObraApi | null>(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    Promise.all([
      categoriasGastoService.listar().catch(() => []),
      proyectosService.getProyectos().catch(() => []),
    ]).then(([c, p]) => { setCategorias(c); setProyectos(p); });
  }, []);

  const cargarGastos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await gastosObraService.listar({
        proyecto_id: filtroProyecto || undefined,
        categoria_id: filtroCategoria || undefined,
        desde: desde || undefined,
        hasta: hasta || undefined,
        search: search || undefined,
        page,
      });
      setGastos(resultado.data);
      setMeta(resultado.meta);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Error al cargar los gastos.'));
    } finally {
      setLoading(false);
    }
  }, [filtroProyecto, filtroCategoria, desde, hasta, search, page]);

  useEffect(() => { cargarGastos(); }, [cargarGastos]);

  useEffect(() => {
    gastosObraService.resumen({ proyecto_id: filtroProyecto || undefined, desde: desde || undefined, hasta: hasta || undefined })
      .then(setResumen).catch(() => setResumen(null));
  }, [filtroProyecto, desde, hasta]);

  const handleEliminar = async () => {
    if (!confirmEliminar) return;
    setEliminando(true);
    try {
      await gastosObraService.eliminar(confirmEliminar.id);
      toast.success('Gasto eliminado');
      setConfirmEliminar(null);
      cargarGastos();
    } catch (err: any) {
      toast.error('Error', extractErrorMessage(err, 'No se pudo eliminar el gasto'));
    } finally {
      setEliminando(false);
    }
  };

  const pieData = (resumen?.por_categoria || []).map(item => ({
    name: item.categoria, value: item.total,
  }));
  const barData = (resumen?.por_proyecto || []).map(item => ({
    name: item.proyecto, total: item.total,
  }));

  return (
    <div className="space-y-4">
      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Gastos por Categoría</CardTitle></CardHeader>
          {pieData.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted">Sin datos</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [formatCurrency(Number(v))]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-secondary truncate">{d.name}</span>
                    <span className="ml-auto font-medium text-primary">{formatCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card>
          <CardHeader><CardTitle>Gastos por Proyecto</CardTitle></CardHeader>
          {barData.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted">Sin datos</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} width={90} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [formatCurrency(Number(v))]} />
                <Bar dataKey="total" fill="var(--chart-1)" radius={[0, 4, 4, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Listado */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-4 sm:p-6">
          <CardHeader>
            <div>
              <CardTitle>Registro de Gastos</CardTitle>
              <p className="text-xs text-muted mt-0.5">
                Total: <span className="font-semibold text-brand-600">{formatCurrency(resumen?.total_general ?? gastos.reduce((a, g) => a + g.monto, 0))}</span>
              </p>
            </div>
            {canManage && (
              <Button size="sm" onClick={() => router.push('/gastos-obra/nuevo')}><Plus size={14} /> Nuevo Gasto</Button>
            )}
          </CardHeader>

          {/* Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
            <div className="relative lg:col-span-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input className="input-base pl-9" placeholder="Buscar..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <Select placeholder="Todos los proyectos" value={filtroProyecto}
              onChange={e => { setFiltroProyecto(e.target.value); setPage(1); }}
              options={proyectos.map(p => ({ value: String(p.id), label: p.nombre }))} />
            <Select placeholder="Todas las categorías" value={filtroCategoria}
              onChange={e => { setFiltroCategoria(e.target.value); setPage(1); }}
              options={categorias.map(c => ({ value: String(c.id), label: c.nombre }))} />
            <input type="date" className="input-base" value={desde} placeholder="Desde"
              onChange={e => { setDesde(e.target.value); setPage(1); }} />
            <input type="date" className="input-base" value={hasta} placeholder="Hasta"
              onChange={e => { setHasta(e.target.value); setPage(1); }} />
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 size={28} className="animate-spin text-brand-600" />
              <p className="text-sm text-muted">Cargando gastos...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center space-y-3">
              <AlertCircle className="text-red-500 mx-auto" size={36} />
              <p className="text-sm font-medium text-red-500">{error}</p>
              <button onClick={cargarGastos} className="text-sm text-brand-600 hover:underline font-medium">Reintentar</button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-default">
                      {['Proyecto', 'Categoría', 'Monto', 'Fecha', 'Descripción', 'Comprobante', 'Capturista', ''].map(h => (
                        <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gastos.map(g => (
                      <tr key={g.id} onClick={() => router.push(`/gastos-obra/${g.id}`)}
                        className="border-b border-default last:border-0 hover:bg-app transition-colors cursor-pointer">
                        <td className="py-3 pl-0 px-3 text-xs font-medium text-primary max-w-[150px] truncate">{g.proyecto?.nombre || '—'}</td>
                        <td className="py-3 px-3"><Badge variant="default">{g.categoria?.nombre || '—'}</Badge></td>
                        <td className="py-3 px-3 text-xs font-semibold text-primary">{formatCurrency(g.monto)}</td>
                        <td className="py-3 px-3 text-xs text-secondary">{formatDate(g.fecha)}</td>
                        <td className="py-3 px-3 text-xs text-secondary max-w-[200px] truncate">{g.descripcion || '—'}</td>
                        <td className="py-3 px-3">
                          {g.comprobante_url ? <Paperclip size={14} className="text-brand-600" /> : <span className="text-muted">—</span>}
                        </td>
                        <td className="py-3 px-3 text-xs text-secondary">{g.usuario?.nombre || '—'}</td>
                        <td className="py-3 px-3">
                          {canManage && (
                            <button onClick={(e) => { e.stopPropagation(); setConfirmEliminar(g); }}
                              className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {gastos.length === 0 && (
                      <tr><td colSpan={8} className="py-12 text-center text-sm text-muted">
                        <DollarSign className="mx-auto mb-2 text-muted" size={24} />
                        No se encontraron gastos
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="pt-2">
                <Pagination page={meta.current_page} totalPages={meta.last_page} onPageChange={setPage}
                  totalItems={meta.total} itemsPerPage={meta.per_page} />
              </div>
            </>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={!!confirmEliminar} onClose={() => setConfirmEliminar(null)} onConfirm={handleEliminar}
        title="Eliminar gasto"
        message={`¿Estás seguro de que deseas eliminar este gasto de ${confirmEliminar ? formatCurrency(confirmEliminar.monto) : ''}? Esta acción no se puede deshacer.`}
        confirmLabel={eliminando ? 'Eliminando...' : 'Eliminar'}
        variant="danger"
      />
    </div>
  );
}
