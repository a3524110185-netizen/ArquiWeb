import { create } from 'zustand';
import type {
  Proyecto, Usuario, Incidencia, ReporteDiario,
  RegistroHorario, DiaNolaboral, Categoria, Material, Proveedor,
  ActividadReciente, IncidenciaEstado,
  Empresa, Auditoria, Licencia, Cotizacion, CotizacionItem, PedidoVenta, Venta,
} from '@/types';
import { notificacionesService, type NotificacionApi } from '@/lib/services/notificaciones';

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────

const empresasMock: Empresa[] = [
  {
    id: 'e1', nombre: 'Constructora ABC', rfc: 'CABC990101AAA',
    direccion: 'Av. Industrial 450, Zona Norte, Guadalajara, Jalisco',
    telefono: '33-1000-2000', email: 'contacto@constructoraabc.mx',
    estado: 'Activo', plan: 'Profesional', fechaVencimiento: '2026-12-31',
    usuariosCount: 5, proyectosCount: 3,
  },
  {
    id: 'e2', nombre: 'Materiales XYZ', rfc: 'MXYZ010203BBB',
    direccion: 'Blvd. Comercio 120, Col. Centro, León, Guanajuato',
    telefono: '47-2000-3000', email: 'info@materialesxyz.mx',
    estado: 'Activo', plan: 'Básico', fechaVencimiento: '2026-03-15',
    usuariosCount: 3, proyectosCount: 2,
  },
  {
    id: 'e3', nombre: 'Ingeniería y Diseño S.A.', rfc: 'IDSA851201CCC',
    direccion: 'Calle Reforma 88, Col. Moderna, Ciudad de México',
    telefono: '55-3000-4000', email: 'administracion@ingydiseno.mx',
    estado: 'Activo', plan: 'Empresarial', fechaVencimiento: '2027-06-30',
    usuariosCount: 4, proyectosCount: 2,
  },
];

const licenciasMock: Licencia[] = [
  {
    id: 'lic1', empresaId: 'e1', empresaNombre: 'Constructora ABC',
    plan: 'Profesional', maxUsuarios: 20, usuariosActuales: 5,
    fechaInicio: '2026-01-01', fechaVencimiento: '2026-12-31',
    estado: 'Activa', precio: 4999,
  },
  {
    id: 'lic2', empresaId: 'e2', empresaNombre: 'Materiales XYZ',
    plan: 'Básico', maxUsuarios: 5, usuariosActuales: 3,
    fechaInicio: '2025-03-15', fechaVencimiento: '2026-03-15',
    estado: 'Por Vencer', precio: 999,
  },
  {
    id: 'lic3', empresaId: 'e3', empresaNombre: 'Ingeniería y Diseño S.A.',
    plan: 'Empresarial', maxUsuarios: 999, usuariosActuales: 4,
    fechaInicio: '2025-07-01', fechaVencimiento: '2027-06-30',
    estado: 'Activa', precio: 14999,
  },
];

const proyectosMock: Proyecto[] = [
  {
    id: 'p1', nombre: 'Puente Vehicular – Zona Norte',
    descripcion: 'Construcción de puente vehicular de 4 carriles sobre el Río Lerma, incluyendo obras de acceso.',
    avanceFisico: 45, avanceFinanciero: 42,
    presupuesto: 18500000, gastado: 7770000,
    estado: 'En progreso', responsable: 'Carlos Martínez',
    fechaInicio: '2024-01-15', fechaFin: '2025-06-30',
    ubicacion: 'Zona Norte, Km 12 Carretera Federal',
    equipo: ['u1', 'u5', 'u8'],
    empresaId: 'e1', empresaNombre: 'Constructora ABC',
    arquitectoId: 'u3', supervisorId: 'u1',
  },
  {
    id: 'p2', nombre: 'Remodelación del Parque Central',
    descripcion: 'Proyecto integral de rehabilitación del Parque Central con nuevas áreas verdes, iluminación LED y mobiliario urbano.',
    avanceFisico: 78, avanceFinanciero: 75,
    presupuesto: 4200000, gastado: 3150000,
    estado: 'En progreso', responsable: 'Ana García',
    fechaInicio: '2024-03-01', fechaFin: '2025-02-28',
    ubicacion: 'Centro Histórico, Av. Principal s/n',
    equipo: ['u2', 'u3', 'u7'],
    empresaId: 'e1', empresaNombre: 'Constructora ABC',
    arquitectoId: 'u2', supervisorId: 'u7',
  },
  {
    id: 'p3', nombre: 'Pavimentación Calle 5 de Mayo',
    descripcion: 'Pavimentación y señalización de 3.2 km de vialidad urbana con concreto hidráulico.',
    avanceFisico: 32, avanceFinanciero: 30,
    presupuesto: 6800000, gastado: 2040000,
    estado: 'En progreso', responsable: 'Luis Pérez',
    fechaInicio: '2024-06-01', fechaFin: '2025-08-31',
    ubicacion: 'Colonia Centro, Calle 5 de Mayo',
    equipo: ['u3', 'u6', 'u8'],
    empresaId: 'e2', empresaNombre: 'Materiales XYZ',
    arquitectoId: 'u9', supervisorId: 'u8',
  },
  {
    id: 'p4', nombre: 'Torre Corporativa Norte',
    descripcion: 'Edificio de 12 niveles con uso mixto: oficinas corporativas en pisos 1-8 y área comercial en planta baja.',
    avanceFisico: 62, avanceFinanciero: 58,
    presupuesto: 32000000, gastado: 18560000,
    estado: 'En progreso', responsable: 'Roberto Sánchez',
    fechaInicio: '2023-09-01', fechaFin: '2026-03-31',
    ubicacion: 'Zona Corporativa Norte, Blvd. Empresarial 450',
    equipo: ['u2', 'u5', 'u6'],
    empresaId: 'e1', empresaNombre: 'Constructora ABC',
    arquitectoId: 'u3', supervisorId: 'u5',
  },
  {
    id: 'p5', nombre: 'Edificio Administrativo Sur',
    descripcion: 'Construcción de edificio administrativo de 4 niveles para dependencia gubernamental.',
    avanceFisico: 100, avanceFinanciero: 98,
    presupuesto: 9500000, gastado: 9310000,
    estado: 'Completado', responsable: 'Ana García',
    fechaInicio: '2023-01-15', fechaFin: '2024-11-30',
    ubicacion: 'Zona Sur, Calle Benito Juárez 220',
    equipo: ['u1', 'u2', 'u4'],
    empresaId: 'e3', empresaNombre: 'Ingeniería y Diseño S.A.',
    arquitectoId: 'u10', supervisorId: 'u4',
  },
  {
    id: 'p6', nombre: 'Centro Comercial Las Palmas',
    descripcion: 'Diseño y construcción de centro comercial de 2 niveles con 45 locales comerciales.',
    avanceFisico: 18, avanceFinanciero: 15,
    presupuesto: 55000000, gastado: 8250000,
    estado: 'En progreso', responsable: 'Arq. Fernando Castro',
    fechaInicio: '2025-01-10', fechaFin: '2027-06-30',
    ubicacion: 'Blvd. Tecnológico 800, Monterrey, NL',
    equipo: ['u10', 'u11'],
    empresaId: 'e3', empresaNombre: 'Ingeniería y Diseño S.A.',
    arquitectoId: 'u10', supervisorId: 'u11',
  },
  {
    id: 'p7', nombre: 'Bodega Industrial Zona Sur',
    descripcion: 'Construcción de bodega de 2,400m² para almacenamiento y distribución logística.',
    avanceFisico: 55, avanceFinanciero: 50,
    presupuesto: 8200000, gastado: 4100000,
    estado: 'En progreso', responsable: 'Sandra Reyes',
    fechaInicio: '2024-09-01', fechaFin: '2025-09-30',
    ubicacion: 'Parque Industrial Sur, Km 8',
    equipo: ['u6', 'u12'],
    empresaId: 'e2', empresaNombre: 'Materiales XYZ',
    arquitectoId: 'u9', supervisorId: 'u12',
  },
];

