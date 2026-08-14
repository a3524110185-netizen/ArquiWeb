'use client';
import { useState } from 'react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/FormFields';
import { useToast } from '@/components/ui/Toast';
import { Plus, Trash2, Tag, AlertCircle } from 'lucide-react';

const CATEGORIAS_INICIALES = [
  { id: '1', nombre: 'Materiales', color: 'blue' },
  { id: '2', nombre: 'Mano de obra', color: 'emerald' },
  { id: '3', nombre: 'Equipo', color: 'purple' },
  { id: '4', nombre: 'Transporte', color: 'amber' },
  { id: '5', nombre: 'Otros', color: 'gray' }
];

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState(CATEGORIAS_INICIALES);
  const [nueva, setNueva] = useState('');
  const toast = useToast();

  const handleAdd = () => {
    if (!nueva.trim()) return;
    if (categorias.some(c => c.nombre.toLowerCase() === nueva.toLowerCase())) {
      toast.error('La categoría ya existe');
      return;
    }
    const colors = ['blue', 'emerald', 'purple', 'amber', 'rose', 'sky'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setCategorias([...categorias, { id: Date.now().toString(), nombre: nueva, color: randomColor }]);
    setNueva('');
    toast.success('Categoría agregada');
  };

  const handleDelete = (id: string) => {
    setCategorias(categorias.filter(c => c.id !== id));
    toast.success('Categoría eliminada');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 flex items-start gap-3">
        <AlertCircle className="text-sky-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-sky-700 dark:text-sky-400">Configuración Global</p>
          <p className="text-xs text-sky-600 dark:text-sky-300 mt-1">
            Estas categorías se utilizarán en todo el sistema para clasificar los gastos de obra, reportes e incidencias.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Categorías de Gastos / Reportes</CardTitle></CardHeader>
        
        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <Input value={nueva} onChange={e => setNueva(e.target.value)} placeholder="Nombre de la nueva categoría..." onKeyDown={e => e.key === 'Enter' && handleAdd()} />
          </div>
          <Button onClick={handleAdd}><Plus size={16} /> Agregar</Button>
        </div>

        <div className="space-y-2">
          {categorias.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl border border-default bg-app hover:border-sigo-primary-light transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${cat.color}-100 text-${cat.color}-600 dark:bg-${cat.color}-900/30`}>
                  <Tag size={14} />
                </div>
                <span className="text-sm font-medium text-primary">{cat.nombre}</span>
              </div>
              <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
