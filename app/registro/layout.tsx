import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registro | ArquiWeb',
  description: 'Solicita una cuenta en el sistema de gestión integral de obra ArquiWeb',
};

export default function RegistroLayout({ children }: { children: React.ReactNode }) {
  return children;
}
