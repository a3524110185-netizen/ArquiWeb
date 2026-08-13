import { api } from './api';

export interface DepartamentoApi {
  id: number;
  nombre: string;
  activo?: boolean;
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

export const departamentosService = {
  // GET /api/departamentos?activo=
  async getDepartamentos(activo?: boolean): Promise<DepartamentoApi[]> {
    const query = activo !== undefined ? `?activo=${activo ? 1 : 0}` : '';
    const response = await api.get<any>(`/departamentos${query}`);
    return extractArray<DepartamentoApi>(response.data, ['departamentos']);
  },
};
