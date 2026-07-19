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
  Building2, ClipboardList, ShieldAlert, Crown, Globe, FileCheck,
  ShoppingCart, BarChart3, Boxes, LogOut, ShieldCheck,
} from 'lucide-react';

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

// Nav definitions by role
const superAdminNav: NavGroup[] = [
  {
    title: 'Super Admin',
    items: [
      { label: 'Dashboard Global', href: '/super-admin/dashboard', icon: Crown },
      { label: 'Empresas', href: '/super-admin/empresas', icon: Building2 },
      { label: 'Usuarios Global', href: '/super-admin/usuarios', icon: Users },
      { label: 'Proyectos Global', href: '/super-admin/proyectos', icon: FolderOpen },
      { label: 'Licencias', href: '/super-admin/licencias', icon: FileCheck },
      { label: 'Auditoría', href: '/super-admin/auditoria', icon: ShieldCheck },
    ],
  },
];

const gerenteNav: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Usuarios', href: '/usuarios', icon: Users },
      { label: 'Seguimiento de Obra', href: '/seguimiento-obra', icon: HardHat },
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
    title: 'App Móvil',
    items: [
      { label: 'Dashboard Ejecutivo', href: '/dashboard-ejecutivo', icon: TrendingUp },
      { label: 'Actividad Reciente', href: '/actividad-reciente', icon: Activity },
      { label: 'Proyectos', href: '/proyectos/p1', icon: FolderOpen },
      { label: 'Reportes Diarios', href: '/reportes-diarios', icon: FileText },
      { label: 'Validar Reportes', href: '/validar-reportes', icon: CheckSquare },
      { label: 'Galería Evidencias', href: '/galeria-evidencias', icon: Image },
    ],
  },
  {
    title: 'Incidencias',
    items: [
      { label: 'Todas las Incidencias', href: '/incidencias', icon: AlertTriangle },
      { label: 'Incidencias Críticas', href: '/incidencias-criticas', icon: ShieldAlert },
    ],
  },
  {
    title: 'Configuración',
    items: [
      { label: 'Categorías', href: '/configuracion/categorias', icon: Settings },
    ],
  },
];

const arquitectoNav: NavGroup[] = [
  {
    title: 'Mis Proyectos',
    items: [
      { label: 'Dashboard Ejecutivo', href: '/dashboard-ejecutivo', icon: TrendingUp },
      { label: 'Proyectos', href: '/proyectos/p1', icon: FolderOpen },
      { label: 'Actividad Reciente', href: '/actividad-reciente', icon: Activity },
    ],
  },
  {
    title: 'Reportes',
    items: [
      { label: 'Reportes Diarios', href: '/reportes-diarios', icon: FileText },
      { label: 'Galería Evidencias', href: '/galeria-evidencias', icon: Image },
    ],
  },
  {
    title: 'Incidencias',
    items: [
      { label: 'Todas las Incidencias', href: '/incidencias', icon: AlertTriangle },
      { label: 'Incidencias Críticas', href: '/incidencias-criticas', icon: ShieldAlert },
    ],
  },
];

const supervisorNav: NavGroup[] = [
  {
    title: 'Campo',
    items: [
      { label: 'Seguimiento de Obra', href: '/seguimiento-obra', icon: HardHat },
      { label: 'Reportes Diarios', href: '/reportes-diarios', icon: FileText },
      { label: 'Validar Reportes', href: '/validar-reportes', icon: CheckSquare },
      { label: 'Incidencias', href: '/incidencias', icon: AlertTriangle },
    ],
  },
  {
    title: 'Herramientas',
    items: [
      { label: 'Control Horario', href: '/control-horario', icon: ClipboardList },
      { label: 'Galería Evidencias', href: '/galeria-evidencias', icon: Image },
    ],
  },
];

function getNavForRole(role: string): NavGroup[] {
  switch (role) {
    case 'SuperAdmin': return superAdminNav;
    case 'Gerente': return gerenteNav;
    case 'Arquitecto': return arquitectoNav;
    case 'Supervisor': return supervisorNav;
    default: return gerenteNav;
  }
}

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useStore();
  const { currentUser, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const navGroups = getNavForRole(currentUser?.authRole || 'Gerente');

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/super-admin/dashboard') return pathname === '/super-admin/dashboard';
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const roleColors: Record<string, string> = {
    SuperAdmin: 'bg-purple-500',
    Gerente: 'bg-blue-600',
    Arquitecto: 'bg-sky-500',
    Supervisor: 'bg-amber-500',
    Capturista: 'bg-emerald-500',
  };
  const roleBadgeColor = roleColors[currentUser?.authRole || 'Gerente'] || 'bg-blue-600';

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
            <p className="text-sm font-bold text-primary leading-none">ArquiWeb</p>
            <p className="text-xs text-muted mt-0.5">Centro de Control</p>
          </div>
        )}
      </div>

      {/* Role badge (not collapsed) */}
      {!sidebarCollapsed && currentUser && (
        <div className="mx-3 mt-3 mb-1">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-app border border-default">
            <div className={cn('w-7 h-7 rounded-lg text-white flex items-center justify-center text-xs font-bold shrink-0', roleBadgeColor)}>
              {currentUser.avatar}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-primary truncate">{currentUser.nombre}</p>
              <p className="text-[10px] text-muted">{currentUser.authRole}</p>
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
