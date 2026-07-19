'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Search, ShoppingCart, Truck, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function PedidosPage() {
  const { pedidos, updatePedido } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  const filtered = pedidos.filter(p =>
    p.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avanzarEstado = (id: string, actual: string) => {
    let nuevo: any = 'Pendiente';
    if (actual === 'Pendiente') nuevo = 'Confirmado';
    else if (actual === 'Confirmado') nuevo = 'En Proceso';
    else if (actual === 'En Proceso') nuevo = 'Entregado';
    
    updatePedido(id, { estado: nuevo });
    toast.success('Estado actualizado', `El pedido ahora está: ${nuevo}`);
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar pedido..."
            className="input-base pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-default text-secondary">
              <th className="py-3 px-4 font-semibold">Pedido</th>
              <th className="py-3 px-4 font-semibold">Cliente / Proyecto</th>
              <th className="py-3 px-4 font-semibold">Fecha Entrega</th>
              <th className="py-3 px-4 font-semibold text-right">Total</th>
              <th className="py-3 px-4 font-semibold text-center">Estado</th>
              <th className="py-3 px-4 font-semibold text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y border-default">
            {filtered.map(ped => (
              <tr key={ped.id} className="hover:bg-app transition-colors bg-card">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={16} className="text-brand-500" />
                    <span className="font-bold text-primary">{ped.numero}</span>
                  </div>
                  {ped.cotizacionId && <span className="text-[10px] text-muted">Ref: {ped.cotizacionId}</span>}
                </td>
                <td className="py-4 px-4">
                  <p className="font-medium text-primary">{ped.clienteNombre}</p>
                  <p className="text-xs text-muted">{ped.proyectoNombre || 'N/A'}</p>
                </td>
                <td className="py-4 px-4 text-secondary">
                  {new Date(ped.fechaEntrega).toLocaleDateString()}
                </td>
                <td className="py-4 px-4 text-right font-bold text-primary">
                  ${ped.total.toLocaleString('es-MX')}
                </td>
                <td className="py-4 px-4 text-center">
                  <Badge variant={
                    ped.estado === 'Entregado' ? 'success' :
                    ped.estado === 'En Proceso' ? 'info' :
                    ped.estado === 'Confirmado' ? 'warning' : 'gray'
                  }>{ped.estado}</Badge>
                </td>
                <td className="py-4 px-4 text-right">
                  {ped.estado !== 'Entregado' && ped.estado !== 'Cancelado' && (
                    <Button size="sm" onClick={() => avanzarEstado(ped.id, ped.estado)}>
                      Avanzar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
