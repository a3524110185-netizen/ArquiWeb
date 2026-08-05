import { api } from './api';
import { DIA_SEMANA_A_NUMERO, NUMERO_A_DIA_SEMANA } from '../constants/dias';

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

// ─── Horarios ──────────────────────────────────────────────────────────────
export const DIAS_SEMANA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'] as const;
export type DiaSemana = typeof DIAS_SEMANA[number];

export const DIA_LABEL: Record<DiaSemana, string> = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves',
  viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
};

export interface HorarioApi {
  id?: number;
  dia_semana: DiaSemana;
  es_laboral: boolean;
  hora_inicio: string | null;
  hora_fin: string | null;
}

// La API representa dia_semana como entero 1-7; internamente la app lo maneja
// como string ('lunes'...'domingo') porque se usa como key de un Record<DiaSemana, HorarioApi>.
function normalizarHorario(h: any): HorarioApi {
  const dia = typeof h.dia_semana === 'number' || /^\d+$/.test(String(h.dia_semana))
    ? NUMERO_A_DIA_SEMANA[Number(h.dia_semana)]
    : String(h.dia_semana).toLowerCase();
  return { ...h, dia_semana: dia as DiaSemana };
}

export const rhService = {
  // GET /api/horarios
  async getHorarios(): Promise<HorarioApi[]> {
    const response = await api.get<any>('/horarios');
    return extractArray<HorarioApi>(response.data, ['horarios']).map(normalizarHorario);
  },

  // POST /api/horarios
  async crearHorario(data: HorarioApi): Promise<HorarioApi> {
    const payload = { ...data, dia_semana: DIA_SEMANA_A_NUMERO[data.dia_semana] };
    const response = await api.post<any>('/horarios', payload);
    return normalizarHorario(response.data?.horario || response.data);
  },

  // PUT /api/horarios/{id}
  async actualizarHorario(id: number, data: Partial<HorarioApi>): Promise<HorarioApi> {
    const payload = {
      ...data,
      dia_semana: data.dia_semana ? DIA_SEMANA_A_NUMERO[data.dia_semana] : undefined,
    };
    const response = await api.put<any>(`/horarios/${id}`, payload);
    return normalizarHorario(response.data?.horario || response.data);
  },

  // ─── Días No Laborales ─────────────────────────────────────────────────
  // GET /api/dias-no-laborales?mes=&anio=
  async getDiasNoLaborales(mes?: number, anio?: number): Promise<DiaNoLaboralApi[]> {
    const query = new URLSearchParams();
    if (mes) query.append('mes', String(mes));
    if (anio) query.append('anio', String(anio));
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await api.get<any>(`/dias-no-laborales${queryString}`);
    return extractArray<DiaNoLaboralApi>(response.data, ['dias', 'dias_no_laborales']);
  },

  // POST /api/dias-no-laborales
  async crearDiaNoLaboral(data: DiaNoLaboralFormInput): Promise<DiaNoLaboralApi> {
    const response = await api.post<any>('/dias-no-laborales', data);
    return response.data?.dia || response.data;
  },

  // DELETE /api/dias-no-laborales/{id}
  async eliminarDiaNoLaboral(id: number): Promise<void> {
    await api.delete(`/dias-no-laborales/${id}`);
  },

  // ─── Reporte de Horas ──────────────────────────────────────────────────
  // GET /api/reporte-horas?usuario_id=&desde=&hasta=&proyecto_id=
  async getReporteHoras(params: ReporteHorasParams): Promise<ReporteHorasUsuario[]> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') query.append(key, String(val));
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await api.get<any>(`/reporte-horas${queryString}`);
    return extractArray<ReporteHorasUsuario>(response.data, ['resumen', 'reporte', 'usuarios']);
  },

  // ─── Control Horario ───────────────────────────────────────────────────
  // GET /api/control-horario?usuario_id=&proyecto_id=&desde=&hasta=&estado=
  async getControlHorario(params: ControlHorarioParams): Promise<ControlHorarioRegistro[]> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') query.append(key, String(val));
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await api.get<any>(`/control-horario${queryString}`);
    return extractArray<ControlHorarioRegistro>(response.data, ['registros', 'control']);
  },
};

export type TipoDiaNoLaboral = 'festivo' | 'vacaciones' | 'descanso';

export interface DiaNoLaboralApi {
  id: number;
  fecha: string;
  descripcion: string;
  tipo: TipoDiaNoLaboral;
}

export interface DiaNoLaboralFormInput {
  fecha: string;
  descripcion: string;
  tipo: TipoDiaNoLaboral;
}

export interface ReporteHorasParams {
  usuario_id?: number | string;
  proyecto_id?: number | string;
  desde?: string;
  hasta?: string;
}

export interface ReporteHorasDia {
  fecha: string;
  entrada?: string | null;
  salida?: string | null;
  horas_trabajadas: number;
  horas_extra: number;
  estado: string;
}

export interface ReporteHorasUsuario {
  usuario_id: number;
  usuario?: { id: number; nombre: string };
  total_horas: number;
  horas_extra: number;
  faltas: number;
  detalle?: ReporteHorasDia[];
}

export interface ControlHorarioParams {
  usuario_id?: number | string;
  proyecto_id?: number | string;
  desde?: string;
  hasta?: string;
  estado?: string;
}

export interface ControlHorarioRegistro {
  id: number;
  usuario_id: number;
  usuario?: { id: number; nombre: string };
  proyecto_id?: number | null;
  proyecto?: { id: number; nombre: string } | null;
  fecha: string;
  entrada?: string | null;
  salida?: string | null;
  comida_inicio?: string | null;
  comida_fin?: string | null;
  horas?: number;
  estado: 'completo' | 'incompleto' | 'falta' | string;
}
