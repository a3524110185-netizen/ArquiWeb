import { api } from './api';

export interface SolicitudApi {
  id: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  empresa?: { id: number; nombre: string } | null;
  departamento?: { id: number; nombre: string } | null;
  created_at: string;
}

function extractArray<T>(data: any, keys: string[] = []): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data[key])) return data[key];
  }
  if (data.data && Array.isArray(data.data)) return data.data;
  if (data.data && Array.isArray(data.data.data)) return data.data.data;
  return [];
}

export const solicitudesService = {
  // GET /api/superadmin/solicitudes
  async listar(): Promise<SolicitudApi[]> {
    const response = await api.get<any>('/superadmin/solicitudes');
    return extractArray<SolicitudApi>(response.data, ['solicitudes']);
  },

  // PATCH /api/superadmin/solicitudes/{id}/aprobar
  async aprobar(id: number): Promise<void> {
    await api.patch(`/superadmin/solicitudes/${id}/aprobar`);
  },

  // PATCH /api/superadmin/solicitudes/{id}/rechazar
  async rechazar(id: number, motivo?: string): Promise<void> {
    await api.patch(`/superadmin/solicitudes/${id}/rechazar`, { motivo });
  },
};
