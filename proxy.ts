import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas (sin autenticación)
const PUBLIC_PATHS = ['/login', '/no-autorizado'];

/**
 * Mapa de rutas protegidas por rol.
 * Un rol tiene acceso a una ruta si al menos uno de sus prefijos coincide.
 * El rol 'administrador' tiene acceso a todo excepto super-admin.
 */
const ROLE_ACCESS: Record<string, string[]> = {
  administrador: [
    '/admin',
    '/dashboard',
    '/proyectos',
    '/incidencias',
    '/reportes-diarios',
    '/validar-reportes',
    '/galeria-evidencias',
    '/seguimiento-obra',
    '/usuarios',
    '/horarios',
    '/reporte-horas',
    '/control-horario',
    '/gastos-obra',
    '/dias-no-laborales',
    '/actividad-reciente',
    '/catalogos',
    '/comercial',
    '/configuracion',
    '/dashboard-ejecutivo',
    '/incidencias-criticas',
    '/asistencia',
  ],
  gerente: [
    '/dashboard',
    '/proyectos',
    '/incidencias',
    '/incidencias-criticas',
    '/reportes-diarios',
    '/validar-reportes',
    '/galeria-evidencias',
    '/seguimiento-obra',
    '/horarios',
    '/reporte-horas',
    '/control-horario',
    '/gastos-obra',
    '/dias-no-laborales',
    '/actividad-reciente',
    '/catalogos',
    '/comercial',
    '/dashboard-ejecutivo',
    '/asistencia',
  ],
  supervisor: ['/asistencia'],
  ingeniero: ['/asistencia'],
};

/**
 * Extrae el rol del usuario desde el nombre del token almacenado en cookie.
 * El token es opaco para el middleware (es un token Sanctum del servidor),
 * por lo que dependemos de una cookie auxiliar `auth_role` para el rol.
 */
function getRolFromCookies(request: NextRequest): string | null {
  return request.cookies.get('auth_role')?.value || null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas sin verificación
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Obtener token de autenticación
  const token = request.cookies.get('auth_token')?.value;

  // Sin token → redirigir al login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Obtener rol del usuario desde cookie auxiliar
  const rol = getRolFromCookies(request);

  // Si hay token pero no hay rol (sesión inconsistente), limpiar y redirigir
  if (!rol) {
    // Permitir paso — el componente cliente manejará esto via initAuth()
    return NextResponse.next();
  }

  // Verificar que el rol tenga acceso a la ruta solicitada
  const allowedPaths = ROLE_ACCESS[rol] || [];
  const hasAccess = allowedPaths.some(p => pathname.startsWith(p));

  if (!hasAccess) {
    return NextResponse.redirect(new URL('/no-autorizado', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};