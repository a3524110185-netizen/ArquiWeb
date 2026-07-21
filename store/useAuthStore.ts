'use client';
import { create } from 'zustand';
import type { AuthUser, AuthRole } from '@/types';
import { authService } from '@/lib/services/auth';

// Ruta de destino por defecto para cada rol al iniciar sesión
export const ROLE_REDIRECTS: Record<AuthRole, string> = {
  administrador: '/dashboard',
  gerente:       '/dashboard',
  supervisor:    '/asistencia',
  ingeniero:     '/asistencia',
};

// ─── Store Interface ──────────────────────────────────────────────────────────
interface AuthState {
  currentUser: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; redirectTo?: string }>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    try {
      const response = await authService.login(email, password);
      
      if (response.status === 'success' && response.data) {
        const { token, usuario } = response.data;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token);
          const maxAge = 60 * 60 * 24;
          // Cookie de token para autenticación
          document.cookie = `auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
          // Cookie auxiliar de rol para el middleware (no sensible)
          document.cookie = `auth_role=${usuario.rol.nombre}; path=/; max-age=${maxAge}; SameSite=Lax`;
        }
        
        set({ currentUser: usuario, token, isAuthenticated: true });
        
        // Determinar redirección basada en el rol de la API
        const role = usuario.rol.nombre;
        return { success: true, redirectTo: ROLE_REDIRECTS[role] || '/no-autorizado' };
      }
      
      return { success: false, error: response.message || 'Credenciales incorrectas' };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || error.data?.message || 'Error de conexión con el servidor' 
      };
    }
  },

  logout: async () => {
    try {
      let token = null;
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('auth_token');
      }
      if (token) {
        await authService.logout();
      }
    } catch (e) {
      console.error('Error durante el logout API', e);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        document.cookie = 'auth_token=; path=/; max-age=0';
        document.cookie = 'auth_role=; path=/; max-age=0';
      }
      set({ currentUser: null, token: null, isAuthenticated: false });
    }
  },

  initAuth: async () => {
    if (typeof window === 'undefined') return;
    
    let token = null;
    if (typeof window !== 'undefined') {
      const match = document.cookie?.match(new RegExp('(^| )auth_token=([^;]+)'));
      if (match) {
        token = match[2];
      }
      
      if (!token) {
        token = localStorage.getItem('auth_token');
      }
    }

    if (!token) {
      set({ isLoading: false });
      return;
    }
    
    try {
      const response = await authService.getUsuario();
      if (response.status === 'success' && response.data) {
        // Soporta tanto response.data directo (API real) como response.data.usuario
        const rawData = response.data as any;
        const usuario: AuthUser = rawData.usuario ? rawData.usuario : rawData;
        
        if (!usuario || !usuario.rol) {
          throw new Error('Estructura de usuario no válida');
        }

        // Restaurar la cookie de rol si por alguna razón se perdió (ej. borrado manual)
        document.cookie = `auth_role=${usuario.rol.nombre}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
        set({ 
          currentUser: usuario, 
          token, 
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        throw new Error('Token inválido o expirado');
      }
    } catch (error) {
      console.error('Error inicializando auth', error);
      // Limpiar solo en el navegador (evita errores de SSR)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        document.cookie = 'auth_token=; path=/; max-age=0';
        document.cookie = 'auth_role=; path=/; max-age=0';
      }
      set({ currentUser: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
