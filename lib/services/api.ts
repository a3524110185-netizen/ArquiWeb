export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  public status: number;
  public data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const api = {
  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return fetchApi<T>(endpoint, { ...options, method: 'GET' });
  },

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return fetchApi<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return fetchApi<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return fetchApi<T>(endpoint, { ...options, method: 'DELETE' });
  },

  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return fetchApi<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Subida de archivos (multipart/form-data). Laravel no interpreta bien el
  // body multipart en peticiones PUT/PATCH nativas, así que para 'PUT' se
  // envía como POST con el campo _method=PUT (mismo truco ya usado en
  // gastosObra.ts/proyectos.ts, ahora centralizado aquí).
  async upload<T>(endpoint: string, formData: FormData, method: 'POST' | 'PUT' = 'POST'): Promise<ApiResponse<T>> {
    if (method === 'PUT') formData.append('_method', 'PUT');
    return fetchApi<T>(endpoint, { method: 'POST', body: formData });
  },
};

export function extractErrorMessage(err: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (err instanceof ApiError) {
    const errors = err.data?.errors as Record<string, string[]> | undefined;
    if (errors) {
      const messages = Object.values(errors).flat().filter(Boolean);
      if (messages.length > 0) return messages.join(' ');
    }
    return err.message || fallback;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function extractFieldErrors(err: unknown): Record<string, string> {
  if (err instanceof ApiError && err.data?.errors) {
    const out: Record<string, string> = {};
    Object.entries(err.data.errors as Record<string, string[]>).forEach(([field, msgs]) => {
      if (msgs?.[0]) out[field] = msgs[0];
    });
    return out;
  }
  return {};
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  // Con FormData, dejar que el navegador fije el Content-Type (incluye el boundary).
  if (!isFormData) headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');
  headers.set('ngrok-skip-browser-warning', 'true');

  // Leer token y rol solo en el navegador (evita errores de SSR)
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('auth_token');
    if (!token) {
      const match = document.cookie.match(new RegExp('(^| )auth_token=([^;]+)'));
      if (match) token = match[2];
    }
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Enviar el rol del usuario en cada petición.
  // El backend usa este header para que admin/gerente puedan acceder
  // a recursos sin estar en proyecto_usuario (bypass de verificación de proyecto).
  if (typeof window !== 'undefined') {
    const rolMatch = document.cookie.match(new RegExp('(^| )auth_role=([^;]+)'));
    const rol = rolMatch ? rolMatch[2] : null;
    if (rol) headers.set('X-User-Rol', rol);
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Manejar expiración de token en el cliente
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      document.cookie = 'auth_token=; path=/; max-age=0';
      window.location.href = '/login';
    }
  }

  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    throw new ApiError(
      data?.message || 'Error en la solicitud',
      response.status,
      data
    );
  }

  return data as ApiResponse<T>;
}
