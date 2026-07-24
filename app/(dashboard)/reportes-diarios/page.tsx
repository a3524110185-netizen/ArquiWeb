'use client';

import { FileText } from 'lucide-react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { proyectosService, ProyectoApi, ReporteApi } from '@/lib/services/proyectos';
import { formatDate } from '@/lib/utils';
import {
  ClipboardList,
  FolderOpen,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  XCircle,
  Calendar,
  Image as ImageIcon,
  Sun,
  Sunset,
  Moon,
  ChevronDown,
  X,
  PieChart,
  Activity,
  CheckSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ReportesDiariosPage() {
  const { currentUser } = useAuthStore();
  const userRole = currentUser?.rol?.nombre?.toLowerCase() || '';
  const isGerente = userRole === 'gerente' || userRole === 'administrador';

  // Data states
  const [proyectos, setProyectos] = useState<ProyectoApi[]>([]);
  const [reportes, setReportes] = useState<ReporteApi[]>([]);
  
  // Loading & error states
  const [loadingProyectos, setLoadingProyectos] = useState(true);
  const [loadingReportes, setLoadingReportes] = useState(false);
  const [errorProyectos, setErrorProyectos] = useState<string | null>(null);
  const [errorReportes, setErrorReportes] = useState<string | null>(null);
  
  // Selection states
  const [selectedProyecto, setSelectedProyecto] = useState<string>('');
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);
  
  // Filter states
  const [filtroEstado, setFiltroEstado] = useState<string>('todos'); // todos, pendiente, aprobado, rechazado
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');

  // UI state for rejection modal
  const [modalRechazo, setModalRechazo] = useState<{ isOpen: boolean; reporteId: number | null }>({
    isOpen: false,
    reporteId: null,
  });
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [procesandoRechazo, setProcesandoRechazo] = useState(false);
  const [procesandoAprobacion, setProcesandoAprobacion] = useState<number | null>(null);

  // --- 1. Fetch Proyectos ---
  const fetchProyectos = useCallback(async () => {
    setLoadingProyectos(true);
    setErrorProyectos(null);
    try {
      const data = await proyectosService.getProyectos();
      setProyectos(data);
      if (data.length > 0 && !selectedProyecto) {
        setSelectedProyecto(String(data[0].id));
      }
    } catch (err: any) {
      setErrorProyectos(err.message || 'Error al cargar los proyectos.');
    } finally {
      setLoadingProyectos(false);
    }
  }, [selectedProyecto]);

  useEffect(() => {
    fetchProyectos();
  }, [fetchProyectos]);

  // --- 2. Fetch Reportes del proyecto seleccionado ---
  const fetchReportes = useCallback(async () => {
    if (!selectedProyecto) return;
    setLoadingReportes(true);
    setErrorReportes(null);
    try {
      const data = await proyectosService.getReportes(selectedProyecto);
      setReportes(data);
      setExpandedRowId(null);
    } catch (err: any) {
      setErrorReportes(err.message || 'Error al cargar los reportes del proyecto.');
    } finally {
      setLoadingReportes(false);
    }
  }, [selectedProyecto]);

  useEffect(() => {
    if (selectedProyecto) {
      fetchReportes();
    }
  }, [selectedProyecto, fetchReportes]);

  // --- 3. Filtrar Reportes (Frontend) ---
  const reportesFiltrados = useMemo(() => {
    return reportes.filter((r) => {
      // Filtro Estado
      let estadoR = 'pendiente';
      if (r.validado === true) estadoR = 'aprobado';
      if (r.validado === false) estadoR = 'rechazado';

      if (filtroEstado !== 'todos' && estadoR !== filtroEstado) {
        return false;
      }

      // Filtro Fechas
      if (fechaDesde && r.fecha_reporte < fechaDesde) return false;
      if (fechaHasta && r.fecha_reporte > fechaHasta) return false;

      return true;
    });
  }, [reportes, filtroEstado, fechaDesde, fechaHasta]);

  // --- KPIs Calculations ---
  const kpis = useMemo(() => {
    const total = reportesFiltrados.length;
    if (total === 0) return { total: 0, aprobados: 0, pendientes: 0, avance: 0 };
    
    let aprobados = 0;
    let pendientes = 0;
    let sumaAvance = 0;
    
    reportesFiltrados.forEach(r => {
      if (r.validado === true) aprobados++;
      else if (r.validado === null || r.validado === undefined) pendientes++;
      sumaAvance += (r.avance || 0);
    });

    return {
      total,
      aprobados: Math.round((aprobados / total) * 100),
      pendientes: Math.round((pendientes / total) * 100),
      avance: Math.round(sumaAvance / total)
    };
  }, [reportesFiltrados]);

  // --- 4. Acciones (Aprobar / Rechazar) ---
  const handleAprobar = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Estás seguro de aprobar este reporte?')) return;
    setProcesandoAprobacion(id);
    try {
      await proyectosService.validarReporte(id, 'aprobar');
      setReportes(prev => prev.map(r => r.id === id ? { ...r, validado: true } : r));
    } catch (err: any) {
      alert(err.message || 'Error al aprobar el reporte.');
    } finally {
      setProcesandoAprobacion(null);
    }
  };

  const handleRechazarSubmit = async () => {
    if (!modalRechazo.reporteId) return;
    if (!motivoRechazo.trim()) {
      alert('El motivo de rechazo es obligatorio.');
      return;
    }
    
    setProcesandoRechazo(true);
    try {
      await proyectosService.validarReporte(modalRechazo.reporteId, 'rechazar', motivoRechazo);
      setReportes(prev => prev.map(r => r.id === modalRechazo.reporteId ? { ...r, validado: false, notas_validacion: motivoRechazo } : r));
      setModalRechazo({ isOpen: false, reporteId: null });
      setMotivoRechazo('');
    } catch (err: any) {
      alert(err.message || 'Error al rechazar el reporte.');
    } finally {
      setProcesandoRechazo(false);
    }
  };

  const toggleRow = (id: number) => {
    setExpandedRowId(prev => prev === id ? null : id);
  };

  // Helpers de renderizado
  const getAvatarInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const renderTurnoInfo = (turno: string) => {
    const t = turno?.toLowerCase();
    if (t === 'matutino') return <span className="flex items-center gap-1.5"><Sun size={14} className="text-amber-500" /> Matutino</span>;
    if (t === 'vespertino') return <span className="flex items-center gap-1.5"><Sunset size={14} className="text-orange-500" /> Vespertino</span>;
    if (t === 'nocturno') return <span className="flex items-center gap-1.5"><Moon size={14} className="text-indigo-400" /> Nocturno</span>;
    return <span className="capitalize">{turno || '—'}</span>;
  };

  const getCategoriaBadgeClass = (cat: string) => {
    const c = cat?.toLowerCase() || '';
    if (c.includes('estructura')) return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    if (c.includes('albañile')) return 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/30';
    if (c.includes('instalacion')) return 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/30';
    if (c.includes('acabado')) return 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/30';
    return 'bg-app text-secondary border-default';
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <ClipboardList className="text-brand-600" size={28} /> Reportes Diarios
            </h1>
            <span className="bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-xs font-bold px-2.5 py-1 rounded-full">
              {reportes.filter(r => r.validado === null).length} Pendientes
            </span>
          </div>
          <p className="text-sm text-muted">Supervisión, registro y validación de avances diarios en obra</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {loadingProyectos ? (
            <div className="text-xs text-muted flex items-center gap-2 px-4 py-2 bg-card rounded-xl shadow-sm border border-default">
              <Loader2 size={16} className="animate-spin" /> Cargando...
            </div>
          ) : (
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <FolderOpen size={16} className="text-muted" />
              </div>
              <select
                className="w-full pl-9 pr-10 py-2.5 bg-card border border-default rounded-xl text-sm text-primary font-medium shadow-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 appearance-none cursor-pointer"
                value={selectedProyecto}
                onChange={(e) => setSelectedProyecto(e.target.value)}
              >
                <option value="">— Seleccionar Proyecto —</option>
                {proyectos.map(p => (
                  <option key={p.id} value={p.id}>{p.codigo ? `${p.codigo} - ` : ''}{p.nombre}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <ChevronDown size={16} className="text-muted" />
              </div>
            </div>
          )}
          <button
            onClick={fetchReportes}
            disabled={loadingReportes || !selectedProyecto}
            className="p-2.5 bg-card border border-default rounded-xl shadow-sm text-secondary hover:text-brand-500 hover:border-brand-500 transition-colors disabled:opacity-50"
            title="Actualizar"
          >
            <RefreshCw size={18} className={loadingReportes ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {selectedProyecto ? (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-2xl p-5 border border-default shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0">
                <FileText size={20} className="text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider mb-0.5">Total Filtro</p>
                <p className="text-2xl font-bold text-primary leading-none">{kpis.total}</p>
              </div>
            </div>
            
            <div className="bg-card rounded-2xl p-5 border border-default shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                <CheckSquare size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider mb-0.5">% Aprobados</p>
                <div className="flex items-end gap-1.5">
                  <p className="text-2xl font-bold text-primary leading-none">{kpis.aprobados}%</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-default shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                <Activity size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider mb-0.5">% Pendientes</p>
                <p className="text-2xl font-bold text-primary leading-none">{kpis.pendientes}%</p>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-default shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                <PieChart size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider mb-0.5">Promedio Avance</p>
                <p className="text-2xl font-bold text-primary leading-none">{kpis.avance}%</p>
              </div>
            </div>
          </div>

          {/* Controls: Filtros */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-2 rounded-2xl border border-default shadow-sm">
            
            {/* Chips de Estado */}
            <div className="flex flex-wrap gap-1 p-1">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'pendiente', label: 'Pendientes' },
                { id: 'aprobado', label: 'Aprobados' },
                { id: 'rechazado', label: 'Rechazados' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFiltroEstado(f.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border",
                    filtroEstado === f.id
                      ? "bg-primary border-primary text-card shadow-md"
                      : "bg-transparent border-transparent text-secondary hover:bg-app"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Rango de Fechas */}
            <div className="flex items-center gap-2 pr-2">
              <div className="flex items-center bg-app border border-default rounded-xl px-3 py-1.5">
                <Calendar size={14} className="text-muted mr-2" />
                <input
                  type="date"
                  className="bg-transparent border-none p-0 text-sm text-secondary focus:ring-0 outline-none w-[115px]"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                />
                <span className="text-muted mx-2">-</span>
                <input
                  type="date"
                  className="bg-transparent border-none p-0 text-sm text-secondary focus:ring-0 outline-none w-[115px]"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                />
              </div>
              {(fechaDesde || fechaHasta) && (
                <button
                  onClick={() => { setFechaDesde(''); setFechaHasta(''); }}
                  className="p-2 text-muted hover:text-red-500 transition-colors"
                  title="Limpiar fechas"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Tabla de Reportes */}
          <div className="bg-card border border-default rounded-2xl shadow-sm overflow-hidden">
            {loadingReportes ? (
              <div className="p-16 flex flex-col items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
                <p className="text-sm font-medium text-muted">Cargando información del proyecto...</p>
              </div>
            ) : errorReportes ? (
              <div className="p-12 text-center space-y-3 bg-red-50/50 dark:bg-red-900/10">
                <AlertCircle className="text-red-500 mx-auto" size={40} />
                <p className="text-sm font-medium text-red-800 dark:text-red-400">{errorReportes}</p>
                <button onClick={fetchReportes} className="text-sm text-red-600 hover:underline font-medium">Reintentar</button>
              </div>
            ) : reportesFiltrados.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center justify-center">
                <div className="w-24 h-24 mb-6 rounded-full bg-app flex items-center justify-center">
                  <ClipboardList className="text-muted" size={48} />
                </div>
                <h3 className="text-lg font-bold text-primary mb-1">No hay reportes</h3>
                <p className="text-sm text-muted max-w-sm">
                  {filtroEstado !== 'todos' || fechaDesde || fechaHasta
                    ? 'Ningún reporte coincide con los filtros aplicados. Intenta cambiar los criterios de búsqueda.'
                    : 'Aún no se han registrado reportes diarios para este proyecto.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-app border-b border-default text-muted">
                    <tr>
                      <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider">Fecha</th>
                      <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider">Proyecto</th>
                      <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider">Supervisor</th>
                      <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider">Categoría</th>
                      <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider">Avance</th>
                      <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider text-center">Evidencia</th>
                      <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider text-center">Estado</th>
                      {isGerente && <th className="px-5 py-4 font-semibold text-xs uppercase tracking-wider text-right">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-default">
                    {reportesFiltrados.map((rep) => {
                      const isExpanded = expandedRowId === rep.id;
                      const fotoPrincipal = rep.fotos?.find(f => f.es_principal) || rep.fotos?.[0];
                      const imgUrl = fotoPrincipal ? (fotoPrincipal.url || (fotoPrincipal as any).ruta) : null;
                      const nombreProyecto = proyectos.find(p => p.id === rep.proyecto_id)?.nombre || 'Proyecto';
                      const codProyecto = proyectos.find(p => p.id === rep.proyecto_id)?.codigo || '';

                      return (
                        <React.Fragment key={rep.id}>
                          <tr
                            onClick={() => toggleRow(rep.id)}
                            className={cn(
                              "group cursor-pointer transition-colors duration-150",
                              isExpanded ? "bg-brand-50/50 dark:bg-brand-900/10" : "hover:bg-brand-50/30 dark:hover:bg-brand-900/10",
                              "even:bg-app/50"
                            )}
                          >
                            <td className="px-5 py-4">
                              <p className="font-semibold text-primary">{formatDate(rep.fecha_reporte)}</p>
                              <div className="text-xs text-muted mt-1 font-medium">
                                {renderTurnoInfo(rep.turno)}
                              </div>
                            </td>
                            <td className="px-5 py-4 max-w-[200px]">
                              <p className="font-semibold text-primary truncate" title={nombreProyecto}>
                                {nombreProyecto}
                              </p>
                              {codProyecto && <p className="text-[10px] text-muted font-mono mt-0.5">{codProyecto}</p>}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                  {getAvatarInitials(rep.usuario?.nombre || 'Usuario')}
                                </div>
                                <span className="font-medium text-secondary">{rep.usuario?.nombre || '—'}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className={cn("px-2.5 py-1 text-[11px] font-bold rounded-md border", getCategoriaBadgeClass(rep.categoria))}>
                                {rep.categoria || 'General'}
                              </span>
                            </td>
                            <td className="px-5 py-4 min-w-[120px]">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner w-16">
                                  <div
                                    className="h-full bg-brand-500 rounded-full"
                                    style={{ width: `${Math.min(100, Math.max(0, rep.avance || 0))}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-secondary">{rep.avance || 0}%</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-center">
                              {imgUrl ? (
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-card shadow-sm inline-block ring-1 ring-default">
                                  <img src={imgUrl} alt="Evidencia" className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-app flex items-center justify-center border border-default border-dashed inline-block">
                                  <ImageIcon size={16} className="text-muted" />
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4 text-center">
                              {rep.validado === true ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Aprobado
                                </span>
                              ) : rep.validado === false ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Rechazado
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30">
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pendiente
                                </span>
                              )}
                            </td>
                            {isGerente && (
                              <td className="px-5 py-4 text-right">
                                {rep.validado === null || rep.validado === undefined ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={(e) => handleAprobar(rep.id, e)}
                                      disabled={procesandoAprobacion === rep.id}
                                      className="p-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-900/30 shadow-sm disabled:opacity-50"
                                      title="Aprobar Reporte"
                                    >
                                      {procesandoAprobacion === rep.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setModalRechazo({ isOpen: true, reporteId: rep.id }); }}
                                      className="p-1.5 text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors border border-red-200 dark:border-red-900/30 shadow-sm"
                                      title="Rechazar Reporte"
                                    >
                                      <XCircle size={16} />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-xs text-muted font-medium pr-2">Gestionado</div>
                                )}
                              </td>
                            )}
                          </tr>

                          {/* Expanded Row */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={isGerente ? 8 : 7} className="p-0 border-b-2 border-brand-100 dark:border-brand-900/40 bg-brand-50/30 dark:bg-brand-900/10 overflow-hidden">
                                <div className="p-6 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200">
                                  
                                  <div className="md:col-span-1 space-y-4">
                                    <div>
                                      <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Descripción del avance</h4>
                                      <p className="text-sm text-primary leading-relaxed bg-card p-4 rounded-xl border border-default shadow-sm whitespace-pre-line">
                                        {rep.descripcion || 'Sin descripción detallada.'}
                                      </p>
                                    </div>
                                    
                                    {rep.validado !== null && rep.validado !== undefined && (
                                      <div className={cn("p-4 rounded-xl border", rep.validado ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30" : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30")}>
                                        <h4 className={cn("text-xs font-bold uppercase tracking-wider mb-2", rep.validado ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400")}>
                                          {rep.validado ? 'Validación Exitosa' : 'Motivo de Rechazo'}
                                        </h4>
                                        <p className="text-sm text-primary">
                                          {rep.notas_validacion || 'No se proporcionaron notas adicionales.'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-default/50">
                                          <div className="w-5 h-5 rounded-full bg-card flex items-center justify-center text-[9px] font-bold shadow-sm text-primary">
                                            {getAvatarInitials(rep.validador?.nombre || 'G')}
                                          </div>
                                          <span className="text-xs text-secondary font-medium">{rep.validador?.nombre || 'Gerente'}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="md:col-span-2">
                                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Evidencia Fotográfica ({rep.fotos?.length || 0})</h4>
                                    {rep.fotos && rep.fotos.length > 0 ? (
                                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {rep.fotos.map((f: any, idx: number) => {
                                          const url = f.url || f.ruta;
                                          return url ? (
                                            <div 
                                              key={idx} 
                                              onClick={(e) => { e.stopPropagation(); setFotoAmpliada(url); }}
                                              className="aspect-square bg-app rounded-xl overflow-hidden border border-default cursor-pointer hover:ring-2 hover:ring-brand-400 hover:ring-offset-1 dark:hover:ring-offset-background transition-all"
                                            >
                                              <img src={url} alt={`Evidencia ${idx+1}`} className="w-full h-full object-cover" />
                                            </div>
                                          ) : null;
                                        })}
                                      </div>
                                    ) : (
                                      <div className="h-32 flex items-center justify-center bg-card border border-dashed border-default rounded-xl">
                                        <p className="text-sm text-muted">No se adjuntaron fotografías</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
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
          </div>
        </>
      ) : (
        /* Pantalla vacía sin proyecto seleccionado */
        <div className="h-96 flex flex-col items-center justify-center bg-card rounded-2xl border border-default shadow-sm p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center mb-6">
            <FolderOpen size={40} className="text-brand-500" />
          </div>
          <h2 className="text-xl font-bold text-primary mb-2">Comienza tu revisión</h2>
          <p className="text-muted max-w-sm mx-auto">Selecciona un proyecto del menú superior para visualizar, filtrar y validar sus reportes diarios.</p>
        </div>
      )}

      {/* Modal Rechazo */}
      {modalRechazo.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-default p-6 space-y-5">
            <h3 className="text-xl font-bold text-primary flex items-center gap-2">
              <XCircle className="text-red-500" /> Rechazar Reporte
            </h3>
            <p className="text-sm text-secondary">
              Por favor, detalla el motivo del rechazo. Este mensaje será visible para el supervisor que elaboró el reporte, quien deberá corregirlo.
            </p>
            <div>
              <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 block">Motivo de rechazo</label>
              <textarea
                className="w-full min-h-[120px] resize-none border border-default bg-app rounded-xl p-4 text-sm text-primary shadow-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                placeholder="Ej. Las fotografías están borrosas, falta especificar los metros cuadrados de losa colada..."
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                className="flex-1 px-4 py-2.5 bg-card border border-default hover:bg-app text-secondary rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                onClick={() => {
                  setModalRechazo({ isOpen: false, reporteId: null });
                  setMotivoRechazo('');
                }}
                disabled={procesandoRechazo}
              >
                Cancelar
              </button>
              <button
                className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
                onClick={handleRechazarSubmit}
                disabled={procesandoRechazo || !motivoRechazo.trim()}
              >
                {procesandoRechazo ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visor de Fotos */}
      {fotoAmpliada && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md" onClick={() => setFotoAmpliada(null)}>
          <button className="absolute top-6 right-6 p-2 bg-foreground/10 hover:bg-foreground/20 text-foreground rounded-full transition-colors backdrop-blur-sm">
            <X size={24} />
          </button>
          <img src={fotoAmpliada} alt="Evidencia Ampliada" className="max-w-full max-h-full rounded-lg shadow-2xl object-contain animate-in zoom-in-95 duration-200" />
        </div>
      )}
    </div>
  );
}
