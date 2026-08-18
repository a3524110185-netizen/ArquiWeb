import { api } from './api';
import type { EmpresaResumen } from '@/types';

export interface EmpresaFormInput {
  nombre: string;
  razon_social: string;
  rfc?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

export interface EmpresaOption {
  id: number;
  nombre: string;
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

export const empresasService = {
  // GET /api/empresas
  async getEmpresas(): Promise<EmpresaOption[]> {
    const response = await api.get<any>('/empresas');
    return extractArray<EmpresaOption>(response.data, ['empresas']);
  },

  async crearEmpresa(data: EmpresaFormInput): Promise<EmpresaResumen> {
    const response = await api.post<{ empresa: EmpresaResumen }>('/empresas', data);
    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'No se pudo crear la empresa');
    }
    return response.data.empresa;
  },
};
