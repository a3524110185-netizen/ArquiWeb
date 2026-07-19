import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | ArquiWeb',
  description: 'Accede al sistema de gestión integral de obra ArquiWeb',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
