'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, HardHat, Package, Truck,
  DollarSign, Clock, FileBarChart, TrendingUp, AlertOctagon,
  Activity, FolderOpen, FileText, CheckSquare, Image,
  AlertTriangle, Calendar, Settings, ChevronLeft, ChevronRight,
  Building2, ClipboardList, ShieldAlert, FileCheck,
  ShoppingCart, BarChart3, Boxes, LogOut, ShieldCheck,
  UserCircle, Timer, Briefcase, CalendarCheck, Hammer, X,
  Globe, Bell, UserPlus,
} from 'lucide-react';
import type { AuthRole } from '@/types';
import { SigoLogoBadge } from '@/components/ui/SigoLogo';

// ─── Tipos de navegación ──────────────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

// ─── Nav para ADMINISTRADOR (ve todo) ────────────────────────────────────────
const administradorNav: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Dashboard Ejecutivo', href: '/dashboard-ejecutivo', icon: TrendingUp },
      { label: 'Proyectos', href: '/proyectos', icon: FolderOpen },
      { label: 'Incidencias', href: '/incidencias', icon: AlertTriangle },
      { label: 'Reportes Diarios', href: '/reportes-diarios', icon: FileText },
      { label: 'Galería Evidencias', href: '/galeria-evidencias', icon: Image },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { label: 'Usuarios', href: '/usuarios', icon: Users },
    ],
  },
  {
    title: 'Finanzas y RH',
    items: [
      { label: 'Horarios', href: '/horarios', icon: Clock },
      { label: 'Reporte de Horas', href: '/reporte-horas', icon: FileBarChart },
      { label: 'Control Horario', href: '/control-horario', icon: ClipboardList },
      { label: 'Días No Laborales', href: '/dias-no-laborales', icon: Calendar },
      { label: 'Gastos de Obra', href: '/gastos-obra', icon: DollarSign },
    ],
  },
  {
    title: 'Comercial',
    items: [
      { label: 'Cotizaciones', href: '/comercial/cotizaciones', icon: FileText },
      { label: 'Pedidos', href: '/comercial/pedidos', icon: ShoppingCart },
      { label: 'Ventas', href: '/comercial/ventas', icon: BarChart3 },
      { label: 'Inventario', href: '/comercial/inventario', icon: Boxes },
    ],
  },
  {
    title: 'Catálogos',
    items: [
      { label: 'Materiales', href: '/catalogos/materiales', icon: Package },
      { label: 'Proveedores', href: '/catalogos/proveedores', icon: Truck },
      { label: 'Clientes', href: '/catalogos/clientes', icon: Briefcase },
    ],
  },
  {
    title: 'Configuración',
    items: [
      { label: 'Categorías', href: '/configuracion/categorias', icon: Settings },
      { label: 'Empresa', href: '/configuracion/empresa', icon: Building2 },
    ],
  },
  {
    title: 'Universal',
    items: [
      { label: 'Asistencia (Checador)', href: '/asistencia', icon: CalendarCheck },
      { label: 'Perfil', href: '/perfil', icon: UserCircle },
      { label: 'Notificaciones', href: '/notificaciones', icon: Bell },
    ],
  },
];

