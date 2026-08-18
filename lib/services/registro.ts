import { api } from './api';

export interface RegistroData {
  nombre: string;
  email: string;
  telefono?: string;
  password: string;
  password_confirmation: string;
  empresa_id: number;
  departamento_id: number;
}

export const registroService = {
  // POST /api/registro
  async registrar(data: RegistroData): Promise<void> {
    const response = await api.post('/registro', data);
    if (response.status !== 'success') {
      throw new Error(response.message || 'No se pudo completar el registro');
    }
  },
};
