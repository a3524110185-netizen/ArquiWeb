import { api } from './api';

export interface DashboardKpisApi {
  total_proyectos: number;
  proyectos_activos: number;
  total_ventas_mes: number;
  total_empleados: number;
  incidencias_pendientes: number;
  stock_bajo: number;
}

export interface TendenciaDataset {
  label: string;
  data: number[];
}

export interface TendenciasApi {
  labels: string[];
  datasets: TendenciaDataset[];
}

export interface DistribucionesApi {
  labels: string[];
  data: number[];
}

export interface ActividadVentaApi {
  id?: number;
  folio: string;
  cliente: string;
  total: number;
  fecha: string;
}

export interface ActividadIncidenciaApi {
  id?: number;
  titulo: string;
  estado: string;
  fecha: string;
}

export interface ActividadRecienteApi {
  ventas: ActividadVentaApi[];
  incidencias: ActividadIncidenciaApi[];
}

export interface DashboardEjecutivoApi {
  kpis: DashboardKpisApi;
  tendencias: TendenciasApi;
  distribuciones: DistribucionesApi;
  actividad_reciente: ActividadRecienteApi;
}

export const dashboardService = {
  // GET /api/dashboard-ejecutivo
  async obtenerDashboardCompleto(): Promise<DashboardEjecutivoApi> {
    const response = await api.get<any>('/dashboard-ejecutivo');
    return response.data?.dashboard || response.data;
  },
};
