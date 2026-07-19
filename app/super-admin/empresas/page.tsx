'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Plus, Search, Building2, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import type { Empresa } from '@/types';

export default function EmpresasPage() {
  const { empresas, deleteEmpresa, addEmpresa, updateEmpresa } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const toast = useToast();

  const defaultForm: Partial<Empresa> = {
    nombre: '', rfc: '', direccion: '', telefono: '', email: '',
    estado: 'Activo', plan: 'Básico', fechaVencimiento: new Date().toISOString().split('T')[0],
    usuariosCount: 0, proyectosCount: 0
  };
  const [formData, setFormData] = useState<Partial<Empresa>>(defaultForm);

  const filteredEmpresas = empresas.filter(e =>
    e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.rfc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (emp?: Empresa) => {
    if (emp) {
      setFormData(emp);
      setEditingId(emp.id);
    } else {
      setFormData(defaultForm);
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateEmpresa(editingId, formData);
      toast.success('Empresa actualizada', 'Los datos se guardaron correctamente.');
    } else {
      addEmpresa(formData as Omit<Empresa, 'id'>);
      toast.success('Empresa registrada', 'La empresa fue agregada exitosamente.');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta empresa?')) {
      deleteEmpresa(id);
      toast.success('Empresa eliminada', 'La empresa ha sido eliminada del sistema.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar empresa por nombre o RFC..."
            className="input-base pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto">
          <Plus size={18} /> Nueva Empresa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmpresas.map(empresa => (
          <Card key={empresa.id} className="flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg gradient-brand flex items-center justify-center shrink-0">
                    <Building2 size={20} className="text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{empresa.nombre}</CardTitle>
                    <p className="text-xs text-muted">{empresa.rfc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenModal(empresa)} className="p-1.5 text-secondary hover:text-primary transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(empresa.id)} className="p-1.5 text-secondary hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </CardHeader>
            <div className="px-6 pb-6 flex-1 flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary">Plan:</span>
                <Badge variant="info">{empresa.plan}</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary">Estado:</span>
                <Badge variant={empresa.estado === 'Activo' ? 'success' : 'gray'}>{empresa.estado}</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary">Usuarios:</span>
                <span className="font-medium text-primary">{empresa.usuariosCount}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary">Proyectos:</span>
                <span className="font-medium text-primary">{empresa.proyectosCount}</span>
              </div>
              <div className="mt-auto pt-4 border-t border-default text-xs text-secondary flex flex-col gap-1">
                <p>📞 {empresa.telefono}</p>
                <p>✉️ {empresa.email}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Editar Empresa' : 'Nueva Empresa'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-secondary mb-1">Nombre</label>
              <input required type="text" className="input-base" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">RFC</label>
              <input required type="text" className="input-base" value={formData.rfc} onChange={e => setFormData({ ...formData, rfc: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Teléfono</label>
              <input required type="text" className="input-base" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-secondary mb-1">Email</label>
              <input required type="email" className="input-base" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-secondary mb-1">Dirección</label>
              <input required type="text" className="input-base" value={formData.direccion} onChange={e => setFormData({ ...formData, direccion: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Plan</label>
              <select className="input-base" value={formData.plan} onChange={e => setFormData({ ...formData, plan: e.target.value as any })}>
                <option value="Básico">Básico</option>
                <option value="Profesional">Profesional</option>
                <option value="Empresarial">Empresarial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Estado</label>
              <select className="input-base" value={formData.estado} onChange={e => setFormData({ ...formData, estado: e.target.value as any })}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
