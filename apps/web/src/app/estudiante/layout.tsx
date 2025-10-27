'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { ThemeProvider } from '@/lib/theme/ThemeContext';
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  BarChart3,
  Calendar,
  LogOut,
  X,
  Rocket,
} from 'lucide-react';

/**
 * Portal Estudiante - Tema Oscuro Gamificado
 *
 * Características:
 * - Fondo oscuro slate-900 con gradientes purple
 * - Sidebar oscuro coherente con dashboard
 * - Efectos glow sutiles
 * - Diseño para niños
 */

const navItems = [
  { href: '/estudiante/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/estudiante/planificaciones', label: 'Planificación', icon: Calendar },
  { href: '/estudiante/cursos', label: 'Estudiar', icon: BookOpen },
  { href: '/estudiante/logros', label: 'Logros', icon: Trophy },
  { href: '/estudiante/ranking', label: 'Ranking', icon: BarChart3 },
];

export default function EstudianteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, checkAuth } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasValidatedRef = useRef(false);

  useEffect(() => {
    // Evitar múltiples validaciones usando ref
    if (hasValidatedRef.current) {
      return;
    }

    const validateAuth = async () => {
      hasValidatedRef.current = true;

      // Si ya tenemos un usuario estudiante, validar y terminar
      if (user && user.role === 'estudiante') {
        setIsValidating(false);
        return;
      }

      // Si el usuario tiene otro rol, redirigir al dashboard apropiado
      if (user && user.role !== 'estudiante') {
        const redirectPath =
          user.role === 'admin' ? '/admin/dashboard' :
          user.role === 'docente' ? '/docente/dashboard' :
          '/dashboard';
        router.replace(redirectPath);
        return;
      }

      // Si no hay usuario, intentar verificar autenticación con el backend
      if (!user) {
        try {
          await checkAuth();
          const currentUser = useAuthStore.getState().user;

          // Después de checkAuth, validar el rol
          if (!currentUser) {
            router.replace('/login');
            return;
          }

          if (currentUser.role !== 'estudiante') {
            const redirectPath =
              currentUser.role === 'admin' ? '/admin/dashboard' :
              currentUser.role === 'docente' ? '/docente/dashboard' :
              '/dashboard';
            router.replace(redirectPath);
            return;
          }

          // Usuario es estudiante, validación exitosa
          setIsValidating(false);
        } catch (error: unknown) {
          // Error al verificar auth, redirigir a login
          router.replace('/login');
        }
      }
    };

    validateAuth();
    // Solo ejecutar una vez al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActiveRoute = (route: string) => {
    if (route === '/estudiante/dashboard') {
      return pathname === '/estudiante' || pathname === '/estudiante/dashboard';
    }
    return pathname?.startsWith(route);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-950">
        {isValidating ? (
          <LoadingScreen />
        ) : (
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar Desktop - DARK SLATE */}
            <aside className="hidden md:flex md:flex-shrink-0">
              <div className="flex flex-col w-64 bg-slate-900 border-r border-slate-700/50 shadow-2xl">
                {/* Logo */}
                <div className="flex items-center gap-3 h-16 px-6 border-b border-slate-700/50">
                  <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-lg opacity-30" />
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <Rocket className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-white">
                      Portal Estudiante
                    </h1>
                    <p className="text-xs text-slate-400 font-medium">
                      Mateatletas
                    </p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActiveRoute(item.href);

                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        className={`
                          group flex items-center gap-3 px-4 py-3.5 text-base font-semibold rounded-xl
                          transition-all duration-200
                          ${
                            isActive
                              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }
                        `}
                      >
                        <Icon className="w-6 h-6" />
                        {item.label}
                      </a>
                    );
                  })}
                </nav>

                {/* User Section */}
                <div className="border-t border-slate-700/50 p-4">
                  <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-slate-800 border border-slate-700/50">
                    <div className="relative">
                      <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-md opacity-20" />
                      <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {user?.nombre?.charAt(0).toUpperCase() || 'E'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {user?.nombre} {user?.apellido}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        Estudiante
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-base font-semibold text-slate-300 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200 border border-transparent hover:border-red-500/30"
                  >
                    <LogOut className="w-6 h-6" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Page Content */}
              <main className="flex-1 overflow-y-auto p-6">
                {children}
              </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
                <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 z-50 md:hidden border-r border-slate-700/50 shadow-2xl">
                  {/* Mobile Logo */}
                  <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-lg opacity-30" />
                        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                          <Rocket className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div>
                        <h1 className="text-sm font-bold text-white">
                          Portal Estudiante
                        </h1>
                        <p className="text-xs text-slate-400 font-medium">
                          Mateatletas
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 rounded-xl hover:bg-slate-800"
                    >
                      <X className="w-5 h-5 text-slate-300" />
                    </button>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="px-3 py-4 space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = isActiveRoute(item.href);

                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`
                            flex items-center gap-3 px-4 py-3.5 text-base font-semibold rounded-xl
                            transition-all duration-200
                            ${
                              isActive
                                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }
                          `}
                        >
                          <Icon className="w-6 h-6" />
                          {item.label}
                        </a>
                      );
                    })}
                  </nav>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center bg-slate-900 p-12 rounded-3xl shadow-2xl border border-slate-700/50">
        <div className="w-16 h-16 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin mx-auto mb-6" />
        <p className="text-sm font-semibold text-white">Cargando Portal Estudiante...</p>
      </div>
    </div>
  );
}

