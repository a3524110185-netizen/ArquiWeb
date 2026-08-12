import { api } from './api';
import type { EmpresaApi, EstadisticasGlobales } from '@/types';

export interface UsuarioSuperAdminApi {
  id: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  activo: boolean;
  rol?: { id: number; nombre: string } | null;
  rol_id?: number;
  empresa?: { id: number; nombre: string } | null;
  empresa_id?: number | null;
  created_at?: string;
}

export interface EmpresaFormInput {
  nombre: string;
  rfc?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

export interface GetEmpresasParams {
  activo?: '0' | '1';
  buscar?: string;
}

export interface GetUsuariosParams {
  empresa_id?: number | string;
}

function buildQuery(params: GetEmpresasParams | GetUsuariosParams): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (entries.length === 0) return '';
  const search = new URLSearchParams(entries.map(([k, v]) => [k, String(v)]));
  return `?${search.toString()}`;
}

export const superadminService = {
  // GET /superadmin/empresas
  async getEmpresas(params?: GetEmpresasParams): Promise<EmpresaApi[]> {
    const response = await api.get<any>(`/superadmin/empresas${buildQuery(params || {})}`);
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.empresas)) return data.empresas;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  },

  // GET /superadmin/empresas/{id}
  async getEmpresa(id: number | string): Promise<EmpresaApi> {
    const response = await api.get<any>(`/superadmin/empresas/${id}`);
    return response.data?.empresa || response.data;
  },

  // PUT /superadmin/empresas/{id}
  async updateEmpresa(id: number | string, data: EmpresaFormInput): Promise<EmpresaApi> {
    const response = await api.put<any>(`/superadmin/empresas/${id}`, data);
    return response.data?.empresa || response.data;
  },

  // PATCH /superadmin/empresas/{id}/estado
  async toggleEmpresaEstado(id: number | string): Promise<EmpresaApi> {
    const response = await api.patch<any>(`/superadmin/empresas/${id}/estado`);
    return response.data?.empresa || response.data;
  },

  // GET /superadmin/empresas/{id}/usuarios
  async getUsuariosPorEmpresa(id: number | string): Promise<UsuarioSuperAdminApi[]> {
    const response = await api.get<any>(`/superadmin/empresas/${id}/usuarios`);
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.usuarios)) return data.usuarios;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  },

  // POST /superadmin/empresas/{id}/admin
  async asignarAdmin(id: number | string, usuarioId: number | string): Promise<void> {
    await api.post(`/superadmin/empresas/${id}/admin`, { usuario_id: usuarioId });
  },

  // GET /superadmin/usuarios
  async getUsuarios(params?: GetUsuariosParams): Promise<UsuarioSuperAdminApi[]> {
    const response = await api.get<any>(`/superadmin/usuarios${buildQuery(params || {})}`);
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.usuarios)) return data.usuarios;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  },

  // PATCH /superadmin/usuarios/{id}/rol
  async cambiarRol(id: number | string, rolId: number | string): Promise<UsuarioSuperAdminApi> {
    const response = await api.patch<any>(`/superadmin/usuarios/${id}/rol`, { rol_id: rolId });
    return response.data?.usuario || response.data;
  },

  // PATCH /superadmin/usuarios/{id}/estado
  async toggleUsuarioEstado(id: number | string): Promise<UsuarioSuperAdminApi> {
    const response = await api.patch<any>(`/superadmin/usuarios/${id}/estado`);
    return response.data?.usuario || response.data;
  },

  // GET /superadmin/estadisticas
  async getEstadisticas(): Promise<EstadisticasGlobales> {
    const response = await api.get<any>('/superadmin/estadisticas');
    return response.data?.estadisticas || response.data;
  },
};
