'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { rhService, ReporteHorasUsuario, ReporteHorasDia } from '@/lib/services/rh';
import { usuariosService, UsuarioApi } from '@/lib/services/usuarios';
import { proyectosService, ProyectoApi } from '@/lib/services/proyectos';
import { departamentosService, DepartamentoApi } from '@/lib/services/departamentos';
import { exportToCsv } from '@/lib/services/exportService';
import { extractErrorMessage, extractFieldErrors } from '@/lib/services/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Select } from '@/components/ui/FormFields';
import { useToast } from '@/components/ui/Toast';
import { formatDate, getDefaultDateRange } from '@/lib/utils';
import { Download, Clock, Loader2, AlertCircle, ChevronDown, ChevronRight, BarChart3 } from 'lucide-react';

export default function ReporteHorasPage() {
  const { currentUser } = useAuthStore();
  const toast = useToast();
  const userRole = currentUser?.rol?.nombre || '';
  const canFilterUsuario = userRole === 'administrador' || userRole === 'gerente';

  const [usuarios, setUsuarios] = useState<UsuarioApi[]>([]);
  const [proyectos, setProyectos] = useState<ProyectoApi[]>([]);
  const [departamentos, setDepartamentos] = useState<DepartamentoApi[]>([]);
  const [resumen, setResumen] = useState<ReporteHorasUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const defaultRange = useMemo(() => getDefaultDateRange(), []);
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroProyecto, setFiltroProyecto] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState('');
  const [desde, setDesde] = useState(defaultRange.desde);
  const [hasta, setHasta] = useState(defaultRange.hasta);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detalleCache, setDetalleCache] = useState<Record<number, ReporteHorasDia[]>>({});
  const [detalleLoading, setDetalleLoading] = useState<number | null>(null);

  // Fijar el filtro al propio usuario para ingeniero/supervisor
  useEffect(() => {
    if (!canFilterUsuario && currentUser) setFiltroUsuario(String(currentUser.id));
  }, [canFilterUsuario, currentUser]);

  useEffect(() => {
    if (canFilterUsuario) {
      usuariosService.getUsuarios('1').then(setUsuarios).catch(() => {});
      departamentosService.getDepartamentos().then(setDepartamentos).catch(() => {});
    }
    proyectosService.getProyectos().then(setProyectos).catch(() => {});
  }, [canFilterUsuario]);

  const cargarReporte = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      const data = await rhService.getReporteHoras({
        usuario_id: filtroUsuario || undefined,
        proyecto_id: filtroProyecto || undefined,
        departamento_id: filtroDepartamento || undefined,
        desde: desde || undefined,
        hasta: hasta || undefined,
      });
      // El backend puede no soportar departamento_id todavía; se filtra también
      // en cliente cruzando contra el departamento de cada usuario (ya cargado
      // para el filtro de Usuario) para garantizar el resultado correcto.
      const filtrada = filtroDepartamento
        ? data.filter(row => {
            const u = usuarios.find(u => u.id === row.usuario.id);
            return String(u?.departamento_id ?? '') === filtroDepartamento;
          })
        : data;
      setResumen(filtrada);
      setExpandedId(null);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Error al cargar el reporte de horas.'));
      setFieldErrors(extractFieldErrors(err));
    } finally {
      setLoading(false);
    }
  }, [filtroUsuario, filtroProyecto, filtroDepartamento, desde, hasta, usuarios]);

  useEffect(() => {
    // Esperar a que se fije el usuario para roles restringidos
    if (!canFilterUsuario && !filtroUsuario) return;
    cargarReporte();
  }, [cargarReporte, canFilterUsuario, filtroUsuario]);

  const totales = useMemo(() => resumen.reduce((acc, r) => ({
    horas: acc.horas + (r.total_horas || 0),
    extra: acc.extra + (r.horas_extra || 0),
    faltas: acc.faltas + (r.faltas || 0),
  }), { horas: 0, extra: 0, faltas: 0 }), [resumen]);

  const toggleDesglose = async (row: ReporteHorasUsuario) => {
    const uid = row.usuario.id;
    if (expandedId === uid) { setExpandedId(null); return; }
    setExpandedId(uid);
    if (detalleCache[uid]) return;
    if (row.dias && row.dias.length > 0) {
      setDetalleCache(prev => ({ ...prev, [uid]: row.dias }));
      return;
    }
    setDetalleLoading(uid);
    try {
      const data = await rhService.getReporteHoras({
        usuario_id: uid, proyecto_id: filtroProyecto || undefined, desde: desde || undefined, hasta: hasta || undefined,
      });
      setDetalleCache(prev => ({ ...prev, [uid]: data[0]?.dias || [] }));
    } catch (err: any) {
      toast.error('Error', extractErrorMessage(err, 'No se pudo cargar el desglose diario'));
      setExpandedId(null);
    } finally {
      setDetalleLoading(null);
    }
  };

  const handleExport = () => {
    if (resumen.length === 0) return;
    try {
      const headers = ['Usuario', 'Total Horas', 'Horas Extra', 'Faltas', 'Días Trabajados'];
      const filas: (string | number)[][] = [];
      resumen.forEach(row => {
        const nombre = row.usuario?.nombre || usuarios.find(u => u.id === row.usuario.id)?.nombre || `Usuario ${row.usuario.id}`;
        filas.push([
          nombre,
          (row.total_horas || 0).toFixed(2),
          (row.horas_extra || 0).toFixed(2),
          row.faltas || 0,
          row.dias_trabajados || 0,
        ]);
        // Desglose diario: se usa lo que ya esté cargado en memoria (cache de la
        // fila expandible o lo que trajo el propio resumen); no se disparan
        // fetches nuevos solo para exportar.
        const dias = detalleCache[row.usuario.id] || row.dias || [];
        dias.forEach(d => {
          filas.push([
            `  └ ${formatDate(d.fecha)}`,
            (d.horas_trabajadas || 0).toFixed(2),
            (d.horas_extra || 0).toFixed(2),
            d.estado?.toLowerCase() === 'falta' ? 1 : 0,
            d.estado?.toLowerCase() === 'completo' ? 1 : 0,
          ]);
        });
      });
      exportToCsv(headers, filas, `Reporte_Horas_${desde}_a_${hasta}`);
      toast.success('Excel exportado', 'El archivo se descargó correctamente.');
    } catch (err: any) {
      toast.error('Error al exportar', extractErrorMessage(err, 'No se pudo generar el archivo.'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <BarChart3 className="text-sigo-primary" size={26} /> Reporte de Horas
          </h1>
          <p className="text-sm text-muted">Resumen de horas trabajadas, extras y faltas por trabajador</p>
        </div>
        <Button onClick={handleExport} variant="secondary" disabled={resumen.length === 0}>
          <Download size={16} /> Exportar Excel
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {canFilterUsuario && (
            <Select label="Usuario" placeholder="Todos los usuarios" value={filtroUsuario}
              onChange={e => setFiltroUsuario(e.target.value)}
              error={fieldErrors.usuario_id}
              options={usuarios.map(u => ({ value: String(u.id), label: u.nombre }))} />
          )}
          {canFilterUsuario && (
            <Select label="Departamento" placeholder="Todos los departamentos" value={filtroDepartamento}
              onChange={e => setFiltroDepartamento(e.target.value)}
              options={departamentos.map(d => ({ value: String(d.id), label: d.nombre }))} />
          )}
          <Select label="Proyecto" placeholder="Todos los proyectos" value={filtroProyecto}
            onChange={e => setFiltroProyecto(e.target.value)}
            error={fieldErrors.proyecto_id}
            options={proyectos.map(p => ({ value: String(p.id), label: p.nombre }))} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-secondary">Desde</label>
            <input type="date" className="input-base" value={desde} onChange={e => setDesde(e.target.value)} />
            {fieldErrors.desde && <p className="text-xs text-red-500">{fieldErrors.desde}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-secondary">Hasta</label>
            <input type="date" className="input-base" value={hasta} onChange={e => setHasta(e.target.value)} />
            {fieldErrors.hasta && <p className="text-xs text-red-500">{fieldErrors.hasta}</p>}
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl p-5 border border-default shadow-sm">
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Total Horas</p>
          <p className="text-2xl font-bold text-primary">{totales.horas.toFixed(2)}h</p>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-default shadow-sm">
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Horas Extra</p>
          <p className="text-2xl font-bold text-amber-500">{totales.extra.toFixed(2)}h</p>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-default shadow-sm">
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Faltas</p>
          <p className="text-2xl font-bold text-red-500">{totales.faltas}</p>
        </div>
      </div>

      {/* Tabla */}
      <Card className="overflow-hidden" padding="none">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 size={28} className="animate-spin text-sigo-primary" />
            <p className="text-sm text-muted">Cargando reporte...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-3">
            <AlertCircle className="text-red-500 mx-auto" size={36} />
            <p className="text-sm font-medium text-red-500">{error}</p>
            <button onClick={cargarReporte} className="text-sm text-sigo-primary hover:underline font-medium">Reintentar</button>
          </div>
        ) : resumen.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center gap-2">
            <Clock className="text-muted" size={32} />
            <p className="text-sm text-muted">No hay registros de horas para los filtros seleccionados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-app border-b border-default">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-secondary"></th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-secondary">Usuario</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-secondary">Total Horas</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-secondary">Horas Extra</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-secondary">Faltas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default">
                {resumen.map(row => {
                  const isExpanded = expandedId === row.usuario.id;
                  const nombre = row.usuario?.nombre || usuarios.find(u => u.id === row.usuario.id)?.nombre || currentUser?.nombre || `Usuario ${row.usuario.id}`;
                  return (
                    <React.Fragment key={row.usuario.id}>
                      <tr onClick={() => toggleDesglose(row)} className="cursor-pointer hover:bg-app transition-colors">
                        <td className="py-3 px-4 text-muted">
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </td>
                        <td className="py-3 px-4 font-medium text-primary">{nombre}</td>
                        <td className="py-3 px-4 font-semibold text-primary">{(row.total_horas || 0).toFixed(2)}h</td>
                        <td className="py-3 px-4 font-semibold text-amber-500">{(row.horas_extra || 0).toFixed(2)}h</td>
                        <td className="py-3 px-4">
                          <Badge variant={row.faltas > 0 ? 'danger' : 'success'}>{row.faltas}</Badge>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="p-0 bg-app/50 border-b-2 border-sigo-primary/10 dark:border-sigo-primary/40">
                            {detalleLoading === row.usuario.id ? (
                              <div className="py-8 flex justify-center"><Loader2 size={20} className="animate-spin text-sigo-primary" /></div>
                            ) : (
                              <div className="p-4 overflow-x-auto">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="text-muted">
                                      <th className="text-left py-2 px-3 font-semibold">Fecha</th>
                                      <th className="text-left py-2 px-3 font-semibold">Entrada</th>
                                      <th className="text-left py-2 px-3 font-semibold">Salida</th>
                                      <th className="text-left py-2 px-3 font-semibold">H. Trabajadas</th>
                                      <th className="text-left py-2 px-3 font-semibold">H. Extra</th>
                                      <th className="text-left py-2 px-3 font-semibold">Estado</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(detalleCache[row.usuario.id] || []).map((d, idx) => (
                                      <tr key={idx} className="border-t border-default/50">
                                        <td className="py-2 px-3 text-secondary">{formatDate(d.fecha)}</td>
                                        <td className="py-2 px-3 font-mono text-secondary">{d.entrada || '—'}</td>
                                        <td className="py-2 px-3 font-mono text-secondary">{d.salida || '—'}</td>
                                        <td className="py-2 px-3 font-medium text-primary">{d.horas_trabajadas ?? 0}h</td>
                                        <td className="py-2 px-3 font-medium text-amber-500">{d.horas_extra ?? 0}h</td>
                                        <td className="py-2 px-3">
                                          <Badge variant={d.estado?.toLowerCase() === 'completo' ? 'success' : d.estado?.toLowerCase() === 'falta' ? 'danger' : 'warning'} size="sm">{d.estado}</Badge>
                                        </td>
                                      </tr>
                                    ))}
                                    {(detalleCache[row.usuario.id] || []).length === 0 && (
                                      <tr><td colSpan={6} className="py-4 text-center text-muted">Sin desglose diario disponible</td></tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