// ─── Nav para GERENTE (igual que Admin pero SIN Usuarios) ─────────────────────
const gerenteNav: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Dashboard Ejecutivo', href: '/dashboard-ejecutivo', icon: TrendingUp },
      { label: 'Proyectos', href: '/proyectos', icon: FolderOpen },
      { label: 'Incidencias', href: '/incidencias', icon: AlertTriangle },
      { label: 'Reportes Diarios', href: '/reportes-diarios', icon: FileText },
      { label: 'Galería Evidencias', href: '/galeria-evidencias', icon: Image },
    ],
  },
  {
    title: 'Finanzas y RH',
    items: [
      { label: 'Horarios', href: '/horarios', icon: Clock },
      { label: 'Reporte de Horas', href: '/reporte-horas', icon: FileBarChart },
      { label: 'Control Horario', href: '/control-horario', icon: ClipboardList },
      { label: 'Días No Laborales', href: '/dias-no-laborales', icon: Calendar },
      { label: 'Gastos de Obra', href: '/gastos-obra', icon: DollarSign },
    ],
  },
  {
    title: 'Comercial',
    items: [
      { label: 'Cotizaciones', href: '/comercial/cotizaciones', icon: FileText },
      { label: 'Pedidos', href: '/comercial/pedidos', icon: ShoppingCart },
      { label: 'Ventas', href: '/comercial/ventas', icon: BarChart3 },
      { label: 'Inventario', href: '/comercial/inventario', icon: Boxes },
    ],
  },
  {
    title: 'Catálogos',
    items: [
      { label: 'Materiales', href: '/catalogos/materiales', icon: Package },
      { label: 'Proveedores', href: '/catalogos/proveedores', icon: Truck },
      { label: 'Clientes', href: '/catalogos/clientes', icon: Briefcase },
    ],
  },
  {
    title: 'Universal',
    items: [
      { label: 'Asistencia (Checador)', href: '/asistencia', icon: CalendarCheck },
      { label: 'Perfil', href: '/perfil', icon: UserCircle },
      { label: 'Notificaciones', href: '/notificaciones', icon: Bell },
    ],
  },
];

// ─── Nav para INGENIERO (solo proyectos asignados + asistencia) ───────────────
const ingenieroNav: NavGroup[] = [
  {
    title: 'Mi Trabajo',
    items: [
      { label: 'Mis Proyectos', href: '/proyectos', icon: FolderOpen },
      { label: 'Incidencias', href: '/incidencias', icon: AlertTriangle },
      { label: 'Galería Evidencias', href: '/galeria-evidencias', icon: Image },
    ],
  },
  {
    title: 'Universal',
    items: [
      { label: 'Asistencia (Checador)', href: '/asistencia', icon: CalendarCheck },
      { label: 'Perfil', href: '/perfil', icon: UserCircle },
      { label: 'Notificaciones', href: '/notificaciones', icon: Bell },
    ],
  },
];

// ─── Nav para SUPERVISOR (proyectos asignados + reportes + asistencia) ────────
const supervisorNav: NavGroup[] = [
  {
    title: 'Mi Trabajo',
    items: [
      { label: 'Mis Proyectos', href: '/proyectos', icon: FolderOpen },
      { label: 'Registrar Avance', href: '/reportes-diarios', icon: Hammer },
      { label: 'Incidencias', href: '/incidencias', icon: AlertTriangle },
      { label: 'Galería Evidencias', href: '/galeria-evidencias', icon: Image },
    ],
  },
  {
    title: 'Universal',
    items: [
      { label: 'Asistencia (Checador)', href: '/asistencia', icon: CalendarCheck },
      { label: 'Perfil', href: '/perfil', icon: UserCircle },
      { label: 'Notificaciones', href: '/notificaciones', icon: Bell },
    ],
  },
];

// ─── Nav para SUPERADMIN (gestión global multi-empresa) ───────────────────────
const superAdminNav: NavGroup[] = [
  {
    title: 'Superadmin',
    items: [
      { label: 'Dashboard Superadmin', href: '/dashboard-superadmin', icon: LayoutDashboard },
      { label: 'Empresas', href: '/superadmin/empresas', icon: Building2 },
      { label: 'Usuarios Globales', href: '/superadmin/usuarios', icon: Globe },
      { label: 'Solicitudes', href: '/superadmin/solicitudes', icon: UserPlus },
    ],
  },
  {
    title: 'Cuenta',
    items: [
      { label: 'Perfil', href: '/perfil', icon: UserCircle },
      { label: 'Notificaciones', href: '/notificaciones', icon: Bell },
    ],
  },
];

// ─── Seleccionar nav según el rol ─────────────────────────────────────────────
function getNavForRole(role: AuthRole | undefined): NavGroup[] {
  switch (role) {
    case 'administrador': return administradorNav;
    case 'gerente':       return gerenteNav;
    case 'ingeniero':     return ingenieroNav;
    case 'supervisor':    return supervisorNav;
    case 'superadmin':    return superAdminNav;
    default:              return gerenteNav;
  }
}

