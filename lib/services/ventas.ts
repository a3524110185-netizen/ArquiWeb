import { api } from './api';
import type { CotizacionItemApi } from './cotizaciones';

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

export interface VentaApi {
  id: number;
  folio: string;
  cliente_id: number;
  cliente?: { id: number; nombre: string };
  fecha: string;
  subtotal?: number;
  iva?: number;
  total: number;
  estado?: string;
  items?: CotizacionItemApi[];
  created_at?: string;
}

export interface VentaFormInput {
  cliente_id: number | string;
  items: { material_id?: number | null; descripcion: string; cantidad: number; precio_unitario: number }[];
}

export interface VentaFiltros {
  cliente_id?: number | string;
  desde?: string;
  hasta?: string;
}

export const ventasService = {
  // GET /api/ventas
  async getVentas(params?: VentaFiltros): Promise<VentaApi[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') query.append(key, String(val));
      });
    }
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await api.get<any>(`/ventas${queryString}`);
    return extractArray<VentaApi>(response.data, ['ventas']);
  },

  // GET /api/ventas/{id}
  async getVenta(id: number | string): Promise<VentaApi> {
    const response = await api.get<any>(`/ventas/${id}`);
    return response.data?.venta || response.data;
  },

  // POST /api/ventas (venta directa)
  async crearVenta(data: VentaFormInput): Promise<VentaApi> {
    const response = await api.post<any>('/ventas', data);
    return response.data?.venta || response.data;
  },
};
