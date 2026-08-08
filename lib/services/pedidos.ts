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

export type PedidoEstado = 'pendiente' | 'aprobado' | 'rechazado' | 'entregado';

export interface DetallePedidoApi {
  material_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal?: number;
  material?: { id: number; nombre: string; codigo?: string; unidad_medida?: string };
}

export interface PedidoApi {
  id: number;
  folio: string;
  cliente_id: number;
  cliente?: { id: number; nombre: string; rfc?: string | null; telefono?: string | null; email?: string | null };
  usuario?: { id: number; nombre: string; email?: string };
  fecha_pedido: string;
  fecha_entrega?: string | null;
  subtotal?: number;
  iva?: number;
  total: number;
  estado: PedidoEstado | string;
  observaciones?: string | null;
  detalles?: DetallePedidoApi[];
  created_at?: string;
}

export interface PedidoFormInput {
  cliente_id: number | string;
  fecha_entrega?: string;
  observaciones?: string;
  detalles: { material_id: number; cantidad: number; precio_unitario: number }[];
}

export interface PedidoFiltros {
  cliente_id?: number | string;
  estado?: string;
  desde?: string;
  hasta?: string;
}

export const pedidosService = {
  // GET /api/pedidos
  async listar(params?: PedidoFiltros): Promise<PedidoApi[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') query.append(key, String(val));
      });
    }
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await api.get<any>(`/pedidos${queryString}`);
    return extractArray<PedidoApi>(response.data, ['pedidos']);
  },

  // GET /api/pedidos?search=
  async buscar(term: string): Promise<PedidoApi[]> {
    const response = await api.get<any>(`/pedidos?search=${encodeURIComponent(term)}`);
    return extractArray<PedidoApi>(response.data, ['pedidos']);
  },

  // GET /api/pedidos/{id}
  async obtener(id: number | string): Promise<PedidoApi> {
    const response = await api.get<any>(`/pedidos/${id}`);
    return response.data?.pedido || response.data;
  },

  // POST /api/pedidos
  async crear(data: PedidoFormInput): Promise<PedidoApi> {
    const response = await api.post<any>('/pedidos', data);
    return response.data?.pedido || response.data;
  },

  // PUT /api/pedidos/{id}
  async actualizar(id: number | string, data: Partial<PedidoFormInput>): Promise<PedidoApi> {
    const response = await api.put<any>(`/pedidos/${id}`, data);
    return response.data?.pedido || response.data;
  },

  // PATCH /api/pedidos/{id}/estado
  async cambiarEstado(id: number | string, estado: PedidoEstado, observaciones?: string): Promise<PedidoApi> {
    const payload: any = { estado };
    if (observaciones) payload.observaciones = observaciones;
    const response = await api.patch<any>(`/pedidos/${id}/estado`, payload);
    return response.data?.pedido || response.data;
  },

  // DELETE /api/pedidos/{id}
  async eliminar(id: number | string): Promise<void> {
    await api.delete(`/pedidos/${id}`);
  },
};
