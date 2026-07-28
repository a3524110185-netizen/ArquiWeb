import { api } from './api';
import type { AuthUser, EmpresaResumen } from '@/types';

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post<{ token: string; usuario: AuthUser }>('/auth/login', {
      email,
      password,
    });
    return response;
  },

  async logout() {
    return api.post('/auth/logout');
  },

  async getUsuario() {
    return api.get<AuthUser | { usuario: AuthUser }>('/auth/me');
  },

  async cambiarEmpresa(empresaId: number) {
    return api.put<{ empresa: EmpresaResumen }>('/auth/cambiar-empresa', { empresa_id: empresaId });
  },
};
