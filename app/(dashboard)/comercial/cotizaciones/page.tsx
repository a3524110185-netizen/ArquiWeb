'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Search, Plus, FileText, Send, CheckCircle, Download, FileOutput } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function CotizacionesPage() {
  const { cotizaciones, convertirAPedido } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  const filtered = cotizaciones.filter(c =>
    c.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = (num: string) => {
    toast.success('Descargando PDF', `La cotización ${num} se está descargando.`);
  };

  const handleConvert = (id: string) => {
    convertirAPedido(id);
    toast.success('Convertido a Pedido', 'La cotización se ha convertido a Pedido de Venta.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar cotización por número o cliente..."
            className="input-base pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="w-full sm:w-auto">
          <Plus size={18} /> Nueva Cotización
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map(cot => (
          <Card key={cot.id} className="p-0 overflow-hidden">
            <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0">
                  <FileText size={24} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-primary text-base">{cot.numero}</h3>
                    <Badge variant={
                      cot.estado === 'Aceptada' || cot.estado === 'Convertida' ? 'success' :
                      cot.estado === 'Borrador' ? 'gray' :
                      cot.estado === 'Rechazada' ? 'warning' : 'info'
                    }>{cot.estado}</Badge>
                  </div>
                  <p className="text-sm font-medium text-secondary">{cot.clienteNombre}</p>
                  <p className="text-xs text-muted mt-0.5">{cot.proyectoNombre || 'Sin proyecto asignado'}</p>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-1 border-t md:border-t-0 md:border-l border-default pt-4 md:pt-0 md:pl-6">
                <p className="text-2xl font-bold text-primary">
                  ${cot.total.toLocaleString('es-MX')} <span className="text-xs text-muted font-normal">MXN</span>
                </p>
                <p className="text-xs text-secondary">Creada: {new Date(cot.fechaCreacion).toLocaleDateString()}</p>
                <p className="text-xs text-amber-600 dark:text-amber-500">Vence: {new Date(cot.fechaVencimiento).toLocaleDateString()}</p>
              </div>

              <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-default pt-4 md:pt-0 md:pl-6">
                <Button variant="secondary" size="sm" onClick={() => handleDownload(cot.numero)}>
                  <Download size={16} /> PDF
                </Button>
                {cot.estado === 'Borrador' && (
                  <Button size="sm" className="bg-sky-500 hover:bg-sky-600">
                    <Send size={16} /> Enviar
                  </Button>
                )}
                {cot.estado === 'Aceptada' && (
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleConvert(cot.id)}>
                    <FileOutput size={16} /> Convertir a Pedido
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
