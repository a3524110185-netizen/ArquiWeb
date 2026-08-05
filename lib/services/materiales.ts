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

export interface MaterialApi {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  unidad_medida: string;
  precio_compra: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  proveedor_id: number;
  proveedor?: { id: number; nombre: string } | null;
  activo: boolean;
  created_at?: string;
}

export interface MaterialFormInput {
  codigo: string;
  nombre: string;
  descripcion?: string;
  unidad_medida: string;
  precio_compra: number | string;
  precio_venta: number | string;
  stock_actual: number | string;
  stock_minimo: number | string;
  proveedor_id: number | string;
}

export const materialesService = {
  // GET /api/materiales
  async getMateriales(): Promise<MaterialApi[]> {
    const response = await api.get<any>('/materiales');
    return extractArray<MaterialApi>(response.data, ['materiales']);
  },

  // GET /api/materiales/{id}
  async getMaterial(id: number | string): Promise<MaterialApi> {
    const response = await api.get<any>(`/materiales/${id}`);
    return response.data?.material || response.data;
  },

  // POST /api/materiales
  async crearMaterial(data: MaterialFormInput): Promise<MaterialApi> {
    const response = await api.post<any>('/materiales', data);
    return response.data?.material || response.data;
  },

  // PUT /api/materiales/{id}
  async actualizarMaterial(id: number | string, data: Partial<MaterialFormInput>): Promise<MaterialApi> {
    const response = await api.put<any>(`/materiales/${id}`, data);
    return response.data?.material || response.data;
  },

  // PATCH /api/materiales/{id}/activar | /desactivar
  async toggleActivo(id: number | string, activo: boolean): Promise<void> {
    await api.patch(`/materiales/${id}/${activo ? 'activar' : 'desactivar'}`);
  },

  // GET /api/materiales?search=
  async buscarMateriales(query: string): Promise<MaterialApi[]> {
    const response = await api.get<any>(`/materiales?search=${encodeURIComponent(query)}`);
    return extractArray<MaterialApi>(response.data, ['materiales']);
  },
};
