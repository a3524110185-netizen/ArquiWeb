import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { API_URL } from './services/api';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Origen del backend sin el sufijo /api (para servir /storage/...)
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';

  if (/^https?:\/\//i.test(url)) {
    // Absoluta pero con host localhost/127.0.0.1 desactualizado -> reescribir con el origen real
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url)) {
      try {
        const parsed = new URL(url);
        return `${API_ORIGIN}${parsed.pathname}${parsed.search}`;
      } catch {
        return url;
      }
    }
    return url; // ya es absoluta y válida
  }

  // Relativa -> anteponer el origen del backend
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Un string "YYYY-MM-DD" (sin hora) lo interpreta el motor JS como medianoche UTC;
// al formatear en una zona horaria detrás de UTC eso corre la fecha un día hacia atrás.
// Forzamos T00:00:00 (sin offset) para que se interprete en hora local.
function parseFecha(dateStr: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? new Date(`${dateStr}T00:00:00`) : new Date(dateStr);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parseFecha(dateStr));
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parseFecha(dateStr));
}

export function formatTime(dateStr: string): string {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'hace un momento';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)} días`;
  return formatDate(dateStr);
}

export function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getDefaultDateRange(): { desde: string; hasta: string } {
  const hoy = new Date();
  const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  return { desde: toISODate(primerDia), hasta: toISODate(hoy) };
}
