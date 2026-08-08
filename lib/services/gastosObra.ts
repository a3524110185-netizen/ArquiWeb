import { api, API_URL } from './api';

export interface GastoObraApi {
  id: number;
  proyecto_id: number;
  proyecto: { id: number; nombre: string };
  categoria_id: number;
  categoria: { id: number; nombre: string };
  proveedor_id?: number | null;
  proveedor?: { id: number; nombre: string } | null;
  monto: number;
  fecha: string;
  descripcion?: string | null;
  comprobante_url?: string | null;
  usuario: { id: number; nombre: string };
  created_at: string;
  updated_at: string;
}

export interface GastoObraFormInput {
  proyecto_id: number | string;
  categoria_id: number | string;
  proveedor_id?: number | string | null;
  monto: number | string;
  fecha: string;
  descripcion?: string;
  comprobante?: File | null;
}

export interface GastoObraFiltros {
  proyecto_id?: number | string;
  categoria_id?: number | string;
  desde?: string;
  hasta?: string;
  search?: string;
  page?: number;
}

export interface PaginacionMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export interface GastosObraPaginados {
  data: GastoObraApi[];
  meta: PaginacionMeta;
}

export interface ResumenPorCategoria {
  categoria: string;
  total: number;
}

export interface ResumenPorProyecto {
  proyecto: string;
  total: number;
}

export interface ResumenGastosApi {
  por_categoria: ResumenPorCategoria[];
  por_proyecto: ResumenPorProyecto[];
  total_general: number;
}

function authHeaders(): HeadersInit {
  const headers: HeadersInit = { Accept: 'application/json', 'ngrok-skip-browser-warning': 'true' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    const rolMatch = document.cookie.match(new RegExp('(^| )auth_role=([^;]+)'));
    if (rolMatch) (headers as Record<string, string>)['X-User-Rol'] = rolMatch[2];
  }
  return headers;
}

function buildFormData(data: Partial<GastoObraFormInput>): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'comprobante' && value instanceof File) {
      formData.append('comprobante', value);
    } else if (key !== 'comprobante') {
      formData.append(key, String(value));
    }
  });
  return formData;
}

export const gastosObraService = {
  // GET /api/gastos-obra
  async listar(filtros?: GastoObraFiltros): Promise<GastosObraPaginados> {
    const query = new URLSearchParams();
    if (filtros) {
      Object.entries(filtros).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') query.append(key, String(val));
      });
    }
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await api.get<any>(`/gastos-obra${queryString}`);
    const payload = response.data?.gastos || response.data;
    const items: GastoObraApi[] = Array.isArray(payload) ? payload : (payload?.data ?? []);
    const meta: PaginacionMeta = {
      current_page: payload?.current_page ?? payload?.meta?.current_page ?? 1,
      last_page: payload?.last_page ?? payload?.meta?.last_page ?? 1,
      total: payload?.total ?? payload?.meta?.total ?? items.length,
      per_page: payload?.per_page ?? payload?.meta?.per_page ?? items.length,
    };
    return { data: items, meta };
  },

  // GET /api/gastos-obra/{id}
  async obtener(id: number | string): Promise<GastoObraApi> {
    const response = await api.get<any>(`/gastos-obra/${id}`);
    return response.data?.gasto || response.data;
  },

  // POST /api/gastos-obra (multipart si hay comprobante)
  async crear(data: GastoObraFormInput): Promise<GastoObraApi> {
    if (data.comprobante instanceof File) {
      const res = await fetch(`${API_URL}/gastos-obra`, {
        method: 'POST', headers: authHeaders(), body: buildFormData(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Error al registrar el gasto');
      return result.data?.gasto || result.data;
    }
    const response = await api.post<any>('/gastos-obra', {
      proyecto_id: data.proyecto_id, categoria_id: data.categoria_id, proveedor_id: data.proveedor_id,
      monto: data.monto, fecha: data.fecha, descripcion: data.descripcion,
    });
    return response.data?.gasto || response.data;
  },

  // PUT /api/gastos-obra/{id} (multipart si hay comprobante nuevo)
  async actualizar(id: number | string, data: Partial<GastoObraFormInput>): Promise<GastoObraApi> {
    if (data.comprobante instanceof File) {
      const formData = buildFormData(data);
      formData.append('_method', 'PUT');
      const res = await fetch(`${API_URL}/gastos-obra/${id}`, {
        method: 'POST', headers: authHeaders(), body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Error al actualizar el gasto');
      return result.data?.gasto || result.data;
    }
    const response = await api.put<any>(`/gastos-obra/${id}`, {
      proyecto_id: data.proyecto_id, categoria_id: data.categoria_id, proveedor_id: data.proveedor_id,
      monto: data.monto, fecha: data.fecha, descripcion: data.descripcion,
    });
    return response.data?.gasto || response.data;
  },

  // DELETE /api/gastos-obra/{id}
  async eliminar(id: number | string): Promise<void> {
    await api.delete(`/gastos-obra/${id}`);
  },

  // GET /api/gastos-obra/resumen
  async resumen(filtros?: Pick<GastoObraFiltros, 'proyecto_id' | 'desde' | 'hasta'>): Promise<ResumenGastosApi> {
    const query = new URLSearchParams();
    if (filtros) {
      Object.entries(filtros).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') query.append(key, String(val));
      });
    }
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await api.get<any>(`/gastos-obra/resumen${queryString}`);
    const data = response.data || {};
    return {
      por_categoria: data.por_categoria || [],
      por_proyecto: data.por_proyecto || [],
      total_general: Number(data.total_general) || 0,
    };
  },
};
