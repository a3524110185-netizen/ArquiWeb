'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { rhService, ControlHorarioRegistro } from '@/lib/services/rh';
import { usuariosService, UsuarioApi } from '@/lib/services/usuarios';
import { proyectosService, ProyectoApi } from '@/lib/services/proyectos';
import { extractErrorMessage, extractFieldErrors } from '@/lib/services/api';
import Card from '@/components/ui/Card';
import Badge, { BadgeVariant } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Select } from '@/components/ui/FormFields';
import Pagination, { usePagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { formatDate, getDefaultDateRange } from '@/lib/utils';
import { Clock, Loader2, AlertCircle, Search, FileText, FileSpreadsheet } from 'lucide-react';

const PER_PAGE = 10;

const ESTADO_OPTIONS = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'completo', label: 'Completo' },
  { value: 'incompleto', label: 'Incompleto' },
  { value: 'falta', label: 'Falta' },
];

const estadoVariant: Record<string, BadgeVariant> = {
  completo: 'success', incompleto: 'warning', falta: 'danger',
};

export default function ControlHorarioPage() {
  const { currentUser } = useAuthStore();
  const toast = useToast();
  const userRole = currentUser?.rol?.nombre || '';
  const canFilterUsuario = userRole === 'administrador' || userRole === 'gerente';

  const [usuarios, setUsuarios] = useState<UsuarioApi[]>([]);
  const [proyectos, setProyectos] = useState<ProyectoApi[]>([]);
  const [registros, setRegistros] = useState<ControlHorarioRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [exportandoPDF, setExportandoPDF] = useState(false);

  const defaultRange = useMemo(() => getDefaultDateRange(), []);
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroProyecto, setFiltroProyecto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [desde, setDesde] = useState(defaultRange.desde);
  const [hasta, setHasta] = useState(defaultRange.hasta);

  // Fijar el filtro al propio usuario para ingeniero/supervisor
  useEffect(() => {
    if (!canFilterUsuario && currentUser) setFiltroUsuario(String(currentUser.id));
  }, [canFilterUsuario, currentUser]);

  useEffect(() => {
    if (canFilterUsuario) usuariosService.getUsuarios('1').then(setUsuarios).catch(() => {});
    proyectosService.getProyectos().then(setProyectos).catch(() => {});
  }, [canFilterUsuario]);

  const cargarRegistros = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      const data = await rhService.getControlHorario({
        usuario_id: filtroUsuario || undefined,
        proyecto_id: filtroProyecto || undefined,
        desde: desde || undefined,
        hasta: hasta || undefined,
        estado: filtroEstado !== 'todos' ? filtroEstado : undefined,
      });
      setRegistros(data);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Error al cargar el control horario.'));
      setFieldErrors(extractFieldErrors(err));
    } finally {
      setLoading(false);
    }
  }, [filtroUsuario, filtroProyecto, filtroEstado, desde, hasta]);

  useEffect(() => {
    // Esperar a que se fije el usuario para roles restringidos
    if (!canFilterUsuario && !filtroUsuario) return;
    cargarRegistros();
  }, [cargarRegistros, canFilterUsuario, filtroUsuario]);

  const exportarPDF = async () => {
    if (registros.length === 0) return;
    setExportandoPDF(true);
    try {
      // Carga diferida: @react-pdf/renderer es pesado y solo se necesita al exportar.
      const [{ pdf }, { ControlHorarioPDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/pdf/ControlHorarioPDF'),
      ]);

      const usuarioLabel = filtroUsuario
        ? usuarios.find(u => String(u.id) === filtroUsuario)?.nombre
        : undefined;
      const proyectoLabel = filtroProyecto
        ? proyectos.find(p => String(p.id) === filtroProyecto)?.nombre
        : undefined;
      const estadoLabel = filtroEstado !== 'todos'
        ? ESTADO_OPTIONS.find(o => o.value === filtroEstado)?.label
        : undefined;

      const blob = await pdf(
        <ControlHorarioPDF
          registros={registros}
          empresa={currentUser?.empresa_actual?.nombre || 'SIGO'}
          rangoFechas={{ desde, hasta }}
          usuarioFiltro={usuarioLabel}
          proyectoFiltro={proyectoLabel}
          estadoFiltro={estadoLabel}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Control_Horario_${desde}_a_${hasta}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('PDF exportado', 'El archivo se descargó correctamente.');
    } catch (err: any) {
      toast.error('Error al exportar', extractErrorMessage(err, 'No se pudo generar el PDF.'));
    } finally {
      setExportandoPDF(false);
    }
  };

  // Genera un CSV (Excel lo abre nativamente) sin dependencias externas:
  // la librería estándar para .xlsx en npm (xlsx/SheetJS) tiene CVEs altos sin parchear.
  const exportarExcel = () => {
    if (registros.length === 0) return;
    try {
      const encabezados = ['Usuario', 'Fecha', 'Entrada', 'Inicio Comida', 'Fin Comida', 'Salida', 'Horas', 'Estado'];
      const escaparCsv = (valor: string) => {
        const str = String(valor ?? '');
        return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
      };
      const filas = registros.map(r => [
        r.usuario?.nombre || `Usuario ${r.usuario_id}`,
        formatDate(r.fecha),
        r.entrada || '—',
        r.comida_inicio || '—',
        r.comida_fin || '—',
        r.salida || '—',
        r.horas != null ? String(r.horas) : '—',
        r.estado ? r.estado.charAt(0).toUpperCase() + r.estado.slice(1) : '—',
      ]);
      const csv = [encabezados, ...filas].map(fila => fila.map(escaparCsv).join(',')).join('\r\n');
      // BOM UTF-8 para que Excel detecte la codificación y muestre acentos/ñ correctamente.
      const BOM = String.fromCharCode(0xfeff);
      const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Control_Horario_${desde}_a_${hasta}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Excel exportado', 'El archivo se descargó correctamente.');
    } catch (err: any) {
      toast.error('Error al exportar', extractErrorMessage(err, 'No se pudo generar el archivo.'));
    }
  };

  const { page, setPage, totalPages, paged, totalItems } = usePagination(registros, PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Clock className="text-sigo-primary" size={26} /> Control Horario
          </h1>
          <p className="text-sm text-muted">Consulta de entradas, salidas y estado de asistencia por trabajador</p>
        </div>
        {canFilterUsuario && (
          <div className="flex items-center gap-2">
            <Button onClick={exportarExcel} variant="secondary" disabled={registros.length === 0}>
              <FileSpreadsheet size={16} /> Exportar Excel
            </Button>
            <Button onClick={exportarPDF} variant="secondary" disabled={exportandoPDF || registros.length === 0}>
              {exportandoPDF ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              {exportandoPDF ? 'Exportando...' : 'Exportar PDF'}
            </Button>
          </div>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {canFilterUsuario && (
            <Select label="Usuario" placeholder="Todos los usuarios" value={filtroUsuario}
              onChange={e => { setFiltroUsuario(e.target.value); setPage(1); }}
              error={fieldErrors.usuario_id}
              options={usuarios.map(u => ({ value: String(u.id), label: u.nombre }))} />
          )}
          <Select label="Proyecto" placeholder="Todos los proyectos" value={filtroProyecto}
            onChange={e => { setFiltroProyecto(e.target.value); setPage(1); }}
            error={fieldErrors.proyecto_id}
            options={proyectos.map(p => ({ value: String(p.id), label: p.nombre }))} />
          <Select label="Estado" value={filtroEstado}
            onChange={e => { setFiltroEstado(e.target.value); setPage(1); }}
            error={fieldErrors.estado}
            options={ESTADO_OPTIONS} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-secondary">Desde</label>
            <input type="date" className="input-base" value={desde} onChange={e => { setDesde(e.target.value); setPage(1); }} />
            {fieldErrors.desde && <p className="text-xs text-red-500">{fieldErrors.desde}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-secondary">Hasta</label>
            <input type="date" className="input-base" value={hasta} onChange={e => { setHasta(e.target.value); setPage(1); }} />
            {fieldErrors.hasta && <p className="text-xs text-red-500">{fieldErrors.hasta}</p>}
          </div>
        </div>
      </Card>

      {/* Tabla */}
      <Card padding="none" className="overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="animate-spin text-sigo-primary" />
            <p className="text-sm text-muted">Cargando registros...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="text-red-500 mx-auto" size={36} />
            <p className="text-sm font-medium text-red-500">{error}</p>
            <button onClick={cargarRegistros} className="text-sm text-sigo-primary hover:underline font-medium">Reintentar</button>
          </div>
        ) : paged.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center gap-2">
            <Search className="text-muted" size={32} />
            <p className="text-sm text-muted">No hay registros de control horario para los filtros seleccionados</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-app border-b border-default">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-secondary">Usuario</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-secondary">Fecha</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-secondary">Entrada</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-secondary">Salida</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-secondary">Inicio comida</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-secondary">Fin comida</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-secondary">Horas</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-secondary">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default">
                  {paged.map(r => (
                    <tr key={r.id} className="hover:bg-app transition-colors">
                      <td className="py-3 px-4 font-medium text-primary">{r.usuario?.nombre || usuarios.find(u => u.id === r.usuario_id)?.nombre || `Usuario ${r.usuario_id}`}</td>
                      <td className="py-3 px-4 text-secondary">{formatDate(r.fecha)}</td>
                      <td className="py-3 px-4 font-mono text-secondary">{r.entrada || '—'}</td>
                      <td className="py-3 px-4 font-mono text-secondary">{r.salida || '—'}</td>
                      <td className="py-3 px-4 font-mono text-secondary">{r.comida_inicio || '—'}</td>
                      <td className="py-3 px-4 font-mono text-secondary">{r.comida_fin || '—'}</td>
                      <td className="py-3 px-4 font-semibold text-primary">{r.horas != null ? `${r.horas}h` : '—'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={estadoVariant[r.estado?.toLowerCase()] || 'gray'} dot>{r.estado}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={totalItems} itemsPerPage={PER_PAGE} />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
