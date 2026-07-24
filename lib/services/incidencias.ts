import { api } from './api';
import { Incidencia, IncidenciaEstado } from '@/types';

export const incidenciasService = {
  // GET /api/incidencias
  async getIncidencias(params?: { estado?: string; severidad?: string; proyecto_id?: string; busqueda?: string }): Promise<Incidencia[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') query.append(key, String(val));
      });
    }
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await api.get<any>(`/incidencias${queryString}`);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    if (response.data && response.data.data && Array.isArray(response.data.data.data)) return response.data.data.data;
    return [];
  },

  // GET /api/proyectos/{id}/incidencias
  async getIncidenciasPorProyecto(proyectoId: string | number, params?: { estado?: string; severidad?: string; asignadas_a_mi?: boolean; busqueda?: string }): Promise<Incidencia[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') query.append(key, String(val));
      });
    }
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await api.get<any>(`/proyectos/${proyectoId}/incidencias${queryString}`);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    if (response.data && response.data.data && Array.isArray(response.data.data.data)) return response.data.data.data;
    return [];
  },

  // GET /api/incidencias-asignadas
  async getAsignadas(estado?: string): Promise<Incidencia[]> {
    const query = estado ? `?estado=${estado}` : '';
    const response = await api.get<any>(`/incidencias-asignadas${query}`);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    if (response.data && response.data.data && Array.isArray(response.data.data.data)) return response.data.data.data;
    return [];
  },

  // GET /api/incidencias/{id}
  async getIncidencia(id: string | number): Promise<Incidencia> {
    const response = await api.get<any>(`/incidencias/${id}`);
    return response.data || response;
  },

  // PUT /api/incidencias/{id}/estado
  async cambiarEstado(id: string | number, estado: string, comentario?: string, asignado_a?: number): Promise<Incidencia> {
    const payload: any = { estado };
    if (comentario) payload.comentario = comentario;
    if (asignado_a !== undefined && asignado_a !== null) payload.asignado_a = asignado_a;
    
    const response = await api.put<any>(`/incidencias/${id}/estado`, payload);
    return response.data || response;
  },

  // POST /api/incidencias/{id}/comentarios
  async agregarComentario(id: string | number, comentario: string): Promise<any> {
    const response = await api.post<any>(`/incidencias/${id}/comentarios`, { comentario });
    return response.data || response;
  }
};
