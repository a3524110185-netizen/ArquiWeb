'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (currentUser && currentUser.rol.nombre !== 'superadmin') {
      router.replace('/dashboard');
    }
  }, [isLoading, currentUser, router]);

  if (isLoading || !currentUser || currentUser.rol.nombre !== 'superadmin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    );
  }

  return <>{children}</>;
}
