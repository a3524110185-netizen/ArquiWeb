'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useStore();
  const { isAuthenticated, initAuth, currentUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.replace('/login');
      }
    } else if (isAuthenticated && currentUser?.authRole !== 'SuperAdmin') {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, currentUser, router]);

  if (!currentUser || currentUser.authRole !== 'SuperAdmin') return null;

  return (
    <div className="min-h-screen bg-app">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'pl-[72px]' : 'pl-[260px]'
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
