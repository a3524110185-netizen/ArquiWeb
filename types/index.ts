// ─── Auth ────────────────────────────────────────────────────────────────────
export type AuthRole = 'administrador' | 'gerente' | 'supervisor' | 'ingeniero';

export interface EmpresaResumen {
  id: number;
  nombre: string;
}

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  foto_perfil: string | null;
  rol: {
    id: number;
    nombre: AuthRole;
  };
  proyectos?: any[];
  empresa_actual?: EmpresaResumen | null;
  empresas_disponibles?: EmpresaResumen[];
}

// ─── Existing Roles ───────────────────────────────────────────────────────────
export type Role =
  | 'SuperAdmin'
  | 'Administrador'
  | 'Gerente'
  | 'Arquitecto'
  | 'Capturista'
  | 'Supervisor'
  | 'Ingeniero'
  | 'Ventas'
  | 'Almacenista'
  | 'Operativo';

export type ProjectStatus = 'En progreso' | 'Completado' | 'Pausado' | 'Por iniciar';

export type IncidenciaSeveridad = 'Crítica' | 'Alta' | 'Media' | 'Baja';

export type IncidenciaEstado = 'Abierto' | 'En Progreso' | 'Resuelto' | 'Cerrado';

export type ReporteEstado = 'Pendiente' | 'Aprobado' | 'Rechazado';

export type GastoCategoria = 'Materiales' | 'Mano de obra' | 'Equipo' | 'Transporte' | 'Otros';

export type Turno = 'Matutino' | 'Vespertino' | 'Nocturno';

export type PlanLicencia = 'Básico' | 'Profesional' | 'Empresarial';

// ─── Empresa ─────────────────────────────────────────────────────────────────
export interface Empresa {
  id: string;
  nombre: string;
  rfc: string;
  direccion: string;
  telefono: string;
  email: string;
  logo?: string;
  estado: 'Activo' | 'Inactivo';
  plan: PlanLicencia;
  fechaVencimiento: string;
  usuariosCount: number;
  proyectosCount: number;
}

// ─── Licencia ─────────────────────────────────────────────────────────────────
export interface Licencia {
  id: string;
  empresaId: string;
  empresaNombre: string;
  plan: PlanLicencia;
  maxUsuarios: number;
  usuariosActuales: number;
  fechaInicio: string;
  fechaVencimiento: string;
  estado: 'Activa' | 'Por Vencer' | 'Vencida';
  precio: number;
}

// ─── Auditoría ────────────────────────────────────────────────────────────────
export type AuditoriaAccion = 'login' | 'logout' | 'create' | 'update' | 'delete' | 'view' | 'export';

export interface Auditoria {
  id: string;
  usuarioId: string;
  usuarioNombre: string;
  usuarioEmail: string;
  empresaId?: string;
  empresaNombre?: string;
  accion: AuditoriaAccion;
  recurso: string;
  detalle: string;
  fecha: string;
  ip: string;
}

// ─── Proyecto (extended) ──────────────────────────────────────────────────────
export interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string;
  avanceFisico: number;
  avanceFinanciero: number;
  presupuesto: number;
  gastado: number;
  estado: ProjectStatus;
  responsable: string;
  fechaInicio: string;
  fechaFin: string;
  ubicacion: string;
  equipo: string[];
  empresaId: string;
  empresaNombre?: string;
  arquitectoId?: string;
  supervisorId?: string;
}

// ─── Usuario (extended) ───────────────────────────────────────────────────────
export interface Usuario {
  id: string;
  nombre: string;
  rol: Role;
  email: string;
  telefono: string;
  estado: 'Activo' | 'Inactivo';
  ultimoAcceso: string;
  avatar: string;
  proyecto?: string;
  empresaId: string;
  empresaNombre?: string;
}

// ─── Timeline ────────────────────────────────────────────────────────────────
export interface TimelineEntry {
  fecha: string;
  accion: string;
  usuario: string;
  estado: IncidenciaEstado;
}

// ─── Incidencia ───────────────────────────────────────────────────────────────
export interface Incidencia {
  id: string;
  titulo: string;
  descripcion: string;
  severidad: IncidenciaSeveridad;
  estado: IncidenciaEstado;
  proyecto: string;
  proyectoId: string;
  responsable: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  fotos: string[];
  coordenadas: { lat: number; lng: number };
  categoria: string;
  timeline: TimelineEntry[];
}

