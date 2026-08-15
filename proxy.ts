import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Rutas públicas (no requieren autenticación) ──────────────────────────────
const PUBLIC_PATHS = ['/login', '/no-autorizado'];

/**
 * Mapa de rutas protegidas por rol.
 * Un rol tiene acceso a una ruta si al menos uno de sus prefijos coincide.
 *
 * REGLA DE ORO: /asistencia es accesible para los 4 roles.
 * Administrador ve todo. Gerente ve todo menos gestión de usuarios.
 * Ingeniero y Supervisor solo ven sus proyectos asignados y funciones de campo.
 */
const ROLE_ACCESS: Record<string, string[]> = {
  administrador: [
    '/admin',
    '/dashboard',
    '/proyectos',
    '/incidencias',
    '/reportes-diarios',
    '/galeria-evidencias',
    '/usuarios',           // Solo administrador
    '/horarios',
    '/reporte-horas',
    '/control-horario',
    '/gastos-obra',
    '/dias-no-laborales',
    '/catalogos',          // materiales, proveedores, clientes
    '/comercial',          // cotizaciones, inventario, ventas, pedidos
    '/configuracion',
    '/dashboard-ejecutivo',
    '/asistencia',         // Universal - todos los roles
    '/perfil',              // Universal - todos los roles
    '/notificaciones',      // Universal - todos los roles
  ],
  gerente: [
    '/dashboard',
    '/proyectos',
    '/incidencias',
    '/reportes-diarios',
    '/galeria-evidencias',
    '/horarios',
    '/reporte-horas',
    '/control-horario',
    '/gastos-obra',
    '/dias-no-laborales',
    '/catalogos',          // materiales, proveedores, clientes
    '/comercial',          // cotizaciones, inventario, ventas, pedidos
    '/dashboard-ejecutivo',
    '/asistencia',         // Universal - todos los roles
    '/perfil',              // Universal - todos los roles
    '/notificaciones',      // Universal - todos los roles
  ],
  ingeniero: [
    '/proyectos',          // Solo proyectos asignados (filtrado en frontend)
    '/incidencias',        // Solo incidencias asignadas (filtrado en frontend)
    '/galeria-evidencias',
    '/reporte-horas',      // Solo sus propias horas (filtrado en frontend)
    '/asistencia',         // Universal - todos los roles
    '/perfil',              // Universal - todos los roles
    '/notificaciones',      // Universal - todos los roles
  ],
  supervisor: [
    '/proyectos',          // Solo proyectos asignados (filtrado en frontend)
    '/reportes-diarios',   // Puede crear reportes de avance
    '/incidencias',        // Puede reportar y ver de sus proyectos (filtrado en frontend)
    '/galeria-evidencias',
    '/reporte-horas',      // Solo sus propias horas (filtrado en frontend)
    '/asistencia',         // Universal - todos los roles
    '/perfil',              // Universal - todos los roles
    '/notificaciones',      // Universal - todos los roles
  ],
  superadmin: [
    '/dashboard-superadmin', // Dashboard con KPIs globales
    '/superadmin',            // Gestión de empresas y usuarios globales
    '/perfil',                // Universal - todos los roles
    '/notificaciones',        // Universal - todos los roles
  ],
};

/**
 * Extrae el rol del usuario desde la cookie auxiliar `auth_role`.
 * El token Sanctum es opaco para el middleware, por eso usamos
 * una cookie no sensible con el nombre del rol.
 */
function getRolFromCookies(request: NextRequest): string | null {
  return request.cookies.get('auth_role')?.value || null;
}

/**
 * Middleware de protección de rutas.
 * 1. Permite rutas públicas sin verificación.
 * 2. Sin token → redirige al login.
 * 3. Sin rol (sesión inconsistente) → deja pasar, el cliente lo manejará.
 * 4. Con rol pero sin acceso a la ruta → redirige a /no-autorizado.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas sin verificación
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Obtener token de autenticación desde cookie
  const token = request.cookies.get('auth_token')?.value;

  // Sin token → redirigir al login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Obtener rol del usuario desde cookie auxiliar
  const rol = getRolFromCookies(request);

  // Si hay token pero no hay rol (sesión inconsistente),
  // dejar pasar — el componente cliente manejará esto via initAuth()
  if (!rol) {
    return NextResponse.next();
  }

  // Verificar que el rol tenga acceso a la ruta solicitada
  const allowedPaths = ROLE_ACCESS[rol] || [];
  const hasAccess = allowedPaths.some(p => pathname.startsWith(p));

  // Ruta no permitida para el rol → redirigir a /no-autorizado
  if (!hasAccess) {
    return NextResponse.redirect(new URL('/no-autorizado', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};