const usuariosMock: Usuario[] = [
  { id: 'u1', nombre: 'Carlos Martínez', rol: 'Supervisor', email: 'carlos.martinez@arq.mx', telefono: '555-0101', estado: 'Activo', ultimoAcceso: '2025-05-31T09:15:00', avatar: 'CM', proyecto: 'Puente Vehicular', empresaId: 'e1', empresaNombre: 'Constructora ABC' },
  { id: 'u2', nombre: 'Ana García', rol: 'Gerente', email: 'ana.garcia@arq.mx', telefono: '555-0102', estado: 'Activo', ultimoAcceso: '2025-05-31T08:30:00', avatar: 'AG', proyecto: 'Torre Corporativa', empresaId: 'e1', empresaNombre: 'Constructora ABC' },
  { id: 'u3', nombre: 'Luis Pérez', rol: 'Administrador', email: 'luis.perez@arq.mx', telefono: '555-0103', estado: 'Activo', ultimoAcceso: '2025-05-30T17:00:00', avatar: 'LP', empresaId: 'e1', empresaNombre: 'Constructora ABC' },
  { id: 'u4', nombre: 'María López', rol: 'Capturista', email: 'maria.lopez@arq.mx', telefono: '555-0104', estado: 'Activo', ultimoAcceso: '2025-05-31T10:00:00', avatar: 'ML', proyecto: 'Edificio Sur', empresaId: 'e3', empresaNombre: 'Ingeniería y Diseño S.A.' },
  { id: 'u5', nombre: 'Roberto Sánchez', rol: 'Supervisor', email: 'roberto.sanchez@arq.mx', telefono: '555-0105', estado: 'Activo', ultimoAcceso: '2025-05-29T16:45:00', avatar: 'RS', proyecto: 'Torre Corporativa', empresaId: 'e1', empresaNombre: 'Constructora ABC' },
  { id: 'u6', nombre: 'Elena Ruiz', rol: 'Ventas', email: 'elena.ruiz@arq.mx', telefono: '555-0106', estado: 'Activo', ultimoAcceso: '2025-05-31T11:20:00', avatar: 'ER', empresaId: 'e2', empresaNombre: 'Materiales XYZ' },
  { id: 'u7', nombre: 'Javier Méndez', rol: 'Almacenista', email: 'javier.mendez@arq.mx', telefono: '555-0107', estado: 'Inactivo', ultimoAcceso: '2025-05-20T09:00:00', avatar: 'JM', proyecto: 'Parque Central', empresaId: 'e1', empresaNombre: 'Constructora ABC' },
  { id: 'u8', nombre: 'Patricia Flores', rol: 'Supervisor', email: 'patricia.flores@arq.mx', telefono: '555-0108', estado: 'Activo', ultimoAcceso: '2025-05-31T07:30:00', avatar: 'PF', proyecto: 'Calle 5 de Mayo', empresaId: 'e2', empresaNombre: 'Materiales XYZ' },
  { id: 'u9', nombre: 'Fernando Castro', rol: 'Arquitecto', email: 'fcastro@ingydis.mx', telefono: '555-0109', estado: 'Activo', ultimoAcceso: '2025-05-30T12:00:00', avatar: 'FC', empresaId: 'e3', empresaNombre: 'Ingeniería y Diseño S.A.' },
  { id: 'u10', nombre: 'Claudia Vega', rol: 'Arquitecto', email: 'cvega@ingydis.mx', telefono: '555-0110', estado: 'Activo', ultimoAcceso: '2025-05-31T08:00:00', avatar: 'CV', proyecto: 'Centro Comercial Las Palmas', empresaId: 'e3', empresaNombre: 'Ingeniería y Diseño S.A.' },
  { id: 'u11', nombre: 'Marco Torres', rol: 'Supervisor', email: 'marco.torres@ingydis.mx', telefono: '555-0111', estado: 'Activo', ultimoAcceso: '2025-05-29T09:30:00', avatar: 'MT', proyecto: 'Centro Comercial Las Palmas', empresaId: 'e3', empresaNombre: 'Ingeniería y Diseño S.A.' },
  { id: 'u12', nombre: 'Sandra Reyes', rol: 'Gerente', email: 'sreyes@materialesxyz.mx', telefono: '555-0112', estado: 'Activo', ultimoAcceso: '2025-05-31T10:45:00', avatar: 'SR', proyecto: 'Bodega Industrial', empresaId: 'e2', empresaNombre: 'Materiales XYZ' },
];

const incidenciasMock: Incidencia[] = [
  {
    id: 'i1', titulo: 'Fisura en pilote P-12',
    descripcion: 'Se detectó fisura diagonal de 2mm de ancho en el pilote P-12 de la cimentación del puente. Requiere evaluación estructural inmediata.',
    severidad: 'Crítica', estado: 'En Progreso',
    proyecto: 'Puente Vehicular – Zona Norte', proyectoId: 'p1',
    responsable: 'Roberto Sánchez', fechaCreacion: '2025-05-28T14:30:00', fechaActualizacion: '2025-05-30T09:00:00',
    fotos: ['https://picsum.photos/seed/inc1a/800/600', 'https://picsum.photos/seed/inc1b/800/600'],
    coordenadas: { lat: 20.6597, lng: -103.3496 }, categoria: 'Estructural',
    timeline: [
      { fecha: '2025-05-28T14:30:00', accion: 'Incidencia reportada desde app móvil', usuario: 'Carlos Martínez', estado: 'Abierto' },
      { fecha: '2025-05-29T08:00:00', accion: 'Asignada a Roberto Sánchez para evaluación', usuario: 'Ana García', estado: 'En Progreso' },
      { fecha: '2025-05-30T09:00:00', accion: 'Evaluación estructural en proceso', usuario: 'Roberto Sánchez', estado: 'En Progreso' },
    ],
  },
  {
    id: 'i2', titulo: 'Corte de energía en sector C',
    descripcion: 'Falla en el tablero eléctrico principal del sector C. Sin electricidad en 3 niveles del edificio.',
    severidad: 'Alta', estado: 'Abierto',
    proyecto: 'Torre Corporativa Norte', proyectoId: 'p4',
    responsable: 'Javier Méndez', fechaCreacion: '2025-05-31T07:45:00', fechaActualizacion: '2025-05-31T07:45:00',
    fotos: ['https://picsum.photos/seed/inc2a/800/600'],
    coordenadas: { lat: 20.6893, lng: -103.3572 }, categoria: 'Eléctrica',
    timeline: [
      { fecha: '2025-05-31T07:45:00', accion: 'Incidencia reportada', usuario: 'Patricia Flores', estado: 'Abierto' },
    ],
  },
  {
    id: 'i3', titulo: 'Fuga de agua en conexión hidráulica',
    descripcion: 'Fuga detectada en unión de tubería de 4\" en área de servicios sanitarios del nivel 2.',
    severidad: 'Media', estado: 'Resuelto',
    proyecto: 'Remodelación del Parque Central', proyectoId: 'p2',
    responsable: 'Carlos Martínez', fechaCreacion: '2025-05-25T11:20:00', fechaActualizacion: '2025-05-27T16:30:00',
    fotos: ['https://picsum.photos/seed/inc3a/800/600', 'https://picsum.photos/seed/inc3b/800/600'],
    coordenadas: { lat: 20.6728, lng: -103.3441 }, categoria: 'Hidrosanitaria',
    timeline: [
      { fecha: '2025-05-25T11:20:00', accion: 'Incidencia reportada', usuario: 'Ana García', estado: 'Abierto' },
      { fecha: '2025-05-26T09:00:00', accion: 'Plomero asignado', usuario: 'Luis Pérez', estado: 'En Progreso' },
      { fecha: '2025-05-27T16:30:00', accion: 'Reparación completada exitosamente', usuario: 'Carlos Martínez', estado: 'Resuelto' },
    ],
  },
  {
    id: 'i4', titulo: 'Señalización de seguridad faltante',
    descripcion: 'Ausencia de señales de seguridad en acceso norte de obra. Riesgo para trabajadores.',
    severidad: 'Baja', estado: 'Cerrado',
    proyecto: 'Pavimentación Calle 5 de Mayo', proyectoId: 'p3',
    responsable: 'Patricia Flores', fechaCreacion: '2025-05-20T08:00:00', fechaActualizacion: '2025-05-21T10:00:00',
    fotos: ['https://picsum.photos/seed/inc4a/800/600'],
    coordenadas: { lat: 20.6614, lng: -103.3608 }, categoria: 'Seguridad',
    timeline: [
      { fecha: '2025-05-20T08:00:00', accion: 'Incidencia reportada', usuario: 'Patricia Flores', estado: 'Abierto' },
      { fecha: '2025-05-21T10:00:00', accion: 'Señalización colocada', usuario: 'Javier Méndez', estado: 'Cerrado' },
    ],
  },
  {
    id: 'i5', titulo: 'Retraso en entrega de concreto',
    descripcion: 'Proveedor no entregó concreto premezclado en tiempo. 4 horas de retraso en colado programado.',
    severidad: 'Alta', estado: 'Cerrado',
    proyecto: 'Puente Vehicular – Zona Norte', proyectoId: 'p1',
    responsable: 'Ana García', fechaCreacion: '2025-05-22T06:30:00', fechaActualizacion: '2025-05-22T14:00:00',
    fotos: [],
    coordenadas: { lat: 20.6597, lng: -103.3496 }, categoria: 'Logística',
    timeline: [
      { fecha: '2025-05-22T06:30:00', accion: 'Retraso reportado', usuario: 'Carlos Martínez', estado: 'Abierto' },
      { fecha: '2025-05-22T14:00:00', accion: 'Concreto recibido y colado completado', usuario: 'Carlos Martínez', estado: 'Cerrado' },
    ],
  },
  {
    id: 'i6', titulo: 'Grieta en muro de contención',
    descripcion: 'Grieta horizontal de 3mm en muro de contención sector Este. Posible sobrepresión hidrostática.',
    severidad: 'Crítica', estado: 'Abierto',
    proyecto: 'Centro Comercial Las Palmas', proyectoId: 'p6',
    responsable: 'Fernando Castro', fechaCreacion: '2025-06-01T09:00:00', fechaActualizacion: '2025-06-01T09:00:00',
    fotos: ['https://picsum.photos/seed/inc6a/800/600'],
    coordenadas: { lat: 25.6866, lng: -100.3161 }, categoria: 'Estructural',
    timeline: [
      { fecha: '2025-06-01T09:00:00', accion: 'Incidencia detectada en inspección', usuario: 'Claudia Vega', estado: 'Abierto' },
    ],
  },
  {
    id: 'i7', titulo: 'Defecto en acabado de fachada',
    descripcion: 'Pintura con eflorescencia en fachada sur. Área afectada: 45m².',
    severidad: 'Media', estado: 'En Progreso',
    proyecto: 'Bodega Industrial Zona Sur', proyectoId: 'p7',
    responsable: 'Sandra Reyes', fechaCreacion: '2025-05-28T11:00:00', fechaActualizacion: '2025-05-30T14:00:00',
    fotos: ['https://picsum.photos/seed/inc7a/800/600', 'https://picsum.photos/seed/inc7b/800/600'],
    coordenadas: { lat: 20.6614, lng: -103.3608 }, categoria: 'Acabados',
    timeline: [
      { fecha: '2025-05-28T11:00:00', accion: 'Defecto reportado por supervisor', usuario: 'Patricia Flores', estado: 'Abierto' },
      { fecha: '2025-05-30T14:00:00', accion: 'Empresa pintora notificada', usuario: 'Sandra Reyes', estado: 'En Progreso' },
    ],
  },
  {
    id: 'i8', titulo: 'Equipo pesado sin señalización',
    descripcion: 'Grúa torre sin conos de seguridad perimetral durante operación.',
    severidad: 'Alta', estado: 'Resuelto',
    proyecto: 'Torre Corporativa Norte', proyectoId: 'p4',
    responsable: 'Roberto Sánchez', fechaCreacion: '2025-05-27T07:00:00', fechaActualizacion: '2025-05-27T10:00:00',
    fotos: ['https://picsum.photos/seed/inc8a/800/600'],
    coordenadas: { lat: 20.6893, lng: -103.3572 }, categoria: 'Seguridad',
    timeline: [
      { fecha: '2025-05-27T07:00:00', accion: 'Situación reportada', usuario: 'Roberto Sánchez', estado: 'Abierto' },
      { fecha: '2025-05-27T10:00:00', accion: 'Señalización colocada, área despejada', usuario: 'Roberto Sánchez', estado: 'Resuelto' },
    ],
  },
  {
    id: 'i9', titulo: 'Material dañado por lluvia',
    descripcion: 'Sacos de cemento expuestos a lluvia sin cobertura. Pérdida estimada: 150 bultos.',
    severidad: 'Media', estado: 'Cerrado',
    proyecto: 'Pavimentación Calle 5 de Mayo', proyectoId: 'p3',
    responsable: 'Patricia Flores', fechaCreacion: '2025-05-18T16:00:00', fechaActualizacion: '2025-05-19T08:00:00',
    fotos: ['https://picsum.photos/seed/inc9a/800/600'],
    coordenadas: { lat: 20.6614, lng: -103.3608 }, categoria: 'Logística',
    timeline: [
      { fecha: '2025-05-18T16:00:00', accion: 'Daño detectado', usuario: 'Patricia Flores', estado: 'Abierto' },
      { fecha: '2025-05-19T08:00:00', accion: 'Reposición de material gestionada', usuario: 'Sandra Reyes', estado: 'Cerrado' },
    ],
  },
  {
    id: 'i10', titulo: 'Instalación eléctrica incorrecta',
    descripcion: 'Cableado de tablero secundario no cumple con especificaciones técnicas del proyecto.',
    severidad: 'Alta', estado: 'En Progreso',
    proyecto: 'Remodelación del Parque Central', proyectoId: 'p2',
    responsable: 'Javier Méndez', fechaCreacion: '2025-05-30T10:00:00', fechaActualizacion: '2025-05-31T09:00:00',
    fotos: ['https://picsum.photos/seed/inc10a/800/600', 'https://picsum.photos/seed/inc10b/800/600'],
    coordenadas: { lat: 20.6728, lng: -103.3441 }, categoria: 'Eléctrica',
    timeline: [
      { fecha: '2025-05-30T10:00:00', accion: 'Problema detectado en revisión técnica', usuario: 'Luis Pérez', estado: 'Abierto' },
      { fecha: '2025-05-31T09:00:00', accion: 'Electricista especialista contratado', usuario: 'Ana García', estado: 'En Progreso' },
    ],
  },
];

