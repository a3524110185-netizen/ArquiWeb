import { api } from './api';

function buildFormData(data: Record<string, unknown>): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (value instanceof File) formData.append(key, value);
    else formData.append(key, String(value));
  });
  return formData;
}

export interface RolApi {
  id: number;
  nombre: string;
}

export interface DepartamentoResumen {
  id: number;
  nombre: string;
}

export interface UsuarioApi {
  id: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  foto_perfil?: string | null;
  activo: boolean;
  rol_id?: number;
  rol?: RolApi;
  departamento_id?: number | null;
  departamento?: DepartamentoResumen | null;
  ultimo_acceso?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UsuarioFormInput {
  nombre: string;
  email: string;
  password?: string;
  rol_id: number | string;
  telefono?: string;
  departamento_id?: number | string | null;
  foto_perfil?: File | null;
}

// Fallback usado solo si GET /api/roles no está disponible.
// Orden asumido según los roles fijos del sistema.
export const ROLES_FALLBACK: RolApi[] = [
  { id: 1, nombre: 'administrador' },
  { id: 2, nombre: 'gerente' },
  { id: 3, nombre: 'supervisor' },
  { id: 4, nombre: 'ingeniero' },
];

export const usuariosService = {
  // GET /api/usuarios (activo por defecto), ?activo=0, ?activo=todos
  async getUsuarios(activo?: 'todos' | '0' | '1'): Promise<UsuarioApi[]> {
    const query = activo ? `?activo=${activo}` : '';
    const response = await api.get<any>(`/usuarios${query}`);
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.usuarios)) return data.usuarios;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  },

  // GET /api/usuarios/{id}
  async getUsuario(id: number | string): Promise<UsuarioApi> {
    const response = await api.get<any>(`/usuarios/${id}`);
    return response.data?.usuario || response.data;
  },

  // POST /api/usuarios
  async createUsuario(data: UsuarioFormInput): Promise<UsuarioApi> {
    const response = await api.post<any>('/usuarios', data);
    return response.data?.usuario || response.data;
  },

  // PUT /api/usuarios/{id} (multipart si se incluye foto_perfil)
  async updateUsuario(id: number | string, data: Partial<UsuarioFormInput> & { activo?: boolean }): Promise<UsuarioApi> {
    if (data.foto_perfil instanceof File) {
      const response = await api.upload<any>(`/usuarios/${id}`, buildFormData(data), 'PUT');
      return response.data?.usuario || response.data;
    }
    const { foto_perfil: _fotoPerfil, ...rest } = data;
    const response = await api.put<any>(`/usuarios/${id}`, rest);
    return response.data?.usuario || response.data;
  },

  // DELETE /api/usuarios/{id} (soft delete)
  async deleteUsuario(id: number | string): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  },

  // GET /api/roles (si existe); si no, usar ROLES_FALLBACK
  async getRoles(): Promise<RolApi[]> {
    try {
      const response = await api.get<any>('/roles');
      const data = response.data;
      if (Array.isArray(data) && data.length > 0) return data;
      if (data && Array.isArray(data.roles) && data.roles.length > 0) return data.roles;
      if (data && Array.isArray(data.data) && data.data.length > 0) return data.data;
    } catch {
      // Endpoint no disponible, se usa el fallback
    }
    return ROLES_FALLBACK;
  },
};
