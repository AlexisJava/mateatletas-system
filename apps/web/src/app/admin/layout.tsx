'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, checkAuth, isAuthenticated } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateAuth = async () => {
      // Verificar token en localStorage
      const token = localStorage.getItem('auth-token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Si ya tenemos user en el store y es admin, TODO OK
      if (user && user.role === 'admin') {
        setIsValidating(false);
        return;
      }

      // Si no tenemos user, intentar obtenerlo del backend
      if (!user) {
        try {
          await checkAuth();
          const currentUser = useAuthStore.getState().user;

          if (!currentUser) {
            router.push('/login');
            return;
          }

          if (currentUser.role !== 'admin') {
            router.push('/dashboard');
            return;
          }

          setIsValidating(false);
        } catch (error) {
          console.error('Error validando autenticación:', error);
          router.push('/login');
        }
      } else {
        // Tenemos user pero no es admin
        if (user.role !== 'admin') {
          router.push('/dashboard');
        } else {
          // Esto no debería pasar, pero por seguridad
          setIsValidating(false);
        }
      }
    };

    validateAuth();
  }, [pathname]); // Solo revalidar cuando cambia la ruta

  const isActive = (route: string) => pathname === route || pathname?.startsWith(route);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ff6b35] via-[#f7b801] to-[#00d9ff]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4"></div>
          <p className="text-white text-lg font-semibold">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff9e6]">
      <header className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-[#ff6b35]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-[#ff6b35] to-[#f7b801] rounded-lg p-2">
                <span className="text-2xl">👑</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#ff6b35]">Admin Panel</h1>
                <p className="text-xs text-gray-500">Sistema de administración</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm text-gray-600">Admin:</p>
                <p className="text-base font-bold text-[#2a1a5e]">{user?.nombre} {user?.apellido}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { logout(); router.push('/login'); }}>
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 py-3">
            <a href="/admin/dashboard" className={`text-sm font-medium pb-2 ${isActive('/admin/dashboard') ? 'text-[#ff6b35] border-b-2 border-[#ff6b35]' : 'text-gray-600 hover:text-[#ff6b35]'}`}>
              📊 Dashboard
            </a>
            <a href="/admin/usuarios" className={`text-sm font-medium pb-2 ${isActive('/admin/usuarios') ? 'text-[#ff6b35] border-b-2 border-[#ff6b35]' : 'text-gray-600 hover:text-[#ff6b35]'}`}>
              👥 Usuarios
            </a>
            <a href="/admin/clases" className={`text-sm font-medium pb-2 ${isActive('/admin/clases') ? 'text-[#ff6b35] border-b-2 border-[#ff6b35]' : 'text-gray-600 hover:text-[#ff6b35]'}`}>
              📚 Clases
            </a>
            <a href="/admin/productos" className={`text-sm font-medium pb-2 ${isActive('/admin/productos') ? 'text-[#ff6b35] border-b-2 border-[#ff6b35]' : 'text-gray-600 hover:text-[#ff6b35]'}`}>
              🛒 Productos
            </a>
            <a href="/admin/reportes" className={`text-sm font-medium pb-2 ${isActive('/admin/reportes') ? 'text-[#ff6b35] border-b-2 border-[#ff6b35]' : 'text-gray-600 hover:text-[#ff6b35]'}`}>
              📈 Reportes
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
