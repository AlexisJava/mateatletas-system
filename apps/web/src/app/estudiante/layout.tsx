'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
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
  Menu,
  ChevronLeft,
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-300 to-cyan-300">
        {isValidating ? (
          <LoadingScreen />
        ) : (
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar Desktop - CRASH BANDICOOT THEME - COLAPSABLE */}
            <aside className="hidden md:flex md:flex-shrink-0">
              <div className={`flex flex-col ${sidebarCollapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-orange-500 via-yellow-500 to-orange-500 border-r-4 border-yellow-400 shadow-2xl transition-all duration-300`}>
                {/* Logo + Toggle Button */}
                <div className="flex items-center justify-between h-16 px-4 border-b-4 border-yellow-400">
                  {!sidebarCollapsed && (
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-white rounded-xl blur-md opacity-40" />
                        <div className="relative w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg border-2 border-orange-600">
                          <Rocket className="w-5 h-5 text-orange-600" />
                        </div>
                      </div>
                      <div>
                        <h1 className="text-sm font-black text-white drop-shadow-lg">
                          Portal Estudiante
                        </h1>
                        <p className="text-xs text-orange-100 font-bold drop-shadow">
                          Mateatletas
                        </p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className={`p-2 rounded-xl hover:bg-white/20 text-white hover:text-white transition-all border-2 border-transparent hover:border-white/50 ${sidebarCollapsed ? 'mx-auto' : ''}`}
                    title={sidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
                  >
                    {sidebarCollapsed ? (
                      <Menu className="w-5 h-5" />
                    ) : (
                      <ChevronLeft className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActiveRoute(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`
                          group flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3.5 text-base font-black rounded-2xl
                          transition-all duration-200 border-2
                          ${
                            isActive
                              ? 'bg-white text-orange-600 shadow-lg border-orange-600'
                              : 'text-white hover:bg-white/20 border-transparent hover:border-white/50 hover:scale-105'
                          }
                        `}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <Icon className="w-6 h-6" />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </Link>
                    );
                  })}
                </nav>

                {/* User Section */}
                <div className="border-t-4 border-yellow-400 p-4">
                  {!sidebarCollapsed && (
                    <div className="flex items-center gap-3 mb-3 p-3 rounded-2xl bg-white border-2 border-orange-600 shadow-lg">
                      <div className="relative">
                        <div className="absolute inset-0 bg-orange-500 rounded-xl blur-md opacity-20" />
                        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white font-black text-sm shadow-lg border-2 border-white">
                          {user?.nombre?.charAt(0).toUpperCase() || 'E'}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-orange-700 truncate">
                          {user?.nombre} {user?.apellido}
                        </p>
                        <p className="text-xs text-orange-600 font-bold">
                          Estudiante
                        </p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-center gap-2'} px-4 py-3.5 text-base font-black text-white hover:bg-red-500 rounded-2xl transition-all duration-200 border-2 border-white hover:border-red-300 hover:scale-105`}
                    title={sidebarCollapsed ? 'Cerrar sesión' : undefined}
                  >
                    <LogOut className="w-6 h-6" />
                    {!sidebarCollapsed && <span>Cerrar sesión</span>}
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
                <div className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-orange-500 via-yellow-500 to-orange-500 z-50 md:hidden border-r-4 border-yellow-400 shadow-2xl">
                  {/* Mobile Logo */}
                  <div className="flex items-center justify-between h-16 px-6 border-b-4 border-yellow-400">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-white rounded-xl blur-md opacity-40" />
                        <div className="relative w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg border-2 border-orange-600">
                          <Rocket className="w-5 h-5 text-orange-600" />
                        </div>
                      </div>
                      <div>
                        <h1 className="text-sm font-black text-white drop-shadow-lg">
                          Portal Estudiante
                        </h1>
                        <p className="text-xs text-orange-100 font-bold drop-shadow">
                          Mateatletas
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 rounded-xl hover:bg-white/20 border-2 border-transparent hover:border-white/50"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="px-3 py-4 space-y-2">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = isActiveRoute(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`
                            flex items-center gap-3 px-4 py-3.5 text-base font-black rounded-2xl
                            transition-all duration-200 border-2
                            ${
                              isActive
                                ? 'bg-white text-orange-600 shadow-lg border-orange-600'
                                : 'text-white hover:bg-white/20 border-transparent hover:border-white/50 hover:scale-105'
                            }
                          `}
                        >
                          <Icon className="w-6 h-6" />
                          {item.label}
                        </Link>
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-400 via-blue-300 to-cyan-300">
      <div className="text-center bg-white p-12 rounded-3xl shadow-2xl border-4 border-orange-500">
        <div className="w-16 h-16 border-4 border-yellow-400 border-t-orange-500 rounded-full animate-spin mx-auto mb-6" />
        <p className="text-sm font-black text-orange-600">Cargando Portal Estudiante...</p>
      </div>
    </div>
  );
}
