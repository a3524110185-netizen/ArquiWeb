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

export interface CategoriaGastoApi {
  id: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
}

export const categoriasGastoService = {
  // GET /api/gastos-obra/categorias
  async listar(): Promise<CategoriaGastoApi[]> {
    const response = await api.get<any>('/gastos-obra/categorias');
    return extractArray<CategoriaGastoApi>(response.data, ['categorias']);
  },
};
