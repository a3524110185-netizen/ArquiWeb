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

export interface ProveedorApi {
  id: number;
  nombre: string;
  contacto?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  especialidad?: string | null;
  activo: boolean;
  created_at?: string;
}

export interface ProveedorFormInput {
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  especialidad?: string;
}

export const proveedoresService = {
  // GET /api/proveedores
  async getProveedores(): Promise<ProveedorApi[]> {
    const response = await api.get<any>('/proveedores');
    return extractArray<ProveedorApi>(response.data, ['proveedores']);
  },

  // GET /api/proveedores/{id}
  async getProveedor(id: number | string): Promise<ProveedorApi> {
    const response = await api.get<any>(`/proveedores/${id}`);
    return response.data?.proveedor || response.data;
  },

  // POST /api/proveedores
  async crearProveedor(data: ProveedorFormInput): Promise<ProveedorApi> {
    const response = await api.post<any>('/proveedores', data);
    return response.data?.proveedor || response.data;
  },

  // PUT /api/proveedores/{id}
  async actualizarProveedor(id: number | string, data: Partial<ProveedorFormInput>): Promise<ProveedorApi> {
    const response = await api.put<any>(`/proveedores/${id}`, data);
    return response.data?.proveedor || response.data;
  },

  // PATCH /api/proveedores/{id}/desactivar
  async desactivarProveedor(id: number | string): Promise<void> {
    await api.patch(`/proveedores/${id}/desactivar`);
  },
};
