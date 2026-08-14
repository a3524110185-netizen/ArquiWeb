'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { materialesService, MaterialApi } from '@/lib/services/materiales';
import { proveedoresService, ProveedorApi } from '@/lib/services/proveedores';
import { extractErrorMessage } from '@/lib/services/api';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Select } from '@/components/ui/FormFields';
import Pagination, { usePagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/utils';
import { Plus, Search, Trash2, Loader2, AlertCircle, Package, Lock } from 'lucide-react';

const PER_PAGE = 8;

export default function MaterialesPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const canEdit = currentUser?.rol?.nombre === 'administrador';
  const toast = useToast();

  const [materiales, setMateriales] = useState<MaterialApi[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filtroProveedor, setFiltroProveedor] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const cargarMateriales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await materialesService.getMateriales();
      setMateriales(data);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Error al cargar los materiales.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarMateriales(); }, [cargarMateriales]);
  useEffect(() => { proveedoresService.getProveedores().then(setProveedores).catch(() => {}); }, []);

  const filtered = useMemo(() => materiales.filter(m => {
    const q = search.toLowerCase();
    const matchQ = m.nombre.toLowerCase().includes(q) || m.codigo.toLowerCase().includes(q);
    const matchProveedor = !filtroProveedor || String(m.proveedor_id) === filtroProveedor;
    return matchQ && matchProveedor;
  }), [materiales, search, filtroProveedor]);

  const { page, setPage, totalPages, paged, totalItems } = usePagination(filtered, PER_PAGE);

  const handleDesactivar = async (id: number) => {
    setDeleting(true);
    try {
      await materialesService.toggleActivo(id, false);
      toast.success('Material desactivado');
      cargarMateriales();
    } catch (err: any) {
      toast.error('Error', extractErrorMessage(err, 'No se pudo desactivar el material'));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const stockBadge = (m: MaterialApi) =>
    m.stock_actual <= m.stock_minimo
      ? <Badge variant="danger" dot>Bajo</Badge>
      : <Badge variant="success" dot>Normal</Badge>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Materiales</CardTitle>
          {canEdit ? (
            <Button onClick={() => router.push('/catalogos/materiales/nuevo')}><Plus size={16} /> Nuevo Material</Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted"><Lock size={12} /> Solo lectura</span>
          )}
        </CardHeader>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input-base pl-9" placeholder="Buscar por nombre o código..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <Select
            options={[{ value: '', label: 'Todos los proveedores' }, ...proveedores.map(p => ({ value: String(p.id), label: p.nombre }))]}
            value={filtroProveedor} onChange={e => { setFiltroProveedor(e.target.value); setPage(1); }}
            className="sm:w-52"
          />
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="animate-spin text-sigo-primary" />
            <p className="text-sm text-muted">Cargando materiales...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="text-red-500 mx-auto" size={36} />
            <p className="text-sm font-medium text-red-500">{error}</p>
            <button onClick={cargarMateriales} className="text-sm text-sigo-primary hover:underline font-medium">Reintentar</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default">
                    {['Código', 'Nombre', 'Unidad', 'Precio Compra', 'Precio Venta', 'Stock', 'Proveedor', 'Estado', ''].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map(m => (
                    <tr key={m.id} onClick={() => router.push(`/catalogos/materiales/${m.id}`)} className="border-b border-default last:border-0 hover:bg-app transition-colors cursor-pointer">
                      <td className="py-3 pl-0 px-3 font-mono text-xs text-secondary">{m.codigo}</td>
                      <td className="py-3 px-3 text-xs font-medium text-primary">{m.nombre}</td>
                      <td className="py-3 px-3 text-xs text-secondary">{m.unidad_medida}</td>
                      <td className="py-3 px-3 text-xs text-secondary">{formatCurrency(m.precio_compra)}</td>
                      <td className="py-3 px-3 text-xs text-secondary">{formatCurrency(m.precio_venta)}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-primary">{m.stock_actual}</span>
                          {stockBadge(m)}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-xs text-secondary">{m.proveedor?.nombre || '—'}</td>
                      <td className="py-3 px-3">
                        <Badge variant={m.activo ? 'success' : 'gray'} dot>{m.activo ? 'Activo' : 'Inactivo'}</Badge>
                      </td>
                      <td className="py-3 px-3" onClick={e => e.stopPropagation()}>
                        {canEdit && m.activo && (
                          <button onClick={() => setDeleteId(m.id)} className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted">
                          <Package size={28} />
                          <p className="text-sm">No hay materiales registrados</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={totalItems} itemsPerPage={PER_PAGE} />
          </>
        )}
      </Card>

      <ConfirmDialog
        open={deleteId !== null} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDesactivar(deleteId)}
        title="Desactivar material"
        message="¿Estás seguro de que deseas desactivar este material?"
        confirmLabel={deleting ? 'Desactivando...' : 'Desactivar'}
      />
    </div>
  );
}
