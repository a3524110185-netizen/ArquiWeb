'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Search, AlertTriangle, Package, TrendingDown } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function InventarioPage() {
  const { materiales } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = materiales.filter(m =>
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const criticos = materiales.filter(m => m.estado === 'Crítico');
  const bajos = materiales.filter(m => m.estado === 'Bajo');

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {(criticos.length > 0 || bajos.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criticos.length > 0 && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-4">
              <AlertTriangle className="text-red-500 shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-red-700 dark:text-red-400">Stock Crítico</h4>
                <p className="text-sm text-red-600 dark:text-red-300">
                  {criticos.length} materiales requieren reabastecimiento urgente.
                </p>
              </div>
            </div>
          )}
          {bajos.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center gap-4">
              <TrendingDown className="text-amber-500 shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-amber-700 dark:text-amber-400">Stock Bajo</h4>
                <p className="text-sm text-amber-600 dark:text-amber-300">
                  {bajos.length} materiales por debajo del mínimo recomendado.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <Card className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar material o categoría..."
            className="input-base pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="secondary">Exportar Inventario</Button>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-app text-secondary uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Material</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4 text-right">Stock Actual</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Valor Inventario</th>
              </tr>
            </thead>
            <tbody className="divide-y border-default">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-app transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                        <Package size={16} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-primary">{m.nombre}</p>
                        <p className="text-[10px] text-muted">Proveedor: {m.proveedor}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-secondary">{m.categoria}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-bold text-primary">{m.stock} {m.unidad}</div>
                    <div className="text-[10px] text-muted">Min: {m.stockMinimo}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant={
                      m.estado === 'Normal' ? 'success' :
                      m.estado === 'Bajo' ? 'warning' : 'danger'
                    }>{m.estado}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-brand-600">
                    ${(m.stock * m.precio).toLocaleString('es-MX')}
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
