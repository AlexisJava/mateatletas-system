'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { LogOut, User, Home } from 'lucide-react';

/**
 * Portal Estudiante - Layout con Auth Guard y Header
 *
 * Solo permite acceso a usuarios con rol "estudiante"
 * Redirige automáticamente según el rol del usuario
 */
export default function EstudianteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, checkAuth, logout } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateAuth = async () => {
      // Usuario estudiante válido
      if (user && user.role === 'estudiante') {
        setIsValidating(false);
        return;
      }

      // Usuario con otro rol → redirigir
      if (user && user.role !== 'estudiante') {
        const redirectPath =
          user.role === 'admin'
            ? '/admin/dashboard'
            : user.role === 'docente'
              ? '/docente/dashboard'
              : '/dashboard';
        router.replace(redirectPath);
        return;
      }

      // Sin usuario → verificar auth
      if (!user) {
        try {
          await checkAuth();
          const currentUser = useAuthStore.getState().user;

          if (!currentUser) {
            router.replace('/estudiante-login');
            return;
          }

          if (currentUser.role !== 'estudiante') {
            const redirectPath =
              currentUser.role === 'admin'
                ? '/admin/dashboard'
                : currentUser.role === 'docente'
                  ? '/docente/dashboard'
                  : '/dashboard';
            router.replace(redirectPath);
            return;
          }

          setIsValidating(false);
        } catch {
          router.replace('/estudiante-login');
        }
      }
    };

    validateAuth();
  }, [user, checkAuth, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/estudiante-login');
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  const isHomePage = pathname === '/estudiante';

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a1a]/80 backdrop-blur-lg border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-3">
            {!isHomePage && (
              <Link
                href="/estudiante"
                className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors text-slate-400 hover:text-white"
                title="Inicio"
              >
                <Home className="w-5 h-5" />
              </Link>
            )}
            <Link href="/estudiante" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <span className="text-sm font-bold">M</span>
              </div>
              <span className="font-bold text-white hidden sm:inline">Mateatletas</span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 text-sm">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">{user.nombre}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors text-slate-400 hover:text-red-400"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content with padding for header */}
      <main className="pt-14">{children}</main>
    </div>
  );
}