const reportesMock: ReporteDiario[] = [
  { id: 'r1', proyecto: 'Puente Vehicular – Zona Norte', proyectoId: 'p1', fecha: '2025-05-31', turno: 'Matutino', categoria: 'Estructural', porcentajeAvance: 45, descripcion: 'Se colocaron 6 viguetas pretensadas en el tramo 3. Avance en colado de losa.', supervisor: 'Carlos Martínez', fotos: ['https://picsum.photos/seed/r1a/800/600', 'https://picsum.photos/seed/r1b/800/600', 'https://picsum.photos/seed/r1c/800/600'], coordenadas: { lat: 20.6597, lng: -103.3496 }, estado: 'Pendiente' },
  { id: 'r2', proyecto: 'Remodelación del Parque Central', proyectoId: 'p2', fecha: '2025-05-31', turno: 'Matutino', categoria: 'Acabados', porcentajeAvance: 78, descripcion: 'Instalación de adoquín en zona de acceso principal. 120m² completados.', supervisor: 'Ana García', fotos: ['https://picsum.photos/seed/r2a/800/600', 'https://picsum.photos/seed/r2b/800/600'], coordenadas: { lat: 20.6728, lng: -103.3441 }, estado: 'Aprobado' },
  { id: 'r3', proyecto: 'Torre Corporativa Norte', proyectoId: 'p4', fecha: '2025-05-30', turno: 'Matutino', categoria: 'Estructural', porcentajeAvance: 62, descripcion: 'Colado de columnas nivel 9. 8 columnas completadas de 12 programadas.', supervisor: 'Roberto Sánchez', fotos: ['https://picsum.photos/seed/r3a/800/600', 'https://picsum.photos/seed/r3b/800/600', 'https://picsum.photos/seed/r3c/800/600', 'https://picsum.photos/seed/r3d/800/600'], coordenadas: { lat: 20.6893, lng: -103.3572 }, estado: 'Aprobado' },
  { id: 'r4', proyecto: 'Pavimentación Calle 5 de Mayo', proyectoId: 'p3', fecha: '2025-05-30', turno: 'Vespertino', categoria: 'Pavimento', porcentajeAvance: 32, descripcion: 'Sub-base compactada en tramo km 1.2 a km 1.8. Densidad de compactación al 95%.', supervisor: 'Luis Pérez', fotos: ['https://picsum.photos/seed/r4a/800/600'], coordenadas: { lat: 20.6614, lng: -103.3608 }, estado: 'Pendiente' },
  { id: 'r5', proyecto: 'Puente Vehicular – Zona Norte', proyectoId: 'p1', fecha: '2025-05-29', turno: 'Matutino', categoria: 'Estructural', porcentajeAvance: 44, descripcion: 'Trabajos de impermeabilización en cabezal norte. Aplicación de membrana bituminosa.', supervisor: 'Carlos Martínez', fotos: ['https://picsum.photos/seed/r5a/800/600', 'https://picsum.photos/seed/r5b/800/600'], coordenadas: { lat: 20.6597, lng: -103.3496 }, estado: 'Aprobado' },
  { id: 'r6', proyecto: 'Remodelación del Parque Central', proyectoId: 'p2', fecha: '2025-05-29', turno: 'Matutino', categoria: 'Eléctrico', porcentajeAvance: 76, descripcion: 'Instalación de 24 luminarias LED en zona sur del parque.', supervisor: 'Ana García', fotos: ['https://picsum.photos/seed/r6a/800/600'], coordenadas: { lat: 20.6728, lng: -103.3441 }, estado: 'Rechazado', observaciones: 'Fotos de mala calidad. Requiere re-envío de evidencia.' },
  { id: 'r7', proyecto: 'Torre Corporativa Norte', proyectoId: 'p4', fecha: '2025-05-28', turno: 'Nocturno', categoria: 'Estructural', porcentajeAvance: 61, descripcion: 'Armado de cimbra para losa nivel 9. Trabajo nocturno programado.', supervisor: 'Roberto Sánchez', fotos: ['https://picsum.photos/seed/r7a/800/600', 'https://picsum.photos/seed/r7b/800/600'], coordenadas: { lat: 20.6893, lng: -103.3572 }, estado: 'Aprobado' },
  { id: 'r8', proyecto: 'Pavimentación Calle 5 de Mayo', proyectoId: 'p3', fecha: '2025-05-28', turno: 'Matutino', categoria: 'Pavimento', porcentajeAvance: 30, descripcion: 'Excavación y extracción de material en tramo km 0.8 a km 1.2.', supervisor: 'Luis Pérez', fotos: ['https://picsum.photos/seed/r8a/800/600'], coordenadas: { lat: 20.6614, lng: -103.3608 }, estado: 'Aprobado' },
  { id: 'r9', proyecto: 'Puente Vehicular – Zona Norte', proyectoId: 'p1', fecha: '2025-05-27', turno: 'Matutino', categoria: 'Cimentación', porcentajeAvance: 43, descripcion: 'Pruebas de carga en pilotes P-1 al P-8. Resultados conformes a especificaciones.', supervisor: 'Carlos Martínez', fotos: ['https://picsum.photos/seed/r9a/800/600', 'https://picsum.photos/seed/r9b/800/600'], coordenadas: { lat: 20.6597, lng: -103.3496 }, estado: 'Aprobado' },
  { id: 'r10', proyecto: 'Remodelación del Parque Central', proyectoId: 'p2', fecha: '2025-05-27', turno: 'Matutino', categoria: 'Acabados', porcentajeAvance: 74, descripcion: 'Pintura de barda perimetral. Primera mano aplicada en 85m lineales.', supervisor: 'Ana García', fotos: ['https://picsum.photos/seed/r10a/800/600'], coordenadas: { lat: 20.6728, lng: -103.3441 }, estado: 'Pendiente' },
  { id: 'r11', proyecto: 'Centro Comercial Las Palmas', proyectoId: 'p6', fecha: '2025-05-31', turno: 'Matutino', categoria: 'Estructural', porcentajeAvance: 18, descripcion: 'Excavación de cajón de cimentación, fase 2. Extracción de 320m³ de material.', supervisor: 'Marco Torres', fotos: ['https://picsum.photos/seed/r11a/800/600', 'https://picsum.photos/seed/r11b/800/600'], coordenadas: { lat: 25.6866, lng: -100.3161 }, estado: 'Pendiente' },
  { id: 'r12', proyecto: 'Bodega Industrial Zona Sur', proyectoId: 'p7', fecha: '2025-05-30', turno: 'Matutino', categoria: 'Estructural', porcentajeAvance: 55, descripcion: 'Colocación de cubierta metálica. 40% de la nave completada.', supervisor: 'Sandra Reyes', fotos: ['https://picsum.photos/seed/r12a/800/600'], coordenadas: { lat: 20.6614, lng: -103.3608 }, estado: 'Aprobado' },
  { id: 'r13', proyecto: 'Torre Corporativa Norte', proyectoId: 'p4', fecha: '2025-05-26', turno: 'Vespertino', categoria: 'Acabados', porcentajeAvance: 60, descripcion: 'Instalación de cancelería de aluminio en pisos 3 y 4.', supervisor: 'Roberto Sánchez', fotos: ['https://picsum.photos/seed/r13a/800/600', 'https://picsum.photos/seed/r13b/800/600'], coordenadas: { lat: 20.6893, lng: -103.3572 }, estado: 'Aprobado' },
  { id: 'r14', proyecto: 'Puente Vehicular – Zona Norte', proyectoId: 'p1', fecha: '2025-05-25', turno: 'Matutino', categoria: 'Cimentación', porcentajeAvance: 42, descripcion: 'Colado de zapata Z-5 y Z-6 de pilares centrales.', supervisor: 'Carlos Martínez', fotos: ['https://picsum.photos/seed/r14a/800/600'], coordenadas: { lat: 20.6597, lng: -103.3496 }, estado: 'Aprobado' },
  { id: 'r15', proyecto: 'Bodega Industrial Zona Sur', proyectoId: 'p7', fecha: '2025-05-29', turno: 'Matutino', categoria: 'Eléctrico', porcentajeAvance: 53, descripcion: 'Canalización de tubería conduit para instalación eléctrica industrial.', supervisor: 'Sandra Reyes', fotos: ['https://picsum.photos/seed/r15a/800/600', 'https://picsum.photos/seed/r15b/800/600'], coordenadas: { lat: 20.6614, lng: -103.3608 }, estado: 'Aprobado' },
];

