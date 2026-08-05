import { api } from './api';
import type { MaterialApi } from './materiales';

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

export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste';

export interface MovimientoInventarioApi {
  id: number;
  material_id: number;
  material?: { id: number; nombre: string; codigo: string };
  tipo: TipoMovimiento;
  cantidad: number;
  motivo?: string | null;
  usuario?: { id: number; nombre: string };
  stock_resultante?: number;
  created_at: string;
}

export interface MovimientoFormInput {
  material_id: number | string;
  tipo: TipoMovimiento;
  cantidad: number | string;
  motivo?: string;
}

export const inventarioService = {
  // GET /api/inventario
  async getInventario(): Promise<MaterialApi[]> {
    const response = await api.get<any>('/inventario');
    return extractArray<MaterialApi>(response.data, ['materiales', 'inventario']);
  },

  // GET /api/inventario/bajo-stock
  async getBajoStock(): Promise<MaterialApi[]> {
    const response = await api.get<any>('/inventario/bajo-stock');
    return extractArray<MaterialApi>(response.data, ['materiales', 'inventario']);
  },

  // GET /api/inventario/historial?material_id=
  async getHistorial(materialId?: number | string): Promise<MovimientoInventarioApi[]> {
    const query = materialId ? `?material_id=${materialId}` : '';
    const response = await api.get<any>(`/inventario/historial${query}`);
    return extractArray<MovimientoInventarioApi>(response.data, ['historial', 'movimientos']);
  },

  // POST /api/inventario/movimiento
  async registrarMovimiento(data: MovimientoFormInput): Promise<MovimientoInventarioApi> {
    const response = await api.post<any>('/inventario/movimiento', data);
    return response.data?.movimiento || response.data;
  },
};
