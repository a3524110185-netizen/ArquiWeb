'use client';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { ShieldAlert, LogOut } from 'lucide-react';

export default function NoAutorizadoPage() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 mb-4">
          <ShieldAlert size={48} className="text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold">Acceso No Autorizado</h1>
        
        <p className="text-slate-400">
          Lo sentimos, tu rol no tiene permisos para acceder a la aplicación web. 
          Por favor, utiliza la aplicación móvil o contacta al administrador.
        </p>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-medium"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