const horariosMock: RegistroHorario[] = [
  { id: 'h1', trabajadorId: 'u1', trabajador: 'Carlos Martínez', fecha: '2025-05-26', entrada: '07:00', inicioComida: '13:00', finComida: '14:00', salida: '17:00', horasNormales: 9, horasExtras: 0, estado: 'Completo' },
  { id: 'h2', trabajadorId: 'u1', trabajador: 'Carlos Martínez', fecha: '2025-05-27', entrada: '07:00', inicioComida: '13:00', finComida: '14:00', salida: '19:30', horasNormales: 9, horasExtras: 2.5, estado: 'Completo' },
  { id: 'h3', trabajadorId: 'u1', trabajador: 'Carlos Martínez', fecha: '2025-05-28', entrada: '06:30', inicioComida: '12:30', finComida: '13:30', salida: '17:00', horasNormales: 9, horasExtras: 0.5, estado: 'Completo' },
  { id: 'h4', trabajadorId: 'u1', trabajador: 'Carlos Martínez', fecha: '2025-05-29', entrada: '07:00', inicioComida: '13:00', finComida: '14:00', salida: '17:00', horasNormales: 9, horasExtras: 0, estado: 'Completo' },
  { id: 'h5', trabajadorId: 'u1', trabajador: 'Carlos Martínez', fecha: '2025-05-30', entrada: '07:00', inicioComida: '13:00', finComida: '14:00', salida: '18:00', horasNormales: 9, horasExtras: 1, estado: 'Completo' },
  { id: 'h6', trabajadorId: 'u5', trabajador: 'Roberto Sánchez', fecha: '2025-05-26', entrada: '08:00', inicioComida: '14:00', finComida: '15:00', salida: '18:00', horasNormales: 9, horasExtras: 0, estado: 'Completo' },
  { id: 'h7', trabajadorId: 'u5', trabajador: 'Roberto Sánchez', fecha: '2025-05-27', entrada: '08:00', inicioComida: '14:00', finComida: '15:00', salida: '21:00', horasNormales: 9, horasExtras: 3, estado: 'Completo' },
  { id: 'h8', trabajadorId: 'u5', trabajador: 'Roberto Sánchez', fecha: '2025-05-28', entrada: '08:00', inicioComida: '14:00', finComida: '15:00', salida: '18:00', horasNormales: 9, horasExtras: 0, estado: 'Completo' },
  { id: 'h9', trabajadorId: 'u5', trabajador: 'Roberto Sánchez', fecha: '2025-05-29', entrada: '08:00', inicioComida: '14:00', finComida: '15:00', salida: '18:00', horasNormales: 9, horasExtras: 0, estado: 'Completo' },
  { id: 'h10', trabajadorId: 'u5', trabajador: 'Roberto Sánchez', fecha: '2025-05-30', entrada: '08:00', inicioComida: '14:00', finComida: '15:00', salida: '18:30', horasNormales: 9, horasExtras: 0.5, estado: 'Completo' },
  { id: 'h11', trabajadorId: 'u8', trabajador: 'Patricia Flores', fecha: '2025-05-26', entrada: '07:30', inicioComida: '13:00', finComida: '14:00', salida: '16:30', horasNormales: 8, horasExtras: 0, estado: 'Completo' },
  { id: 'h12', trabajadorId: 'u8', trabajador: 'Patricia Flores', fecha: '2025-05-27', entrada: '07:30', inicioComida: '13:00', finComida: '14:00', salida: '16:30', horasNormales: 8, horasExtras: 0, estado: 'Completo' },
  { id: 'h13', trabajadorId: 'u8', trabajador: 'Patricia Flores', fecha: '2025-05-28', entrada: '07:30', inicioComida: '13:00', finComida: '14:00', salida: '16:30', horasNormales: 8, horasExtras: 0, estado: 'Completo' },
  { id: 'h14', trabajadorId: 'u8', trabajador: 'Patricia Flores', fecha: '2025-05-29', estado: 'Ausente', horasNormales: 0, horasExtras: 0 },
  { id: 'h15', trabajadorId: 'u8', trabajador: 'Patricia Flores', fecha: '2025-05-30', entrada: '07:30', inicioComida: '13:00', finComida: '14:00', salida: '16:30', horasNormales: 8, horasExtras: 0, estado: 'Completo' },
  { id: 'h16', trabajadorId: 'u2', trabajador: 'Ana García', fecha: '2025-05-26', entrada: '09:00', inicioComida: '14:00', finComida: '15:00', salida: '18:00', horasNormales: 8, horasExtras: 0, estado: 'Completo' },
  { id: 'h17', trabajadorId: 'u2', trabajador: 'Ana García', fecha: '2025-05-27', entrada: '09:00', inicioComida: '14:00', finComida: '15:00', salida: '20:00', horasNormales: 8, horasExtras: 2, estado: 'Completo' },
  { id: 'h18', trabajadorId: 'u2', trabajador: 'Ana García', fecha: '2025-05-28', entrada: '09:00', inicioComida: '14:00', finComida: '15:00', salida: '18:00', horasNormales: 8, horasExtras: 0, estado: 'Completo' },
  { id: 'h19', trabajadorId: 'u2', trabajador: 'Ana García', fecha: '2025-05-29', entrada: '09:00', inicioComida: '14:00', finComida: '15:00', salida: '18:00', horasNormales: 8, horasExtras: 0, estado: 'Completo' },
  { id: 'h20', trabajadorId: 'u2', trabajador: 'Ana García', fecha: '2025-05-30', entrada: '09:00', inicioComida: '14:00', finComida: '15:00', salida: '19:00', horasNormales: 8, horasExtras: 1, estado: 'Completo' },
];

const diasNoLaboralesMock: DiaNolaboral[] = [
  { id: 'dn1', fecha: '2025-05-01', nombre: 'Día del Trabajo', tipo: 'Nacional' },
  { id: 'dn2', fecha: '2025-05-05', nombre: 'Batalla de Puebla', tipo: 'Nacional' },
  { id: 'dn3', fecha: '2025-09-16', nombre: 'Día de la Independencia', tipo: 'Nacional' },
];

