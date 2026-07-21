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
  UserCircle, Timer,
} from 'lucide-react';
import type { AuthRole } from '@/types';

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

// ─── Nav para administrador ───────────────────────────────────────────────────
const administradorNav: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Proyectos', href: '/proyectos', icon: FolderOpen },
      { label: 'Incidencias', href: '/incidencias', icon: AlertTriangle },
      { label: 'Reportes Diarios', href: '/reportes-diarios', icon: FileText },
    ],
  },
  {
    title: 'Usuarios',
    items: [
      { label: 'Gestión de Usuarios', href: '/usuarios', icon: Users },
    ],
  },
  {
    title: 'Finanzas y RH',
    items: [
      { label: 'Gastos de Obra', href: '/gastos-obra', icon: DollarSign },
      { label: 'Horarios', href: '/horarios', icon: Clock },
      { label: 'Reporte de Horas', href: '/reporte-horas', icon: FileBarChart },
      { label: 'Control Horario', href: '/control-horario', icon: ClipboardList },
      { label: 'Días No Laborales', href: '/dias-no-laborales', icon: Calendar },
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
    ],
  },
  {
    title: 'Más',
    items: [
      { label: 'Seguimiento de Obra', href: '/seguimiento-obra', icon: HardHat },
      { label: 'Actividad Reciente', href: '/actividad-reciente', icon: Activity },
      { label: 'Galería Evidencias', href: '/galeria-evidencias', icon: Image },
      { label: 'Incidencias Críticas', href: '/incidencias-criticas', icon: ShieldAlert },
      { label: 'Validar Reportes', href: '/validar-reportes', icon: CheckSquare },
    ],
  },
  {
    title: 'Configuración',
    items: [
      { label: 'Categorías', href: '/configuracion/categorias', icon: Settings },
    ],
  },
  {
    title: 'Universal',
    items: [
      { label: 'Asistencia (Checador)', href: '/asistencia', icon: Timer },
    ],
  },
];

// ─── Nav para gerente ──────────────────────────────────────────────────────────
const gerenteNav: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Proyectos', href: '/proyectos', icon: FolderOpen },
      { label: 'Incidencias', href: '/incidencias', icon: AlertTriangle },
      { label: 'Reportes Diarios', href: '/reportes-diarios', icon: FileText },
    ],
  },
  {
    title: 'Finanzas y RH',
    items: [
      { label: 'Gastos de Obra', href: '/gastos-obra', icon: DollarSign },
      { label: 'Horarios', href: '/horarios', icon: Clock },
      { label: 'Reporte de Horas', href: '/reporte-horas', icon: FileBarChart },
      { label: 'Control Horario', href: '/control-horario', icon: ClipboardList },
      { label: 'Días No Laborales', href: '/dias-no-laborales', icon: Calendar },
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
    ],
  },
  {
    title: 'Más',
    items: [
      { label: 'Seguimiento de Obra', href: '/seguimiento-obra', icon: HardHat },
      { label: 'Actividad Reciente', href: '/actividad-reciente', icon: Activity },
      { label: 'Galería Evidencias', href: '/galeria-evidencias', icon: Image },
      { label: 'Incidencias Críticas', href: '/incidencias-criticas', icon: ShieldAlert },
      { label: 'Validar Reportes', href: '/validar-reportes', icon: CheckSquare },
    ],
  },
  {
    title: 'Universal',
    items: [
      { label: 'Asistencia (Checador)', href: '/asistencia', icon: Timer },
    ],
  },
];

// ─── Nav para supervisor e ingeniero (solo asistencia) ────────────────────────
const campoNav: NavGroup[] = [
  {
    title: 'Mi Área',
    items: [
      { label: 'Asistencia (Checador)', href: '/asistencia', icon: Timer },
    ],
  },
];

function getNavForRole(role: AuthRole | undefined): NavGroup[] {
  switch (role) {
    case 'administrador': return administradorNav;
    case 'gerente':       return gerenteNav;
    case 'supervisor':
    case 'ingeniero':     return campoNav;
    default:              return gerenteNav;
  }
}

const roleColors: Record<string, string> = {
  administrador: 'bg-purple-500',
  gerente:       'bg-blue-600',
  supervisor:    'bg-amber-500',
  ingeniero:     'bg-emerald-500',
};

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useStore();
  const { currentUser, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const navGroups = getNavForRole(currentUser?.rol?.nombre);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const roleBadgeColor = roleColors[currentUser?.rol?.nombre || ''] || 'bg-blue-600';

  // Calcular iniciales del nombre
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-sidebar border-r border-default z-40 flex flex-col transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-default shrink-0">
        <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shrink-0">
          <Building2 size={20} className="text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-primary leading-none">SIGO</p>
            <p className="text-xs text-muted mt-0.5">Centro de Control</p>
          </div>
        )}
      </div>

      {/* User badge */}
      {!sidebarCollapsed && currentUser && (
        <div className="mx-3 mt-3 mb-1">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-app border border-default">
            <div className={cn('w-7 h-7 rounded-lg text-white flex items-center justify-center text-xs font-bold shrink-0', roleBadgeColor)}>
              {currentUser.foto_perfil
                ? <img src={currentUser.foto_perfil} alt="avatar" className="w-full h-full rounded-lg object-cover" />
                : getInitials(currentUser.nombre)
              }
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-primary truncate">{currentUser.nombre}</p>
              <p className="text-[10px] text-muted capitalize">{currentUser.rol?.nombre}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-4">
            {!sidebarCollapsed && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
                {group.title}
              </p>
            )}
            {sidebarCollapsed && <div className="my-2 border-t border-default" />}
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={cn(
                    'sidebar-item mb-0.5',
                    active && 'active',
                    sidebarCollapsed && 'justify-center px-0 py-2.5'
                  )}
                >
                  <Icon size={18} className="shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  {!sidebarCollapsed && item.badge && (
                    <span className="ml-auto text-xs bg-brand-600 text-white rounded-full px-1.5 py-0.5 leading-none">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-default">
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-2 px-4 py-3 text-xs text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <LogOut size={15} />
          {!sidebarCollapsed && <span>Cerrar Sesión</span>}
        </button>
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-t border-default text-secondary hover:text-primary hover:bg-app transition-colors text-xs"
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
  );
}