// ─── Colores de badge por rol ─────────────────────────────────────────────────
const roleColors: Record<string, string> = {
  administrador: 'bg-purple-500',
  gerente:       'bg-blue-600',
  supervisor:    'bg-amber-500',
  ingeniero:     'bg-emerald-500',
  superadmin:    'bg-slate-900',
};

// ─── Etiquetas de rol en español ─────────────────────────────────────────────
const roleLabels: Record<string, string> = {
  administrador: 'Administrador',
  gerente:       'Gerente',
  supervisor:    'Supervisor',
  ingeniero:     'Ingeniero',
  superadmin:    'Superadmin',
};

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useStore();
  const { currentUser, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  // Obtener la navegación correspondiente al rol del usuario
  const navGroups = getNavForRole(currentUser?.rol?.nombre);

  // Determinar si un enlace está activo
  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const roleBadgeColor = roleColors[currentUser?.rol?.nombre || ''] || 'bg-blue-600';
  const roleLabelText  = roleLabels[currentUser?.rol?.nombre || ''] || currentUser?.rol?.nombre || '';

  // Calcular iniciales del nombre
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Backdrop móvil */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-[260px] bg-sidebar border-r border-default z-40 flex flex-col transition-transform lg:transition-[width] duration-300 ease-in-out',
          sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-[260px]',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-default shrink-0">
        <SigoLogoBadge size={36} />
        {!sidebarCollapsed && (
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-bold text-primary leading-none">SIGO</p>
            <p className="text-xs text-muted mt-0.5">Centro de Control</p>
          </div>
        )}
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-app transition-colors ml-auto"
        >
          <X size={18} />
        </button>
      </div>

      {/* Badge del usuario con rol */}
      {!sidebarCollapsed && currentUser && (
        <div className="mx-3 mt-3 mb-1">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-app border border-default">
            <div
              className={cn(
                'w-7 h-7 rounded-lg text-white flex items-center justify-center text-xs font-bold shrink-0',
                roleBadgeColor
              )}
            >
              {currentUser.foto_perfil
                ? <img src={currentUser.foto_perfil} alt="avatar" className="w-full h-full rounded-lg object-cover" />
                : getInitials(currentUser.nombre)
              }
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-primary truncate">{currentUser.nombre}</p>
              <p className="text-[10px] text-muted capitalize">{roleLabelText}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navegación dinámica por rol */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-4">
            {/* Título de grupo (solo visible cuando el sidebar no está colapsado) */}
            {!sidebarCollapsed && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
                {group.title}
              </p>
            )}
            {/* Separador visual cuando está colapsado */}
            {sidebarCollapsed && <div className="my-2 border-t border-default" />}

            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={cn(
                    'sidebar-item mb-0.5',
                    active && 'active',
                    sidebarCollapsed && 'justify-center px-0 py-2.5'
                  )}
                >
                  <Icon size={18} className="shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  {/* Badge opcional (ej. conteo de notificaciones) */}
                  {!sidebarCollapsed && item.badge && (
                    <span className="ml-auto text-xs bg-sigo-primary text-white rounded-full px-1.5 py-0.5 leading-none">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Pie: logout y colapsar */}
      <div className="border-t border-default">
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-2 px-4 py-3 text-xs text-secondary hover:text-sigo-error hover:bg-sigo-error/10 dark:hover:bg-sigo-error/15 transition-colors',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <LogOut size={15} />
          {!sidebarCollapsed && <span>Cerrar Sesión</span>}
        </button>
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex w-full items-center justify-center gap-2 px-4 py-3 border-t border-default text-secondary hover:text-primary hover:bg-app transition-colors text-xs"
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : (
            <>
              <ChevronLeft size={16} />
              <span>Colapsar</span>
            </>
          )}
        </button>
      </div>
      </aside>
    </>
  );
}