const categoriasMock: Categoria[] = [
  { id: 'cat1', nombre: 'Materiales', tipo: 'Gastos', color: '#2563EB', subcategorias: [] },
  { id: 'cat2', nombre: 'Mano de obra', tipo: 'Gastos', color: '#0EA5E9', subcategorias: [] },
  { id: 'cat3', nombre: 'Equipo', tipo: 'Gastos', color: '#7C3AED', subcategorias: [] },
  { id: 'cat4', nombre: 'Transporte', tipo: 'Gastos', color: '#059669', subcategorias: [] },
  { id: 'cat5', nombre: 'Otros', tipo: 'Gastos', color: '#D97706', subcategorias: [] },
  {
    id: 'cat6', nombre: 'Estructural', tipo: 'Incidencias', color: '#EF4444', subcategorias: [
      { id: 'sub1', nombre: 'Cimentación', categoriaId: 'cat6' },
      { id: 'sub2', nombre: 'Columnas', categoriaId: 'cat6' },
      { id: 'sub3', nombre: 'Trabes', categoriaId: 'cat6' },
      { id: 'sub4', nombre: 'Losas', categoriaId: 'cat6' },
    ]
  },
  { id: 'cat7', nombre: 'Eléctrica', tipo: 'Incidencias', color: '#F59E0B', subcategorias: [] },
  { id: 'cat8', nombre: 'Hidrosanitaria', tipo: 'Incidencias', color: '#3B82F6', subcategorias: [] },
  { id: 'cat9', nombre: 'Seguridad', tipo: 'Incidencias', color: '#DC2626', subcategorias: [] },
  { id: 'cat10', nombre: 'Logística', tipo: 'Incidencias', color: '#8B5CF6', subcategorias: [] },
  {
    id: 'cat11', nombre: 'Estructural', tipo: 'Materiales', color: '#1E40AF', subcategorias: [
      { id: 'sub5', nombre: 'Cimentación', categoriaId: 'cat11' },
      { id: 'sub6', nombre: 'Columnas', categoriaId: 'cat11' },
    ]
  },
  {
    id: 'cat12', nombre: 'Acabados', tipo: 'Materiales', color: '#0EA5E9', subcategorias: [
      { id: 'sub7', nombre: 'Pisos', categoriaId: 'cat12' },
      { id: 'sub8', nombre: 'Muros', categoriaId: 'cat12' },
      { id: 'sub9', nombre: 'Plafones', categoriaId: 'cat12' },
      { id: 'sub10', nombre: 'Pintura', categoriaId: 'cat12' },
    ]
  },
  { id: 'cat13', nombre: 'Eléctrico', tipo: 'Materiales', color: '#F59E0B', subcategorias: [] },
  { id: 'cat14', nombre: 'Hidrosanitario', tipo: 'Materiales', color: '#10B981', subcategorias: [] },
];

const materialesMock: Material[] = [
  { id: 'm1', nombre: 'Cemento CPC-30', categoria: 'Estructural', unidad: 'Bulto (50kg)', stock: 850, stockMinimo: 200, precio: 195, proveedor: 'Materiales XYZ', estado: 'Normal' },
  { id: 'm2', nombre: 'Varilla corrugada 3/8\"', categoria: 'Estructural', unidad: 'Tonelada', stock: 12, stockMinimo: 15, precio: 18500, proveedor: 'Constructora ABC', estado: 'Bajo' },
  { id: 'm3', nombre: 'Arena de río', categoria: 'Estructural', unidad: 'm³', stock: 45, stockMinimo: 20, precio: 380, proveedor: 'Materiales XYZ', estado: 'Normal' },
  { id: 'm4', nombre: 'Grava 3/4\"', categoria: 'Estructural', unidad: 'm³', stock: 8, stockMinimo: 15, precio: 420, proveedor: 'Materiales XYZ', estado: 'Crítico' },
  { id: 'm5', nombre: 'Tabique rojo recocido', categoria: 'Acabados', unidad: 'Millar', stock: 25, stockMinimo: 10, precio: 2800, proveedor: 'Constructora ABC', estado: 'Normal' },
  { id: 'm6', nombre: 'Acero estructural A-36', categoria: 'Estructural', unidad: 'Tonelada', stock: 8, stockMinimo: 5, precio: 22000, proveedor: 'Materiales XYZ', estado: 'Normal' },
  { id: 'm7', nombre: 'Impermeabilizante elastomérico', categoria: 'Acabados', unidad: 'Cubeta (19L)', stock: 45, stockMinimo: 20, precio: 680, proveedor: 'Constructora ABC', estado: 'Normal' },
  { id: 'm8', nombre: 'Madera para cimbra', categoria: 'Estructural', unidad: 'Tabla (2x6x10\')', stock: 3, stockMinimo: 10, precio: 185, proveedor: 'Materiales XYZ', estado: 'Crítico' },
  { id: 'm9', nombre: 'Pintura vinílica blanca', categoria: 'Acabados', unidad: 'Cubeta (19L)', stock: 30, stockMinimo: 10, precio: 520, proveedor: 'Constructora ABC', estado: 'Normal' },
  { id: 'm10', nombre: 'Tubo PVC 4\"', categoria: 'Hidrosanitario', unidad: 'Barra (6m)', stock: 60, stockMinimo: 25, precio: 145, proveedor: 'Materiales XYZ', estado: 'Normal' },
];

const proveedoresMock: Proveedor[] = [
  { id: 'pv1', empresa: 'Constructora ABC', contacto: 'Ing. Marco Torres', email: 'marco@constructoraabc.mx', telefono: '555-1001', especialidad: 'Materiales de construcción', estado: 'Activo', calificacion: 4.5 },
  { id: 'pv2', empresa: 'Materiales XYZ', contacto: 'Lic. Sandra Reyes', email: 'sreyes@materialesxyz.mx', telefono: '555-1002', especialidad: 'Agregados y cementos', estado: 'Activo', calificacion: 4.2 },
  { id: 'pv3', empresa: 'Ingeniería y Diseño S.A.', contacto: 'Arq. Fernando Castro', email: 'fcastro@ingydis.mx', telefono: '555-1003', especialidad: 'Consultoría y diseño estructural', estado: 'Activo', calificacion: 4.8 },
  { id: 'pv4', empresa: 'Grupo Eléctrico del Norte', contacto: 'Lic. Germán Vidal', email: 'gvidal@grupoelectrico.mx', telefono: '555-1004', especialidad: 'Instalaciones eléctricas', estado: 'Activo', calificacion: 4.0 },
  { id: 'pv5', empresa: 'Concretos Guadalajara', contacto: 'Ing. Beatriz Nava', email: 'bnava@concretosgdl.mx', telefono: '555-1005', especialidad: 'Concreto premezclado', estado: 'Inactivo', calificacion: 3.5 },
];

const actividadMock: ActividadReciente[] = [
  { id: 'a1', tipo: 'reporte', descripcion: 'Nuevo reporte de avance subido – Puente Vehicular', proyecto: 'Puente Vehicular', usuario: 'Carlos Martínez', fecha: '2025-05-31T09:15:00', icono: 'FileText' },
  { id: 'a2', tipo: 'incidencia', descripcion: 'Incidencia crítica detectada: Fisura en pilote P-12', proyecto: 'Puente Vehicular', usuario: 'Carlos Martínez', fecha: '2025-05-31T08:45:00', icono: 'AlertTriangle' },
  { id: 'a3', tipo: 'validacion', descripcion: 'Reporte #r2 aprobado por gerencia', proyecto: 'Parque Central', usuario: 'Ana García', fecha: '2025-05-31T08:30:00', icono: 'CheckCircle' },
  { id: 'a4', tipo: 'gasto', descripcion: 'Nuevo gasto registrado: $285,000 – Materiales', proyecto: 'Puente Vehicular', usuario: 'María López', fecha: '2025-05-30T17:20:00', icono: 'DollarSign' },
  { id: 'a5', tipo: 'reporte', descripcion: 'Reporte matutino enviado – Torre Corporativa', proyecto: 'Torre Corporativa', usuario: 'Roberto Sánchez', fecha: '2025-05-30T14:00:00', icono: 'FileText' },
  { id: 'a6', tipo: 'horario', descripcion: 'Carlos Martínez registró salida 18:00', proyecto: 'General', usuario: 'Carlos Martínez', fecha: '2025-05-30T18:01:00', icono: 'Clock' },
  { id: 'a7', tipo: 'gasto', descripcion: 'Nuevo gasto: $145,000 – Mano de obra Torre', proyecto: 'Torre Corporativa', usuario: 'María López', fecha: '2025-05-30T16:00:00', icono: 'DollarSign' },
  { id: 'a8', tipo: 'reporte', descripcion: 'Reporte rechazado – Parque Central (fotos incompletas)', proyecto: 'Parque Central', usuario: 'Ana García', fecha: '2025-05-29T15:30:00', icono: 'XCircle' },
  { id: 'a9', tipo: 'incidencia', descripcion: 'Incidencia #i3 marcada como Resuelta', proyecto: 'Parque Central', usuario: 'Carlos Martínez', fecha: '2025-05-27T16:30:00', icono: 'CheckCircle' },
  { id: 'a10', tipo: 'usuario', descripcion: 'Nuevo usuario agregado: Patricia Flores (Supervisor)', proyecto: 'General', usuario: 'Luis Pérez', fecha: '2025-05-27T10:00:00', icono: 'UserPlus' },
  { id: 'a11', tipo: 'reporte', descripcion: 'Reporte nocturno – Torre Corporativa Nivel 9', proyecto: 'Torre Corporativa', usuario: 'Roberto Sánchez', fecha: '2025-05-28T06:00:00', icono: 'FileText' },
  { id: 'a12', tipo: 'gasto', descripcion: 'Gasto: $48,500 – Adoquín Parque Central', proyecto: 'Parque Central', usuario: 'María López', fecha: '2025-05-29T11:00:00', icono: 'DollarSign' },
  { id: 'a13', tipo: 'incidencia', descripcion: 'Nueva incidencia Alta: Corte de energía Torre', proyecto: 'Torre Corporativa', usuario: 'Patricia Flores', fecha: '2025-05-31T07:45:00', icono: 'AlertTriangle' },
  { id: 'a14', tipo: 'horario', descripcion: 'Roberto Sánchez registró 3 horas extra', proyecto: 'Torre Corporativa', usuario: 'Roberto Sánchez', fecha: '2025-05-27T21:00:00', icono: 'Clock' },
  { id: 'a15', tipo: 'validacion', descripcion: 'Reporte de Pavimentación aprobado', proyecto: 'Calle 5 de Mayo', usuario: 'Luis Pérez', fecha: '2025-05-28T12:00:00', icono: 'CheckCircle' },
];

