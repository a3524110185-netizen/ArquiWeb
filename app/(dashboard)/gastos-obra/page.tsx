'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/FormFields';
import Pagination, { usePagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Plus, Search, Trash2, FileDown, Filter } from 'lucide-react';
import type { GastoCategoria } from '@/types';

const CATEGORIAS: GastoCategoria[] = ['Materiales', 'Mano de obra', 'Equipo', 'Transporte', 'Otros'];
const COLORS = ['#2563EB', '#0EA5E9', '#7C3AED', '#059669', '#D97706'];
const PER_PAGE = 8;

const emptyForm = { proyecto: '', proyectoId: '', categoria: 'Materiales' as GastoCategoria, monto: '', fecha: '', descripcion: '', capturista: 'Luis Pérez' };

export default function GastosObraPage() {
  const { gastos, proyectos, addGasto, deleteGasto } = useStore();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [filterProyecto, setFilterProyecto] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = gastos.filter(g => {
    const q = search.toLowerCase();
    const matchQ = g.proyecto.toLowerCase().includes(q) || g.descripcion.toLowerCase().includes(q);
    const matchP = !filterProyecto || g.proyectoId === filterProyecto;
    const matchC = !filterCategoria || g.categoria === filterCategoria;
    return matchQ && matchP && matchC;
  });

  const { page, setPage, totalPages, paged, totalItems } = usePagination(filtered, PER_PAGE);

  const totalFiltrado = filtered.reduce((acc, g) => acc + g.monto, 0);

  const gastosChartCat: Record<string, number> = {};
  filtered.forEach(g => { gastosChartCat[g.categoria] = (gastosChartCat[g.categoria] ?? 0) + g.monto; });
  const pieData = Object.entries(gastosChartCat).map(([name, value]) => ({ name, value }));

  const gastosPorProyecto = proyectos.map(p => ({
    name: p.nombre.split(' ').slice(0, 2).join(' '),
    total: gastos.filter(g => g.proyectoId === p.id).reduce((a, g) => a + g.monto, 0),
  })).filter(p => p.total > 0);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.proyectoId) e.proyecto = 'Selecciona un proyecto';
    if (!form.monto || Number(form.monto) <= 0) e.monto = 'Ingresa un monto válido';
    if (!form.fecha) e.fecha = 'Selecciona una fecha';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const proy = proyectos.find(p => p.id === form.proyectoId);
    addGasto({ proyecto: proy?.nombre ?? '', proyectoId: form.proyectoId, categoria: form.categoria, monto: Number(form.monto), fecha: form.fecha, descripcion: form.descripcion, capturista: form.capturista });
    toast.success('Gasto registrado', formatCurrency(Number(form.monto)));
    setForm({ ...emptyForm }); setShowForm(false);
  };

  const f = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleExport = () => {
    const csv = ['Proyecto,Categoria,Monto,Fecha,Descripcion', ...filtered.map(g => `"${g.proyecto}",${g.categoria},${g.monto},${g.fecha},"${g.descripcion}"`)].join('\n');
    console.log('CSV Export:\n', csv);
    toast.info('Exportación simulada', 'Ver consola del navegador');
  };

  const catVariant = (c: string) => {
    const m: Record<string, 'default' | 'info' | 'purple' | 'success' | 'warning'> = { 'Materiales': 'default', 'Mano de obra': 'info', 'Equipo': 'purple', 'Transporte': 'success', 'Otros': 'warning' };
    return m[c] ?? 'gray';
  };

  return (
    <div className="space-y-4">
      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Gastos por Categoría</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [formatCurrency(v)]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-secondary truncate">{d.name}</span>
                <span className="ml-auto font-medium text-primary">{formatCurrency(d.value)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Gastos por Proyecto</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={gastosPorProyecto} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} width={80} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [formatCurrency(v)]} />
              <Bar dataKey="total" fill="#2563EB" radius={[0, 4, 4, 0]} name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Form + Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Registro de Gastos</CardTitle>
            <p className="text-xs text-muted mt-0.5">Total: <span className="font-semibold text-brand-600">{formatCurrency(totalFiltrado)}</span></p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleExport}><FileDown size={14} /> CSV</Button>
            <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus size={14} /> Nuevo Gasto</Button>
          </div>
        </CardHeader>

        {showForm && (
          <div className="mb-4 p-4 rounded-xl bg-app border border-default">
            <p className="text-sm font-semibold text-primary mb-3">Registrar Nuevo Gasto</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <Select label="Proyecto" options={proyectos.map(p => ({ value: p.id, label: p.nombre }))} placeholder="Seleccionar proyecto"
                  value={form.proyectoId} onChange={e => f('proyectoId', e.target.value)} error={errors.proyecto} />
              </div>
              <Select label="Categoría" options={CATEGORIAS.map(c => ({ value: c, label: c }))} value={form.categoria} onChange={e => f('categoria', e.target.value)} />
              <Input label="Monto ($)" type="number" value={form.monto} onChange={e => f('monto', e.target.value)} error={errors.monto} placeholder="0.00" />
              <Input label="Fecha" type="date" value={form.fecha} onChange={e => f('fecha', e.target.value)} error={errors.fecha} />
              <div className="sm:col-span-2">
                <Input label="Descripción" value={form.descripcion} onChange={e => f('descripcion', e.target.value)} placeholder="Descripción del gasto..." />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button onClick={handleSubmit}>Registrar Gasto</Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input-base pl-9" placeholder="Buscar..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="input-base sm:w-48" value={filterProyecto} onChange={e => { setFilterProyecto(e.target.value); setPage(1); }}>
            <option value="">Todos los proyectos</option>
            {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
          <select className="input-base sm:w-36" value={filterCategoria} onChange={e => { setFilterCategoria(e.target.value); setPage(1); }}>
            <option value="">Todas</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-default">
                {['Proyecto', 'Categoría', 'Monto', 'Fecha', 'Descripción', 'Capturista', ''].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(g => (
                <tr key={g.id} className="border-b border-default last:border-0 hover:bg-app transition-colors">
                  <td className="py-3 pl-0 px-3 text-xs font-medium text-primary max-w-[150px] truncate">{g.proyecto}</td>
                  <td className="py-3 px-3"><Badge variant={catVariant(g.categoria)}>{g.categoria}</Badge></td>
                  <td className="py-3 px-3 text-xs font-semibold text-primary">{formatCurrency(g.monto)}</td>
                  <td className="py-3 px-3 text-xs text-secondary">{formatDate(g.fecha)}</td>
                  <td className="py-3 px-3 text-xs text-secondary max-w-[200px] truncate">{g.descripcion}</td>
                  <td className="py-3 px-3 text-xs text-secondary">{g.capturista}</td>
                  <td className="py-3 px-3">
                    <button onClick={() => { deleteGasto(g.id); toast.success('Gasto eliminado'); }}
                      className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-sm text-muted">No se encontraron gastos</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={totalItems} itemsPerPage={PER_PAGE} />
      </Card>
    </div>
  );
}
