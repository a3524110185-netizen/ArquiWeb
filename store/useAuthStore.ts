'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, AuthRole } from '@/types';

// ─── Mock Users ───────────────────────────────────────────────────────────────
export const MOCK_USERS: AuthUser[] = [
  {
    id: 'auth_1',
    nombre: 'Luis Pérez',
    email: 'admin@arquitectura.com',
    password: 'admin123',
    authRole: 'SuperAdmin',
    avatar: 'LP',
    empresaId: undefined,
  },
  {
    id: 'auth_2',
    nombre: 'Ana García',
    email: 'gerente@arquitectura.com',
    password: 'gerente123',
    authRole: 'Gerente',
    empresaId: 'e1',
    empresaNombre: 'Constructora ABC',
    avatar: 'AG',
  },
  {
    id: 'auth_3',
    nombre: 'Carlos Martínez',
    email: 'arquitecto@arquitectura.com',
    password: 'arq123',
    authRole: 'Arquitecto',
    empresaId: 'e1',
    empresaNombre: 'Constructora ABC',
    avatar: 'CM',
    proyectosAsignados: ['p1', 'p3'],
  },
  {
    id: 'auth_4',
    nombre: 'María López',
    email: 'capturista@arquitectura.com',
    password: 'capt123',
    authRole: 'Capturista',
    empresaId: 'e2',
    empresaNombre: 'Materiales XYZ',
    avatar: 'ML',
  },
  {
    id: 'auth_5',
    nombre: 'Roberto Sánchez',
    email: 'supervisor@arquitectura.com',
    password: 'sup123',
    authRole: 'Supervisor',
    empresaId: 'e1',
    empresaNombre: 'Constructora ABC',
    avatar: 'RS',
    proyectosAsignados: ['p4'],
  },
];

// Role → default route
export const ROLE_REDIRECTS: Record<AuthRole, string> = {
  SuperAdmin: '/super-admin/dashboard',
  Gerente: '/dashboard',
  Arquitecto: '/dashboard-ejecutivo',
  Capturista: '/gastos/nuevo',
  Supervisor: '/seguimiento-obra',
};

// ─── Simulated JWT ────────────────────────────────────────────────────────────
function createToken(user: AuthUser): string {
  const payload = {
    id: user.id,
    email: user.email,
    authRole: user.authRole,
    empresaId: user.empresaId,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24h
  };
  return btoa(JSON.stringify(payload));
}

function parseToken(token: string): { id: string; email: string; authRole: AuthRole; exp: number } | null {
  try {
    const data = JSON.parse(atob(token));
    if (data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

// ─── Store Interface ──────────────────────────────────────────────────────────
interface AuthState {
  currentUser: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => { success: boolean; error?: string; redirectTo?: string };
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  token: null,
  isAuthenticated: false,

  login: (email, password) => {
    const user = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) {
      return { success: false, error: 'Credenciales incorrectas. Verifica tu email y contraseña.' };
    }
    const token = createToken(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      // Set cookie for middleware
      document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24}`;
    }
    set({ currentUser: user, token, isAuthenticated: true });
    return { success: true, redirectTo: ROLE_REDIRECTS[user.authRole] };
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      document.cookie = 'auth_token=; path=/; max-age=0';
    }
    set({ currentUser: null, token: null, isAuthenticated: false });
  },

  initAuth: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    const parsed = parseToken(token);
    if (!parsed) {
      localStorage.removeItem('auth_token');
      return;
    }
    const user = MOCK_USERS.find((u) => u.id === parsed.id);
    if (user) {
      set({ currentUser: user, token, isAuthenticated: true });
    }
  },
}));
