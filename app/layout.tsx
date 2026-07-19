import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: {
    template: '%s | ArquiWeb',
    default: 'ArquiWeb – Centro de Control de Obra',
  },
  description: 'Sistema de gestión integral para empresa de arquitectura y licitaciones gubernamentales. Control de proyectos, incidencias, gastos y personal.',
  keywords: ['arquitectura', 'licitaciones', 'gestión de obra', 'control de proyectos', 'construcción'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var dm = localStorage.getItem('darkMode');
                if (dm === 'true') document.documentElement.classList.add('dark');
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