// ─── Reporte Diario ───────────────────────────────────────────────────────────
export interface ReporteDiario {
  id: string;
  proyecto: string;
  proyectoId: string;
  fecha: string;
  turno: Turno;
  categoria: string;
  porcentajeAvance: number;
  descripcion: string;
  supervisor: string;
  fotos: string[];
  coordenadas: { lat: number; lng: number };
  estado: ReporteEstado;
  observaciones?: string;
}

// ─── Gasto ───────────────────────────────────────────────────────────────────
export interface Gasto {
  id: string;
  proyecto: string;
  proyectoId: string;
  categoria: GastoCategoria;
  monto: number;
  fecha: string;
  descripcion: string;
  comprobante?: string;
  capturista: string;
}

// ─── Registro Horario ─────────────────────────────────────────────────────────
export interface RegistroHorario {
  id: string;
  trabajadorId: string;
  trabajador: string;
  fecha: string;
  entrada?: string;
  inicioComida?: string;
  finComida?: string;
  salida?: string;
  horasNormales: number;
  horasExtras: number;
  estado: 'Completo' | 'Incompleto' | 'Ausente';
}

// ─── Día No Laboral ───────────────────────────────────────────────────────────
export interface DiaNolaboral {
  id: string;
  fecha: string;
  nombre: string;
  tipo: 'Nacional' | 'Local' | 'Empresa';
}

// ─── Categoría ────────────────────────────────────────────────────────────────
export interface Categoria {
  id: string;
  nombre: string;
  tipo: 'Gastos' | 'Incidencias' | 'Materiales';
  subcategorias: Subcategoria[];
  color?: string;
}

export interface Subcategoria {
  id: string;
  nombre: string;
  categoriaId: string;
}

// ─── Material ────────────────────────────────────────────────────────────────
export interface Material {
  id: string;
  nombre: string;
  categoria: string;
  unidad: string;
  stock: number;
  stockMinimo: number;
  precio: number;
  proveedor: string;
  estado: 'Normal' | 'Bajo' | 'Crítico';
}

// ─── Proveedor ───────────────────────────────────────────────────────────────
export interface Proveedor {
  id: string;
  empresa: string;
  contacto: string;
  email: string;
  telefono: string;
  especialidad: string;
  estado: 'Activo' | 'Inactivo';
  calificacion: number;
}

// ─── Cotización ───────────────────────────────────────────────────────────────
export interface CotizacionItem {
  id: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  subtotal: number;
}

export interface Cotizacion {
  id: string;
  numero: string;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string;
  proyectoId?: string;
  proyectoNombre?: string;
  items: CotizacionItem[];
  subtotal: number;
  iva: number;
  total: number;
  estado: 'Borrador' | 'Enviada' | 'Aceptada' | 'Rechazada' | 'Convertida';
  fechaCreacion: string;
  fechaVencimiento: string;
  notas?: string;
  empresaId: string;
}

// ─── Pedido de Venta ──────────────────────────────────────────────────────────
export interface PedidoVenta {
  id: string;
  numero: string;
  cotizacionId?: string;
  clienteNombre: string;
  clienteEmail: string;
  proyectoNombre?: string;
  items: CotizacionItem[];
  subtotal: number;
  iva: number;
  total: number;
  estado: 'Pendiente' | 'Confirmado' | 'En Proceso' | 'Entregado' | 'Cancelado';
  fechaCreacion: string;
  fechaEntrega: string;
  empresaId: string;
}

// ─── Venta ───────────────────────────────────────────────────────────────────
export interface Venta {
  id: string;
  numero: string;
  pedidoId?: string;
  clienteNombre: string;
  proyectoNombre?: string;
  total: number;
  iva: number;
  subtotal: number;
  metodoPago: 'Transferencia' | 'Cheque' | 'Efectivo' | 'Tarjeta';
  estado: 'Pagada' | 'Pendiente' | 'Vencida';
  fechaVenta: string;
  empresaId: string;
}

// ─── Actividad Reciente ───────────────────────────────────────────────────────
export interface ActividadReciente {
  id: string;
  tipo: 'reporte' | 'incidencia' | 'gasto' | 'horario' | 'validacion' | 'usuario';
  descripcion: string;
  proyecto: string;
  usuario: string;
  fecha: string;
  icono: string;
}

// ─── Notificación ─────────────────────────────────────────────────────────────
export interface Notificacion {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  leida: boolean;
  fecha: string;
}
