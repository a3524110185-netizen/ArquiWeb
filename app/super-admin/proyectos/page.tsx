'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Search, FolderOpen } from 'lucide-react';

export default function ProyectosGlobalPage() {
  const { proyectos, empresas } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [empresaFilter, setEmpresaFilter] = useState('Todas');

  const filteredProyectos = proyectos.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmpresa = empresaFilter === 'Todas' || p.empresaId === empresaFilter;
    return matchesSearch && matchesEmpresa;
  });

  return (
    <div className="space-y-6">
      <Card className="p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar por nombre de proyecto..."
            className="input-base pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="input-base md:w-64"
          value={empresaFilter}
          onChange={e => setEmpresaFilter(e.target.value)}
        >
          <option value="Todas">Todas las Empresas</option>
          {empresas.map(e => (
            <option key={e.id} value={e.id}>{e.nombre}</option>
          ))}
        </select>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProyectos.map(p => (
          <Card key={p.id} className="flex flex-col hover:border-sigo-primary transition-colors cursor-pointer card-hover">
            <CardHeader className="pb-3 border-b border-default">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <FolderOpen size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate" title={p.nombre}>{p.nombre}</CardTitle>
                  <p className="text-xs text-muted truncate">{p.empresaNombre}</p>
                </div>
              </div>
            </CardHeader>
            <div className="p-5 flex-1 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">Estado</span>
                <Badge variant={
                  p.estado === 'Completado' ? 'success' :
                  p.estado === 'En progreso' ? 'info' :
                  p.estado === 'Pausado' ? 'warning' : 'gray'
                }>{p.estado}</Badge>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-primary">Avance Físico</span>
                  <span className="text-sigo-primary font-bold">{p.avanceFisico}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${p.avanceFisico}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-primary">Avance Financiero</span>
                  <span className="text-emerald-600 font-bold">{p.avanceFinanciero}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill bg-emerald-500" style={{ width: `${p.avanceFinanciero}%` }} />
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-default flex justify-between items-center text-xs text-secondary">
                <span>Presupuesto:</span>
                <span className="font-semibold text-primary">
                  ${p.presupuesto.toLocaleString('es-MX')}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
