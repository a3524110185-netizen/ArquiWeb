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

export const empresasService = {
  async crearEmpresa(data: EmpresaFormInput): Promise<EmpresaResumen> {
    const response = await api.post<{ empresa: EmpresaResumen }>('/empresas', data);
    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'No se pudo crear la empresa');
    }
    return response.data.empresa;
  },
};