const auditoriasMock: Auditoria[] = [
  { id: 'aud1', usuarioId: 'auth_1', usuarioNombre: 'Luis Pérez', usuarioEmail: 'admin@arquitectura.com', accion: 'login', recurso: 'Sistema', detalle: 'Inicio de sesión exitoso como Super Admin', fecha: '2025-05-31T09:00:00', ip: '192.168.1.10' },
  { id: 'aud2', usuarioId: 'auth_2', usuarioNombre: 'Ana García', usuarioEmail: 'gerente@arquitectura.com', empresaId: 'e1', empresaNombre: 'Constructora ABC', accion: 'login', recurso: 'Sistema', detalle: 'Inicio de sesión exitoso como Gerente', fecha: '2025-05-31T08:30:00', ip: '192.168.1.11' },
  { id: 'aud3', usuarioId: 'auth_2', usuarioNombre: 'Ana García', usuarioEmail: 'gerente@arquitectura.com', empresaId: 'e1', empresaNombre: 'Constructora ABC', accion: 'view', recurso: 'Reporte r2', detalle: 'Visualizó reporte de Parque Central', fecha: '2025-05-31T08:32:00', ip: '192.168.1.11' },
  { id: 'aud4', usuarioId: 'auth_2', usuarioNombre: 'Ana García', usuarioEmail: 'gerente@arquitectura.com', empresaId: 'e1', empresaNombre: 'Constructora ABC', accion: 'update', recurso: 'Reporte r2', detalle: 'Aprobó reporte de avance Parque Central', fecha: '2025-05-31T08:33:00', ip: '192.168.1.11' },
  { id: 'aud5', usuarioId: 'auth_3', usuarioNombre: 'Carlos Martínez', usuarioEmail: 'arquitecto@arquitectura.com', empresaId: 'e1', empresaNombre: 'Constructora ABC', accion: 'create', recurso: 'Reporte r1', detalle: 'Creó reporte diario Puente Vehicular', fecha: '2025-05-31T09:15:00', ip: '192.168.1.15' },
  { id: 'aud6', usuarioId: 'auth_4', usuarioNombre: 'María López', usuarioEmail: 'capturista@arquitectura.com', empresaId: 'e2', empresaNombre: 'Materiales XYZ', accion: 'create', recurso: 'Gasto g1', detalle: 'Registró gasto de $285,000 – Materiales (Puente Vehicular)', fecha: '2025-05-30T17:20:00', ip: '192.168.1.20' },
  { id: 'aud7', usuarioId: 'auth_1', usuarioNombre: 'Luis Pérez', usuarioEmail: 'admin@arquitectura.com', accion: 'create', recurso: 'Usuario u12', detalle: 'Creó usuario Sandra Reyes (Gerente) en Materiales XYZ', fecha: '2025-05-30T10:00:00', ip: '192.168.1.10' },
  { id: 'aud8', usuarioId: 'auth_1', usuarioNombre: 'Luis Pérez', usuarioEmail: 'admin@arquitectura.com', accion: 'update', recurso: 'Empresa e2', detalle: 'Actualizó licencia de Materiales XYZ a Básico', fecha: '2025-05-30T10:05:00', ip: '192.168.1.10' },
  { id: 'aud9', usuarioId: 'auth_5', usuarioNombre: 'Roberto Sánchez', usuarioEmail: 'supervisor@arquitectura.com', empresaId: 'e1', empresaNombre: 'Constructora ABC', accion: 'create', recurso: 'Incidencia i2', detalle: 'Reportó incidencia Alta: Corte de energía Torre', fecha: '2025-05-31T07:45:00', ip: '192.168.1.25' },
  { id: 'aud10', usuarioId: 'auth_2', usuarioNombre: 'Ana García', usuarioEmail: 'gerente@arquitectura.com', empresaId: 'e1', empresaNombre: 'Constructora ABC', accion: 'update', recurso: 'Incidencia i3', detalle: 'Marcó incidencia i3 como Resuelta', fecha: '2025-05-27T16:30:00', ip: '192.168.1.11' },
  { id: 'aud11', usuarioId: 'auth_1', usuarioNombre: 'Luis Pérez', usuarioEmail: 'admin@arquitectura.com', accion: 'create', recurso: 'Empresa e3', detalle: 'Creó empresa Ingeniería y Diseño S.A.', fecha: '2025-05-25T09:00:00', ip: '192.168.1.10' },
  { id: 'aud12', usuarioId: 'auth_3', usuarioNombre: 'Carlos Martínez', usuarioEmail: 'arquitecto@arquitectura.com', empresaId: 'e1', empresaNombre: 'Constructora ABC', accion: 'view', recurso: 'Proyecto p4', detalle: 'Visualizó detalle de Torre Corporativa Norte', fecha: '2025-05-31T09:20:00', ip: '192.168.1.15' },
  { id: 'aud13', usuarioId: 'auth_4', usuarioNombre: 'María López', usuarioEmail: 'capturista@arquitectura.com', empresaId: 'e2', empresaNombre: 'Materiales XYZ', accion: 'create', recurso: 'Gasto g11', detalle: 'Registró gasto $320,000 – Centro Comercial Las Palmas', fecha: '2025-05-31T10:30:00', ip: '192.168.1.20' },
  { id: 'aud14', usuarioId: 'auth_1', usuarioNombre: 'Luis Pérez', usuarioEmail: 'admin@arquitectura.com', accion: 'delete', recurso: 'Usuario obsoleto', detalle: 'Eliminó usuario inactivo de empresa e2', fecha: '2025-05-29T14:00:00', ip: '192.168.1.10' },
  { id: 'aud15', usuarioId: 'auth_2', usuarioNombre: 'Ana García', usuarioEmail: 'gerente@arquitectura.com', empresaId: 'e1', empresaNombre: 'Constructora ABC', accion: 'export', recurso: 'Reportes', detalle: 'Exportó reporte de gastos del mes a CSV', fecha: '2025-05-31T11:00:00', ip: '192.168.1.11' },
  { id: 'aud16', usuarioId: 'auth_5', usuarioNombre: 'Roberto Sánchez', usuarioEmail: 'supervisor@arquitectura.com', empresaId: 'e1', empresaNombre: 'Constructora ABC', accion: 'logout', recurso: 'Sistema', detalle: 'Cierre de sesión', fecha: '2025-05-30T19:00:00', ip: '192.168.1.25' },
  { id: 'aud17', usuarioId: 'auth_1', usuarioNombre: 'Luis Pérez', usuarioEmail: 'admin@arquitectura.com', accion: 'update', recurso: 'Proyecto p6', detalle: 'Asignó arquitecto Claudia Vega al proyecto Centro Comercial', fecha: '2025-05-28T08:00:00', ip: '192.168.1.10' },
  { id: 'aud18', usuarioId: 'auth_4', usuarioNombre: 'María López', usuarioEmail: 'capturista@arquitectura.com', empresaId: 'e2', empresaNombre: 'Materiales XYZ', accion: 'login', recurso: 'Sistema', detalle: 'Inicio de sesión exitoso como Capturista', fecha: '2025-05-31T10:00:00', ip: '192.168.1.20' },
  { id: 'aud19', usuarioId: 'auth_3', usuarioNombre: 'Carlos Martínez', usuarioEmail: 'arquitecto@arquitectura.com', empresaId: 'e1', empresaNombre: 'Constructora ABC', accion: 'update', recurso: 'Proyecto p1', detalle: 'Actualizó avance físico de Puente Vehicular a 45%', fecha: '2025-05-31T09:30:00', ip: '192.168.1.15' },
  { id: 'aud20', usuarioId: 'auth_1', usuarioNombre: 'Luis Pérez', usuarioEmail: 'admin@arquitectura.com', accion: 'view', recurso: 'Dashboard Global', detalle: 'Accedió al panel de control global', fecha: '2025-05-31T09:05:00', ip: '192.168.1.10' },
];

