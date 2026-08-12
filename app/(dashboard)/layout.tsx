'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import EmpresaModal from '@/components/layout/EmpresaModal';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// Roles con acceso a la app web completa (con sidebar)
const ROLES_CON_ACCESO = ['administrador', 'gerente', 'supervisor', 'ingeniero', 'superadmin'];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useStore();
  const { isAuthenticated, isLoading, initAuth, currentUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initAuth();
    }
  }, [initAuth]);

  useEffect(() => {
    if (isLoading) return;

    // Sin sesión → login
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Rol sin acceso web → no autorizado
    if (currentUser && !ROLES_CON_ACCESO.includes(currentUser.rol.nombre)) {
      router.replace('/no-autorizado');
    }
  }, [isAuthenticated, isLoading, currentUser, router]);

  // Spinner mientras se verifica la sesión
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <Loader2 size={40} className="animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app">
      <EmpresaModal />
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'
        )}
      >
        <Header />
        <main className="pt-16 min-h-screen">
          <div className="p-6 fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
