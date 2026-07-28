'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/store/useAuthStore';
import EmpresaSelector from '@/components/layout/EmpresaSelector';
import { Bell, Sun, Moon, LogOut, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { timeAgo } from '@/lib/utils';
import { cn } from '@/lib/utils';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/usuarios': 'Gestión de Usuarios',
  '/seguimiento-obra': 'Seguimiento de Obra',
  '/catalogos/materiales': 'Catálogo de Materiales',
  '/catalogos/proveedores': 'Catálogo de Proveedores',
  '/gastos-obra': 'Gastos de Obra',
  '/horarios': 'Control de Horarios',
  '/reporte-horas': 'Reporte de Horas',
  '/dashboard-ejecutivo': 'Dashboard Ejecutivo',
  '/incidencias-criticas': 'Incidencias Críticas',
  '/actividad-reciente': 'Actividad Reciente',
  '/reportes-diarios': 'Reportes Diarios',
  '/validar-reportes': 'Validar Reportes',
  '/galeria-evidencias': 'Galería de Evidencias',
  '/incidencias': 'Incidencias',
  '/control-horario': 'Control de Horario',
  '/dias-no-laborales': 'Días No Laborales',
  '/configuracion/categorias': 'Configuración de Categorías',
  '/comercial/cotizaciones': 'Cotizaciones',
  '/comercial/pedidos': 'Pedidos de Venta',
  '/comercial/ventas': 'Ventas',
  '/comercial/inventario': 'Inventario',
  '/super-admin/dashboard': 'Panel Super Admin',
  '/super-admin/empresas': 'Gestión de Empresas',
  '/super-admin/usuarios': 'Usuarios Global',
  '/super-admin/proyectos': 'Proyectos Global',
  '/super-admin/licencias': 'Gestión de Licencias',
  '/super-admin/auditoria': 'Auditoría del Sistema',
};

export default function Header() {
  const { darkMode, toggleDarkMode, notificaciones, marcarNotificacionLeida, sidebarCollapsed, toggleMobileSidebar } = useStore();
  const { currentUser, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [showNotif, setShowNotif] = useState(false);

  const unread = notificaciones.filter(n => !n.leida).length;

  const title = Object.entries(pageTitles).find(([k]) => pathname.startsWith(k))?.[1]
    ?? (pathname.includes('/proyectos/') ? 'Detalle de Proyecto'
    : pathname.includes('/reportes-diarios/') ? 'Detalle de Reporte'
    : pathname.includes('/incidencias/') ? 'Detalle de Incidencia'
    : 'ArquiWeb');

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') {
      document.documentElement.classList.add('dark');
      useStore.setState({ darkMode: true });
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const roleColors: Record<string, string> = {
    administrador: 'from-purple-600 to-purple-500',
    gerente: 'from-blue-700 to-blue-600',
    supervisor: 'from-amber-600 to-amber-500',
    ingeniero: 'from-emerald-600 to-emerald-500',
  };
  const avatarGradient = roleColors[currentUser?.rol?.nombre || 'gerente'] || 'from-blue-700 to-blue-600';

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className={cn(
      'fixed top-0 right-0 left-0 h-16 bg-card border-b border-default z-30 flex items-center px-4 gap-4 transition-all duration-300 ease-in-out',
      sidebarCollapsed ? 'lg:left-[72px]' : 'lg:left-[260px]'
    )}>
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden p-2 rounded-lg text-secondary hover:text-primary hover:bg-app transition-colors shrink-0"
      >
        <Menu size={20} />
      </button>
      <h1 className="flex-1 text-base font-semibold text-primary truncate">{title}</h1>

      <div className="flex items-center gap-2">
        {/* Dark Mode */}
        <button
          id="dark-mode-toggle"
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-app transition-colors"
          title={darkMode ? 'Modo claro' : 'Modo oscuro'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            id="notifications-bell"
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-2 rounded-lg text-secondary hover:text-primary hover:bg-app transition-colors"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-soft">
                {unread}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-default rounded-xl shadow-xl z-50 fade-in">
              <div className="px-4 py-3 border-b border-default flex items-center justify-between">
                <p className="text-sm font-semibold text-primary">Notificaciones</p>
                <span className="text-xs text-brand-600 font-medium">{unread} sin leer</span>
              </div>
              <div className="max-h-72 overflow-y-auto scrollbar-thin">
                {notificaciones.map(n => (
                  <div
                    key={n.id}
                    onClick={() => marcarNotificacionLeida(n.id)}
                    className={cn(
                      'px-4 py-3 border-b border-default last:border-0 cursor-pointer hover:bg-app transition-colors',
                      !n.leida && 'bg-brand-50 dark:bg-brand-900/10'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', {
                        'bg-red-500': n.tipo === 'error',
                        'bg-amber-500': n.tipo === 'warning',
                        'bg-brand-500': n.tipo === 'info',
                        'bg-emerald-500': n.tipo === 'success',
                      })} />
                      <div>
                        <p className="text-xs font-semibold text-primary">{n.titulo}</p>
                        <p className="text-xs text-secondary mt-0.5">{n.descripcion}</p>
                        <p className="text-[10px] text-muted mt-1">{timeAgo(n.fecha)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User avatar + logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-default">
          <div className={cn('w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-xs font-bold text-white', avatarGradient)}>
            {currentUser?.foto_perfil ? (
              <img src={currentUser.foto_perfil} alt="avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(currentUser?.nombre || '')
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-primary leading-none">{currentUser?.nombre || 'Usuario'}</p>
            <p className="text-[10px] text-muted mt-0.5 capitalize">{currentUser?.rol?.nombre}</p>
          </div>
          <EmpresaSelector />
          <button
            onClick={handleLogout}
            className="ml-1 p-1.5 rounded-lg text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