const cotizacionesMock: Cotizacion[] = [
  {
    id: 'cot1', numero: 'COT-2025-001', clienteNombre: 'Gobierno Municipal de Zapopan', clienteEmail: 'obras@zapopan.gob.mx', clienteTelefono: '33-4500-0001',
    proyectoId: 'p2', proyectoNombre: 'Remodelación del Parque Central',
    items: [
      { id: 'ci1', descripcion: 'Diseño arquitectónico', cantidad: 1, unidad: 'Servicio', precioUnitario: 250000, subtotal: 250000 },
      { id: 'ci2', descripcion: 'Supervisión de obra', cantidad: 6, unidad: 'Mes', precioUnitario: 45000, subtotal: 270000 },
      { id: 'ci3', descripcion: 'Materiales de construcción', cantidad: 1, unidad: 'Lote', precioUnitario: 820000, subtotal: 820000 },
    ],
    subtotal: 1340000, iva: 214400, total: 1554400,
    estado: 'Aceptada', fechaCreacion: '2025-04-01', fechaVencimiento: '2025-04-30', empresaId: 'e1',
  },
  {
    id: 'cot2', numero: 'COT-2025-002', clienteNombre: 'Corporativo Industrias del Norte S.A.', clienteEmail: 'compras@industriasnorte.mx', clienteTelefono: '81-3000-5000',
    proyectoId: 'p6', proyectoNombre: 'Centro Comercial Las Palmas',
    items: [
      { id: 'ci4', descripcion: 'Diseño estructural y arquitectónico', cantidad: 1, unidad: 'Servicio', precioUnitario: 1200000, subtotal: 1200000 },
      { id: 'ci5', descripcion: 'Cimentación y estructura', cantidad: 1, unidad: 'Lote', precioUnitario: 8500000, subtotal: 8500000 },
    ],
    subtotal: 9700000, iva: 1552000, total: 11252000,
    estado: 'Enviada', fechaCreacion: '2025-05-10', fechaVencimiento: '2025-06-10', empresaId: 'e3',
  },
  {
    id: 'cot3', numero: 'COT-2025-003', clienteNombre: 'Logística Express del Bajío', clienteEmail: 'gerencia@logisticaexpress.mx', clienteTelefono: '47-5500-7000',
    proyectoId: 'p7', proyectoNombre: 'Bodega Industrial Zona Sur',
    items: [
      { id: 'ci6', descripcion: 'Construcción de bodega 2400m²', cantidad: 2400, unidad: 'm²', precioUnitario: 3200, subtotal: 7680000 },
    ],
    subtotal: 7680000, iva: 1228800, total: 8908800,
    estado: 'Convertida', fechaCreacion: '2025-03-15', fechaVencimiento: '2025-04-15', empresaId: 'e2',
  },
  {
    id: 'cot4', numero: 'COT-2025-004', clienteNombre: 'Desarrollos Inmobiliarios JJMR', clienteEmail: 'contacto@jjmr.mx', clienteTelefono: '55-8800-9000',
    items: [
      { id: 'ci7', descripcion: 'Consultoría y gestión de proyecto', cantidad: 12, unidad: 'Mes', precioUnitario: 85000, subtotal: 1020000 },
    ],
    subtotal: 1020000, iva: 163200, total: 1183200,
    estado: 'Borrador', fechaCreacion: '2025-05-28', fechaVencimiento: '2025-06-28', empresaId: 'e3',
  },
  {
    id: 'cot5', numero: 'COT-2025-005', clienteNombre: 'Municipio de Irapuato', clienteEmail: 'dop@irapuato.gob.mx', clienteTelefono: '47-6600-8000',
    items: [
      { id: 'ci8', descripcion: 'Pavimentación urbana por km lineal', cantidad: 3.2, unidad: 'Km', precioUnitario: 2200000, subtotal: 7040000 },
    ],
    subtotal: 7040000, iva: 1126400, total: 8166400,
    estado: 'Rechazada', fechaCreacion: '2025-04-20', fechaVencimiento: '2025-05-20', empresaId: 'e2',
  },
];

const pedidosMock: PedidoVenta[] = [
  {
    id: 'ped1', numero: 'PED-2025-001', cotizacionId: 'cot3', clienteNombre: 'Logística Express del Bajío',
    clienteEmail: 'gerencia@logisticaexpress.mx', proyectoNombre: 'Bodega Industrial Zona Sur',
    items: [{ id: 'pi1', descripcion: 'Construcción de bodega 2400m²', cantidad: 2400, unidad: 'm²', precioUnitario: 3200, subtotal: 7680000 }],
    subtotal: 7680000, iva: 1228800, total: 8908800,
    estado: 'En Proceso', fechaCreacion: '2025-04-20', fechaEntrega: '2025-09-30', empresaId: 'e2',
  },
  {
    id: 'ped2', numero: 'PED-2025-002', clienteNombre: 'Gobierno Municipal de Zapopan',
    clienteEmail: 'obras@zapopan.gob.mx', proyectoNombre: 'Remodelación del Parque Central',
    items: [
      { id: 'pi2', descripcion: 'Diseño y supervisión', cantidad: 1, unidad: 'Servicio', precioUnitario: 520000, subtotal: 520000 },
      { id: 'pi3', descripcion: 'Materiales', cantidad: 1, unidad: 'Lote', precioUnitario: 820000, subtotal: 820000 },
    ],
    subtotal: 1340000, iva: 214400, total: 1554400,
    estado: 'Entregado', fechaCreacion: '2025-05-01', fechaEntrega: '2025-05-31', empresaId: 'e1',
  },
  {
    id: 'ped3', numero: 'PED-2025-003', clienteNombre: 'Empresa Privada Construcciones SA',
    clienteEmail: 'compras@constprivada.mx', proyectoNombre: 'Residencia Los Pinos',
    items: [{ id: 'pi4', descripcion: 'Suministro de materiales estructurales', cantidad: 1, unidad: 'Lote', precioUnitario: 450000, subtotal: 450000 }],
    subtotal: 450000, iva: 72000, total: 522000,
    estado: 'Confirmado', fechaCreacion: '2025-05-25', fechaEntrega: '2025-06-30', empresaId: 'e2',
  },
];

const ventasMock: Venta[] = [
  { id: 'v1', numero: 'VNT-2025-001', pedidoId: 'ped2', clienteNombre: 'Gobierno Municipal de Zapopan', proyectoNombre: 'Remodelación del Parque Central', total: 1554400, iva: 214400, subtotal: 1340000, metodoPago: 'Transferencia', estado: 'Pagada', fechaVenta: '2025-05-31', empresaId: 'e1' },
  { id: 'v2', numero: 'VNT-2025-002', pedidoId: 'ped1', clienteNombre: 'Logística Express del Bajío', proyectoNombre: 'Bodega Industrial Zona Sur', total: 4454400, iva: 614400, subtotal: 3840000, metodoPago: 'Transferencia', estado: 'Pagada', fechaVenta: '2025-05-15', empresaId: 'e2' },
  { id: 'v3', numero: 'VNT-2025-003', clienteNombre: 'Construcciones del Bajío SA', proyectoNombre: 'Proyecto Residencial', total: 890000, iva: 120000, subtotal: 770000, metodoPago: 'Cheque', estado: 'Pendiente', fechaVenta: '2025-05-20', empresaId: 'e1' },
  { id: 'v4', numero: 'VNT-2025-004', clienteNombre: 'Ayuntamiento Irapuato', proyectoNombre: 'Obra Municipal', total: 2345000, iva: 305000, subtotal: 2040000, metodoPago: 'Transferencia', estado: 'Vencida', fechaVenta: '2025-04-30', empresaId: 'e2' },
  { id: 'v5', numero: 'VNT-2025-005', clienteNombre: 'Fideicomisos Norteños', proyectoNombre: 'Parque Industrial Fase 1', total: 5600000, iva: 729411, subtotal: 4870589, metodoPago: 'Transferencia', estado: 'Pagada', fechaVenta: '2025-05-10', empresaId: 'e3' },
];

// ─────────────────────────────────────────────
// STORE INTERFACE
// ─────────────────────────────────────────────

interface AppState {
  // Data
  empresas: Empresa[];
  licencias: Licencia[];
  auditorias: Auditoria[];
  proyectos: Proyecto[];
  usuarios: Usuario[];
  incidencias: Incidencia[];
  reportes: ReporteDiario[];
  horarios: RegistroHorario[];
  diasNoLaborales: DiaNolaboral[];
  categorias: Categoria[];
  materiales: Material[];
  proveedores: Proveedor[];
  actividad: ActividadReciente[];
  notificaciones: NotificacionApi[];
  notificacionesLoading: boolean;
  cotizaciones: Cotizacion[];
  pedidos: PedidoVenta[];
  ventas: Venta[];

  // UI State
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  darkMode: boolean;

  // Actions
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (v: boolean) => void;
  toggleMobileSidebar: () => void;
  toggleDarkMode: () => void;

  // CRUD Empresas
  addEmpresa: (e: Omit<Empresa, 'id'>) => void;
  updateEmpresa: (id: string, e: Partial<Empresa>) => void;
  deleteEmpresa: (id: string) => void;

  // CRUD Usuarios
  addUsuario: (u: Omit<Usuario, 'id'>) => void;
  updateUsuario: (id: string, u: Partial<Usuario>) => void;
  deleteUsuario: (id: string) => void;

  // CRUD Proyectos
  addProyecto: (p: Omit<Proyecto, 'id'>) => void;
  updateProyecto: (id: string, p: Partial<Proyecto>) => void;
  deleteProyecto: (id: string) => void;

