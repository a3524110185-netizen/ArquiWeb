import { api } from './api';

export interface ConfiguracionEmpresaApi {
  nombre_empresa: string;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  rfc?: string | null;
  logo_path?: string | null;
}

export interface ConfiguracionEmpresaFormInput {
  nombre_empresa: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  rfc?: string;
}

export const configuracionService = {
  // GET /api/empresa/configuracion
  async obtener(): Promise<ConfiguracionEmpresaApi> {
    const response = await api.get<any>('/empresa/configuracion');
    return response.data?.configuracion || response.data;
  },

  // PUT /api/empresa/configuracion
  async actualizar(data: ConfiguracionEmpresaFormInput): Promise<ConfiguracionEmpresaApi> {
    const response = await api.put<any>('/empresa/configuracion', data);
    return response.data?.configuracion || response.data;
  },

  // POST /api/empresa/logo (multipart)
  async subirLogo(logo: File): Promise<ConfiguracionEmpresaApi> {
    const formData = new FormData();
    formData.append('logo', logo);
    const response = await api.upload<any>('/empresa/logo', formData, 'POST');
    return response.data?.configuracion || response.data;
  },
};
