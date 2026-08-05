import { api } from './api';

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

export interface CotizacionItemApi {
  id?: number;
  material_id?: number | null;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal?: number;
}

export interface CotizacionApi {
  id: number;
  folio: string;
  cliente_id: number;
  cliente?: { id: number; nombre: string };
  fecha: string;
  subtotal: number;
  iva: number;
  total: number;
  estado: string;
  items?: CotizacionItemApi[];
  notas?: string | null;
  created_at?: string;
}

export interface CotizacionFormInput {
  cliente_id: number | string;
  items: { material_id?: number | null; descripcion: string; cantidad: number; precio_unitario: number }[];
  notas?: string;
}

export const cotizacionesService = {
  // GET /api/cotizaciones
  async getCotizaciones(): Promise<CotizacionApi[]> {
    const response = await api.get<any>('/cotizaciones');
    return extractArray<CotizacionApi>(response.data, ['cotizaciones']);
  },

  // GET /api/cotizaciones/generar-folio
  async generarFolio(): Promise<string> {
    const response = await api.get<any>('/cotizaciones/generar-folio');
    const data = response.data;
    return (typeof data === 'string' ? data : data?.folio) || '';
  },

  // GET /api/cotizaciones/{id}
  async getCotizacion(id: number | string): Promise<CotizacionApi> {
    const response = await api.get<any>(`/cotizaciones/${id}`);
    return response.data?.cotizacion || response.data;
  },

  // POST /api/cotizaciones
  async crearCotizacion(data: CotizacionFormInput): Promise<CotizacionApi> {
    const response = await api.post<any>('/cotizaciones', data);
    return response.data?.cotizacion || response.data;
  },

  // POST /api/cotizaciones/{id}/convertir-venta
  async convertirVenta(id: number | string): Promise<any> {
    const response = await api.post<any>(`/cotizaciones/${id}/convertir-venta`);
    return response.data;
  },

  // GET /api/cotizaciones/{id}/pdf
  async getPdfData(id: number | string): Promise<any> {
    const response = await api.get<any>(`/cotizaciones/${id}/pdf`);
    return response.data;
  },
};
