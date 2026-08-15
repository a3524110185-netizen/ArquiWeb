import { api } from './api';

export type NotificacionTipo =
  | 'incidencia_asignada'
  | 'incidencia_resuelta'
  | 'reporte_validado'
  | 'proyecto_asignado'
  | 'recordatorio';

export interface NotificacionApi {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: NotificacionTipo;
  leida: boolean;
  fecha: string;
}

export const TIPO_LABEL: Record<NotificacionTipo, string> = {
  incidencia_asignada: 'Incidencia asignada',
  incidencia_resuelta: 'Incidencia resuelta',
  reporte_validado: 'Reporte validado',
  proyecto_asignado: 'Proyecto asignado',
  recordatorio: 'Recordatorio',
};

// Severidad visual (color de punto) por tipo de notificación de negocio —
// reutiliza los mismos 4 colores que ya pinta el dropdown del Header.
const TIPO_SEVERIDAD: Record<NotificacionTipo, 'info' | 'warning' | 'error' | 'success'> = {
  incidencia_asignada: 'info',
  incidencia_resuelta: 'success',
  reporte_validado: 'success',
  proyecto_asignado: 'info',
  recordatorio: 'warning',
};

export function severidadDeTipo(tipo: NotificacionTipo): 'info' | 'warning' | 'error' | 'success' {
  return TIPO_SEVERIDAD[tipo] ?? 'info';
}

function extractArray<T>(data: any, keys: string[] = []): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data[key])) return data[key];
  }
  if (data.data && Array.isArray(data.data)) return data.data;
  return [];
}

export const notificacionesService = {
  // GET /api/notificaciones
  async listar(): Promise<NotificacionApi[]> {
    const response = await api.get<any>('/notificaciones');
    return extractArray<NotificacionApi>(response.data, ['notificaciones']);
  },

  // PATCH /api/notificaciones/{id}/leer
  async marcarLeida(id: number): Promise<void> {
    await api.patch(`/notificaciones/${id}/leer`);
  },

  // PATCH /api/notificaciones/leer-todas
  async marcarTodasLeidas(): Promise<void> {
    await api.patch('/notificaciones/leer-todas');
  },

  // GET /api/notificaciones/no-leidas
  async contarNoLeidas(): Promise<number> {
    const response = await api.get<any>('/notificaciones/no-leidas');
    const data = response.data;
    if (typeof data === 'number') return data;
    return Number(data?.total ?? data?.count ?? 0) || 0;
  },
};
