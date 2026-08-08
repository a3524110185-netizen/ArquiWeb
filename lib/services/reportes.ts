import { api } from './api';
import { ReporteApi } from './proyectos';

export type { ReporteApi, FotoReporte } from './proyectos';

export const reportesService = {
  // GET /api/reportes-diarios/{id}
  async obtener(id: number | string): Promise<ReporteApi> {
    const response = await api.get<any>(`/reportes-diarios/${id}`);
    return response.data?.reporte || response.data;
  },
};
