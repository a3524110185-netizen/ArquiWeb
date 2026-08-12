import { api } from './api';

export interface Evidencia {
  id: number;
  tipo: 'reporte' | 'incidencia';
  url: string;
  descripcion: string;
  proyecto_id: number;
  proyecto_nombre: string;
  fecha: string;
  origen_id: number;
}

export interface EvidenciasFiltro {
  proyecto_id?: number | string;
  tipo?: 'reporte' | 'incidencia';
  page?: number;
}

export const evidenciasService = {
  // GET /api/evidencias
  async listar(filtro?: EvidenciasFiltro): Promise<Evidencia[]> {
    const query = new URLSearchParams();
    if (filtro?.proyecto_id) query.set('proyecto_id', String(filtro.proyecto_id));
    if (filtro?.tipo) query.set('tipo', filtro.tipo);
    if (filtro?.page) query.set('page', String(filtro.page));
    const qs = query.toString();

    const response = await api.get<any>(`/evidencias${qs ? `?${qs}` : ''}`);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    return [];
  },
};
