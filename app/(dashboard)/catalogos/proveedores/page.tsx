'use client';
import Card from '@/components/ui/Card';
import { Truck } from 'lucide-react';

export default function ProveedoresPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Proveedores</h1>
          <p className="text-sm text-muted">Directorio de proveedores y servicios</p>
        </div>
      </div>

      <Card className="p-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
          <Truck size={32} />
        </div>
        <h2 className="text-xl font-bold text-primary">Módulo en Desarrollo</h2>
        <p className="text-sm text-muted max-w-md mx-auto">
          Estamos conectando con la API para el catálogo de proveedores.
        </p>
      </Card>
    </div>
  );
}
