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

export interface DetalleVentaApi {
  material_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  material?: { id: number; nombre: string; codigo?: string; unidad_medida?: string };
}

export interface VentaApi {
  id: number;
  folio: string;
  cliente_id: number;
  cliente?: { id: number; nombre: string; rfc?: string | null; telefono?: string | null; email?: string | null };
  usuario?: { id: number; nombre: string; email?: string };
  cotizacion?: { id: number; folio: string } | null;
  fecha: string;
  subtotal?: number;
  iva?: number;
  total: number;
  metodo_pago?: string;
  estado?: string;
  observaciones?: string | null;
  detalles?: DetalleVentaApi[];
  created_at?: string;
}

export interface VentaFormInput {
  cliente_id: number | string;
  items: { material_id?: number | null; descripcion: string; cantidad: number; precio_unitario: number }[];
}

export interface VentaDirectaFormInput {
  cliente_id: number | string;
  metodo_pago: string;
  detalles: { material_id: number; cantidad: number; precio_unitario: number }[];
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

  // POST /api/ventas (a partir de una cotización convertida)
  async crearVenta(data: VentaFormInput): Promise<VentaApi> {
    const response = await api.post<any>('/ventas', data);
    return response.data?.venta || response.data;
  },

  // POST /api/ventas/venta-directa
  async crearVentaDirecta(data: VentaDirectaFormInput): Promise<VentaApi> {
    const response = await api.post<any>('/ventas/venta-directa', data);
    return response.data?.venta || response.data;
  },
};
