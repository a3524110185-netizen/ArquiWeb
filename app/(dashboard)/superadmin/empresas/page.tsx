'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { superadminService } from '@/lib/services/superadmin';
import type { EmpresaApi } from '@/types';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Select } from '@/components/ui/FormFields';
import Pagination, { usePagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import { Plus, Search, Edit2, Eye, Power, Loader2, AlertCircle, Building2 } from 'lucide-react';

const PER_PAGE = 8;

export default function SuperadminEmpresasPage() {
  const toast = useToast();
  const router = useRouter();

  const [empresas, setEmpresas] = useState<EmpresaApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<'todos' | '1' | '0'>('todos');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const cargarEmpresas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await superadminService.getEmpresas({
        activo: filterEstado === 'todos' ? undefined : filterEstado,
        buscar: search || undefined,
      });
      setEmpresas(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las empresas.');
    } finally {
      setLoading(false);
    }
  }, [filterEstado, search]);

  useEffect(() => {
    const timeout = setTimeout(cargarEmpresas, 300);
    return () => clearTimeout(timeout);
  }, [cargarEmpresas]);

  const { page, setPage, totalPages, paged, totalItems } = usePagination(empresas, PER_PAGE);

  const handleToggleEstado = async (empresa: EmpresaApi) => {
    setProcessingId(empresa.id);
    try {
      await superadminService.toggleEmpresaEstado(empresa.id);
      toast.success(empresa.activo ? 'Empresa desactivada' : 'Empresa activada');
      cargarEmpresas();
    } catch (err: any) {
      toast.error('Error', err.message || 'No se pudo cambiar el estado de la empresa');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Empresas</CardTitle>
          <Button onClick={() => router.push('/superadmin/empresas/nuevo')}>
            <Plus size={16} /> Nueva Empresa
          </Button>
        </CardHeader>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="input-base pl-9"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select
            options={[
              { value: 'todos', label: 'Todos los estados' },
              { value: '1', label: 'Solo activas' },
              { value: '0', label: 'Solo inactivas' },
            ]}
            value={filterEstado}
            onChange={(e) => { setFilterEstado(e.target.value as any); setPage(1); }}
            className="sm:w-44"
          />
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="animate-spin text-brand-600" />
            <p className="text-sm text-muted">Cargando empresas...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="text-red-500 mx-auto" size={36} />
            <p className="text-sm font-medium text-red-500">{error}</p>
            <button onClick={cargarEmpresas} className="text-sm text-brand-600 hover:underline font-medium">Reintentar</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default">
                    {['Empresa', 'RFC', 'Email', 'Estado', 'Registrada', ''].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-secondary first:pl-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map((e) => (
                    <tr key={e.id} className="border-b border-default last:border-0 hover:bg-app transition-colors">
                      <td className="py-3 pl-0 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-xs font-bold text-white shrink-0">
                            <Building2 size={14} />
                          </div>
                          <p className="text-xs font-medium text-primary">{e.nombre}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-xs text-secondary">{e.rfc || '—'}</td>
                      <td className="py-3 px-3 text-xs text-secondary max-w-[200px] truncate">{e.email || '—'}</td>
                      <td className="py-3 px-3">
                        <Badge variant={e.activo ? 'success' : 'gray'} dot>{e.activo ? 'Activa' : 'Inactiva'}</Badge>
                      </td>
                      <td className="py-3 px-3 text-xs text-secondary">{formatDate(e.created_at)}</td>
                      <td className="py-3 px-3">
                        <div className="flex gap-1">
                          <Link href={`/superadmin/empresas/${e.id}`}
                            className="p-1.5 rounded-lg text-secondary hover:text-brand-600 hover:bg-brand-50 transition-colors">
                            <Eye size={14} />
                          </Link>
                          <Link href={`/superadmin/empresas/${e.id}/editar`}
                            className="p-1.5 rounded-lg text-secondary hover:text-brand-600 hover:bg-brand-50 transition-colors">
                            <Edit2 size={14} />
                          </Link>
                          <button
                            onClick={() => handleToggleEstado(e)}
                            disabled={processingId === e.id}
                            title={e.activo ? 'Desactivar' : 'Activar'}
                            className="p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {processingId === e.id ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted">
                          <Building2 size={28} />
                          <p className="text-sm">No hay empresas registradas</p>
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
    </div>
  );
}