  // CRUD Materiales
  addMaterial: (m: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, m: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;

  // CRUD Proveedores
  addProveedor: (p: Omit<Proveedor, 'id'>) => void;
  updateProveedor: (id: string, p: Partial<Proveedor>) => void;
  deleteProveedor: (id: string) => void;

  // CRUD Dias no laborales
  addDiaNolaboral: (d: Omit<DiaNolaboral, 'id'>) => void;
  updateDiaNolaboral: (id: string, d: Partial<DiaNolaboral>) => void;
  deleteDiaNolaboral: (id: string) => void;
  setDiasNoLaborales: (dias: DiaNolaboral[]) => void;

  // CRUD Categorias
  addCategoria: (c: Omit<Categoria, 'id'>) => void;
  updateCategoria: (id: string, c: Partial<Categoria>) => void;
  deleteCategoria: (id: string) => void;
  addSubcategoria: (categoriaId: string, nombre: string) => void;
  deleteSubcategoria: (categoriaId: string, subcategoriaId: string) => void;

  // CRUD Cotizaciones
  addCotizacion: (c: Omit<Cotizacion, 'id' | 'numero'>) => void;
  updateCotizacion: (id: string, c: Partial<Cotizacion>) => void;
  deleteCotizacion: (id: string) => void;
  convertirAPedido: (cotizacionId: string) => void;

  // CRUD Pedidos
  updatePedido: (id: string, p: Partial<PedidoVenta>) => void;

  // Reportes Actions
  aprobarReporte: (id: string) => void;
  rechazarReporte: (id: string, observaciones: string) => void;

  // Incidencias Actions
  updateIncidencia: (id: string, data: Partial<Incidencia>) => void;
  cambiarEstadoIncidencia: (id: string, estado: IncidenciaEstado, usuario: string) => void;

  // Horarios
  addRegistroHorario: (h: Omit<RegistroHorario, 'id'>) => void;
  updateRegistroHorario: (id: string, h: Partial<RegistroHorario>) => void;

  // Notificaciones
  fetchNotificaciones: () => Promise<void>;
  marcarNotificacionLeida: (id: number) => Promise<void>;
  marcarTodasNotificacionesLeidas: () => Promise<void>;

  // Auditoria
  addAuditoria: (a: Omit<Auditoria, 'id'>) => void;
}

let counter = 1000;
const uid = () => `gen_${++counter}`;
let cotNum = 6;

export const useStore = create<AppState>((set) => ({
  empresas: empresasMock,
  licencias: licenciasMock,
  auditorias: auditoriasMock,
  proyectos: proyectosMock,
  usuarios: usuariosMock,
  incidencias: incidenciasMock,
  reportes: reportesMock,
  horarios: horariosMock,
  diasNoLaborales: diasNoLaboralesMock,
  categorias: categoriasMock,
  materiales: materialesMock,
  proveedores: proveedoresMock,
  actividad: actividadMock,
  notificaciones: [],
  notificacionesLoading: false,
  cotizaciones: cotizacionesMock,
  pedidos: pedidosMock,
  ventas: ventasMock,

  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  darkMode: false,

  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setMobileSidebarOpen: (v) => set({ mobileSidebarOpen: v }),
  toggleMobileSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
  toggleDarkMode: () => set((s) => {
    const next = !s.darkMode;
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('darkMode', String(next));
    }
    return { darkMode: next };
  }),

  addEmpresa: (e) => set((s) => ({ empresas: [...s.empresas, { ...e, id: uid() }] })),
  updateEmpresa: (id, e) => set((s) => ({ empresas: s.empresas.map(x => x.id === id ? { ...x, ...e } : x) })),
  deleteEmpresa: (id) => set((s) => ({ empresas: s.empresas.filter(x => x.id !== id) })),

  addUsuario: (u) => set((s) => ({ usuarios: [...s.usuarios, { ...u, id: uid() }] })),
  updateUsuario: (id, u) => set((s) => ({ usuarios: s.usuarios.map(x => x.id === id ? { ...x, ...u } : x) })),
  deleteUsuario: (id) => set((s) => ({ usuarios: s.usuarios.filter(x => x.id !== id) })),

  addProyecto: (p) => set((s) => ({ proyectos: [...s.proyectos, { ...p, id: uid() }] })),
  updateProyecto: (id, p) => set((s) => ({ proyectos: s.proyectos.map(x => x.id === id ? { ...x, ...p } : x) })),
  deleteProyecto: (id) => set((s) => ({ proyectos: s.proyectos.filter(x => x.id !== id) })),

  addMaterial: (m) => set((s) => ({ materiales: [...s.materiales, { ...m, id: uid() }] })),
  updateMaterial: (id, m) => set((s) => ({ materiales: s.materiales.map(x => x.id === id ? { ...x, ...m } : x) })),
  deleteMaterial: (id) => set((s) => ({ materiales: s.materiales.filter(x => x.id !== id) })),

  addProveedor: (p) => set((s) => ({ proveedores: [...s.proveedores, { ...p, id: uid() }] })),
  updateProveedor: (id, p) => set((s) => ({ proveedores: s.proveedores.map(x => x.id === id ? { ...x, ...p } : x) })),
  deleteProveedor: (id) => set((s) => ({ proveedores: s.proveedores.filter(x => x.id !== id) })),

  addDiaNolaboral: (d) => set((s) => ({ diasNoLaborales: [...s.diasNoLaborales, { ...d, id: uid() }] })),
  updateDiaNolaboral: (id, d) => set((s) => ({ diasNoLaborales: s.diasNoLaborales.map(x => x.id === id ? { ...x, ...d } : x) })),
  deleteDiaNolaboral: (id) => set((s) => ({ diasNoLaborales: s.diasNoLaborales.filter(x => x.id !== id) })),
  setDiasNoLaborales: (dias) => set({ diasNoLaborales: dias }),

  addCategoria: (c) => set((s) => ({ categorias: [...s.categorias, { ...c, id: uid() }] })),
  updateCategoria: (id, c) => set((s) => ({ categorias: s.categorias.map(x => x.id === id ? { ...x, ...c } : x) })),
  deleteCategoria: (id) => set((s) => ({ categorias: s.categorias.filter(x => x.id !== id) })),
  addSubcategoria: (categoriaId, nombre) => set((s) => ({
    categorias: s.categorias.map(c => c.id === categoriaId
      ? { ...c, subcategorias: [...c.subcategorias, { id: uid(), nombre, categoriaId }] }
      : c)
  })),
  deleteSubcategoria: (categoriaId, subcategoriaId) => set((s) => ({
    categorias: s.categorias.map(c => c.id === categoriaId
      ? { ...c, subcategorias: c.subcategorias.filter(sub => sub.id !== subcategoriaId) }
      : c)
  })),

  addCotizacion: (c) => set((s) => ({
    cotizaciones: [{ ...c, id: uid(), numero: `COT-2025-00${++cotNum}` }, ...s.cotizaciones]
  })),
  updateCotizacion: (id, c) => set((s) => ({ cotizaciones: s.cotizaciones.map(x => x.id === id ? { ...x, ...c } : x) })),
  deleteCotizacion: (id) => set((s) => ({ cotizaciones: s.cotizaciones.filter(x => x.id !== id) })),
  convertirAPedido: (cotizacionId) => set((s) => {
    const cot = s.cotizaciones.find(c => c.id === cotizacionId);
    if (!cot) return s;
    const pedidoNum = `PED-2025-00${s.pedidos.length + 4}`;
    const nuevoPedido: PedidoVenta = {
      id: uid(), numero: pedidoNum, cotizacionId,
      clienteNombre: cot.clienteNombre, clienteEmail: cot.clienteEmail,
      proyectoNombre: cot.proyectoNombre,
      items: cot.items,
      subtotal: cot.subtotal, iva: cot.iva, total: cot.total,
      estado: 'Pendiente',
      fechaCreacion: new Date().toISOString().split('T')[0],
      fechaEntrega: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      empresaId: cot.empresaId,
    };
    return {
      cotizaciones: s.cotizaciones.map(c => c.id === cotizacionId ? { ...c, estado: 'Convertida' as const } : c),
      pedidos: [nuevoPedido, ...s.pedidos],
    };
  }),

  updatePedido: (id, p) => set((s) => ({ pedidos: s.pedidos.map(x => x.id === id ? { ...x, ...p } : x) })),

  aprobarReporte: (id) => set((s) => ({ reportes: s.reportes.map(r => r.id === id ? { ...r, estado: 'Aprobado' as const } : r) })),
  rechazarReporte: (id, observaciones) => set((s) => ({ reportes: s.reportes.map(r => r.id === id ? { ...r, estado: 'Rechazado' as const, observaciones } : r) })),

  updateIncidencia: (id, data) => set((s) => ({ incidencias: s.incidencias.map(i => i.id === id ? { ...i, ...data } : i) })),
  cambiarEstadoIncidencia: (id, estado, usuario) => set((s) => ({
    incidencias: s.incidencias.map(i => i.id === id ? {
      ...i, estado,
      fechaActualizacion: new Date().toISOString(),
      timeline: [...i.timeline, {
        fecha: new Date().toISOString(),
        accion: `Estado cambiado a ${estado}`,
        usuario, estado,
      }]
    } : i)
  })),

  addRegistroHorario: (h) => set((s) => ({ horarios: [...s.horarios, { ...h, id: uid() }] })),
  updateRegistroHorario: (id, h) => set((s) => ({ horarios: s.horarios.map(x => x.id === id ? { ...x, ...h } : x) })),

  fetchNotificaciones: async () => {
    set({ notificacionesLoading: true });
    try {
      const data = await notificacionesService.listar();
      set({ notificaciones: data });
    } catch {
      // Silencioso: no bloquear la UI si el endpoint aún no existe o falla.
    } finally {
      set({ notificacionesLoading: false });
    }
  },

  marcarNotificacionLeida: async (id) => {
    set((s) => ({ notificaciones: s.notificaciones.map(n => n.id === id ? { ...n, leida: true } : n) }));
    try {
      await notificacionesService.marcarLeida(id);
    } catch {
      // El estado optimista se queda como leída aunque falle la llamada;
      // se corregirá en el siguiente fetchNotificaciones().
    }
  },

  marcarTodasNotificacionesLeidas: async () => {
    set((s) => ({ notificaciones: s.notificaciones.map(n => ({ ...n, leida: true })) }));
    try {
      await notificacionesService.marcarTodasLeidas();
    } catch {
      // Idem: estado optimista, se resincroniza en el próximo fetch.
    }
  },

  addAuditoria: (a) => set((s) => ({ auditorias: [{ ...a, id: uid() }, ...s.auditorias] })),
}));
