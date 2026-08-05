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

export interface ClienteApi {
  id: number;
  nombre: string;
  rfc?: string | null;
  contacto?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  activo: boolean;
  created_at?: string;
}

export interface ClienteFormInput {
  nombre: string;
  rfc?: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export const clientesService = {
  // GET /api/clientes
  async getClientes(): Promise<ClienteApi[]> {
    const response = await api.get<any>('/clientes');
    return extractArray<ClienteApi>(response.data, ['clientes']);
  },

  // GET /api/clientes/{id}
  async getCliente(id: number | string): Promise<ClienteApi> {
    const response = await api.get<any>(`/clientes/${id}`);
    return response.data?.cliente || response.data;
  },

  // POST /api/clientes
  async crearCliente(data: ClienteFormInput): Promise<ClienteApi> {
    const response = await api.post<any>('/clientes', data);
    return response.data?.cliente || response.data;
  },

  // PUT /api/clientes/{id}
  async actualizarCliente(id: number | string, data: Partial<ClienteFormInput>): Promise<ClienteApi> {
    const response = await api.put<any>(`/clientes/${id}`, data);
    return response.data?.cliente || response.data;
  },

  // PATCH /api/clientes/{id}/desactivar
  async desactivarCliente(id: number | string): Promise<void> {
    await api.patch(`/clientes/${id}/desactivar`);
  },
};
