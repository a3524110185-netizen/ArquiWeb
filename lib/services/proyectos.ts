import { api, API_URL } from './api';
import { clientesService } from './clientes';

export interface FotoReporte {
  id: number;
  url: string;
  descripcion?: string | null;
  categoria?: string | null;
  es_principal: boolean;
}

export interface ReporteApi {
  id: number;
  proyecto_id: number;
  fecha_reporte: string;
  turno: string;
  categoria: string;
  avance: number;
  descripcion: string;
  validado: boolean | null;
  validado_por?: number | null;
  notas_validacion?: string | null;
  validado_el?: string | null;
  validador?: { id: number; nombre: string; email?: string } | null;
  estado?: 'pendiente' | 'aprobado' | 'rechazado';
  usuario: { id: number; nombre: string; email?: string; telefono?: string };
  fotos: FotoReporte[];
  fotos_count: number;
  created_at: string;
}

export interface Cliente {
  id: number;
  nombre: string;
  rfc?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

export interface UsuarioProyecto {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  foto_perfil?: string | null;
  pivot?: {
    proyecto_id: number;
    usuario_id: number;
    rol_proyecto?: string;
  };
  rol?: {
    id: number;
    nombre: string;
  };
}

export interface AsignacionMasivaDetalle {
  usuario_id: number;
  nombre?: string;
  estado: string;
  motivo?: string;
}

export interface AsignacionMasivaResultado {
  asignados: number;
  total: number;
  detalle: AsignacionMasivaDetalle[];
}

export interface ProyectoApi {
  id: number;
  codigo?: string;
  nombre: string;
  descripcion?: string | null;
  cliente_id?: number | null;
  cliente?: Cliente | null;
  ubicacion: string;
  latitud?: number | null;
  longitud?: number | null;
  fecha_inicio: string;
  fecha_fin: string;
  presupuesto: number;
  gastado?: number;
  imagen_portada?: string | null;
  estado: 'planeado' | 'a_tiempo' | 'retrasado' | 'critico' | 'completado' | string;
  avance?: number;
  avance_fisico?: number;
  avance_financiero?: number;
  incidencias_activas_count?: number;
  incidencias_count?: number;
  usuarios?: UsuarioProyecto[];
  created_at?: string;
  updated_at?: string;
}

export interface ProyectoFormInput {
  nombre: string;
  descripcion?: string;
  cliente_id?: number | string | null;
  ubicacion: string;
  latitud?: number | string | null;
  longitud?: number | string | null;
  fecha_inicio: string;
  fecha_fin: string;
  presupuesto: number | string;
  estado?: string;
  imagen_portada?: File | null | string;
}

export const proyectosService = {
  // GET /api/proyectos
  async getProyectos(): Promise<ProyectoApi[]> {
    const response = await api.get<any>('/proyectos');
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  },

  // GET /api/proyectos/{id}
  async getProyecto(id: number | string): Promise<ProyectoApi> {
    const response = await api.get<any>(`/proyectos/${id}`);
    return response.data || response;
  },

  // POST /api/proyectos
  async createProyecto(data: ProyectoFormInput): Promise<ProyectoApi> {
    // Si hay archivo de imagen, usar FormData
    if (data.imagen_portada instanceof File) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'imagen_portada' && value instanceof File) {
            formData.append('imagen_portada', value);
          } else {
            formData.append(key, String(value));
          }
        }
      });
      
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const res = await fetch(`${API_URL}/proyectos`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Error al crear proyecto');
      return result.data || result;
    }

    const response = await api.post<any>('/proyectos', data);
    return response.data || response;
  },

  // PUT /api/proyectos/{id}
  async updateProyecto(id: number | string, data: Partial<ProyectoFormInput>): Promise<ProyectoApi> {
    if (data.imagen_portada instanceof File) {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'imagen_portada' && value instanceof File) {
            formData.append('imagen_portada', value);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const res = await fetch(`${API_URL}/proyectos/${id}`, {
        method: 'POST', // POST con _method=PUT para manejo multipart en Laravel
        headers: {
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Error al actualizar proyecto');
      return result.data || result;
    }

    const response = await api.put<any>(`/proyectos/${id}`, data);
    return response.data || response;
  },

  // GET /api/proyectos/{id}/usuarios-disponibles?rol=...
  async getUsuariosDisponibles(proyectoId: number | string, rol: 'supervisor' | 'ingeniero'): Promise<UsuarioProyecto[]> {
    const response = await api.get<any>(`/proyectos/${proyectoId}/usuarios-disponibles?rol=${rol}`);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    return [];
  },

  // POST /api/proyectos/{id}/usuarios
  async asignarUsuario(proyectoId: number | string, usuarioId: number | string, rol?: string): Promise<any> {
    const response = await api.post<any>(`/proyectos/${proyectoId}/usuarios`, {
      usuario_id: Number(usuarioId),
      rol: rol
    });
    return response.data || response;
  },

  // POST /api/proyectos/{id}/asignar-masivo
  async asignarMasivo(
    proyectoId: number | string,
    usuarioIds: (number | string)[],
    rol?: 'supervisor' | 'ingeniero'
  ): Promise<AsignacionMasivaResultado> {
    const response = await api.post<any>(`/proyectos/${proyectoId}/asignar-masivo`, {
      usuario_ids: usuarioIds.map(Number),
      ...(rol ? { rol } : {}),
    });
    const data = response.data || {};
    return {
      asignados: Number(data.asignados ?? 0),
      total: Number(data.total ?? usuarioIds.length),
      detalle: Array.isArray(data.detalle) ? data.detalle : [],
    };
  },

  // DELETE /api/proyectos/{id}/usuarios/{usuarioId}
  async removerUsuario(proyectoId: number | string, usuarioId: number | string): Promise<any> {
    const response = await api.delete<any>(`/proyectos/${proyectoId}/usuarios/${usuarioId}`);
    return response.data || response;
  },

  // GET /api/clientes
  async getClientes(): Promise<Cliente[]> {
    const clientes = await clientesService.getClientes();
    return clientes.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      rfc: c.rfc ?? undefined,
      email: c.email ?? undefined,
      telefono: c.telefono ?? undefined,
      direccion: c.direccion ?? undefined,
    }));
  },

  // GET /api/proyectos/{id}/reportes
  async getReportes(proyectoId: number | string): Promise<ReporteApi[]> {
    const response = await api.get<any>(`/proyectos/${proyectoId}/reportes`);
    // Handles both { data: [...] } and { data: { reportes: [...] } }
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.reportes)) return response.data.reportes;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    return [];
  },

  // GET /api/proyectos/{id}/actividad
  async getActividad(proyectoId: number | string): Promise<any[]> {
    const response = await api.get<any>(`/proyectos/${proyectoId}/actividad`);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    return [];
  },

  // GET /api/proyectos/{id}/incidencias
  async getIncidencias(proyectoId: number | string): Promise<any[]> {
    const response = await api.get<any>(`/proyectos/${proyectoId}/incidencias`);
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    return [];
  },

  // PUT /api/reportes/{id}/validar
  async validarReporte(reporteId: number | string, accion: 'aprobar' | 'rechazar', notas?: string): Promise<any> {
    const payload: any = { accion };
    if (notas) payload.notas = notas;
    const response = await api.put<any>(`/reportes/${reporteId}/validar`, payload);
    return response.data || response;
  },
};
