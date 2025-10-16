'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { ThemeProvider, useTheme } from '@/lib/theme/ThemeContext';
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  BarChart3,
  User,
  LogOut,
  Sun,
  Moon,
  Bell,
  Menu,
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

  useEffect(() => {
    const validateAuth = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth-token');
        if (!token) {
          router.push('/login');
          return;
        }
      }

      if (user && user.role === 'estudiante') {
        setIsValidating(false);
        return;
      }

      if (user && user.role !== 'estudiante') {
        router.push('/dashboard');
        return;
      }

      if (!user) {
        try {
          await checkAuth();
          const currentUser = useAuthStore.getState().user;
          if (currentUser && currentUser.role !== 'estudiante') {
            router.push('/dashboard');
            return;
          }
          setIsValidating(false);
        } catch (error) {
          router.push('/login');
        }
      }
    };

    validateAuth();
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {isValidating ? (
          <LoadingScreen />
        ) : (
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar Desktop - DARK PURPLE */}
            <aside className="hidden md:flex md:flex-shrink-0">
              <div className="flex flex-col w-64 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-purple-500/20 shadow-2xl">
                {/* Logo */}
                <div className="flex items-center gap-3 h-16 px-6 border-b border-purple-500/20">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500 rounded-xl blur-lg opacity-50" />
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                      <Rocket className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-white">
                      Portal Estudiante
                    </h1>
                    <p className="text-xs text-purple-300 font-medium">
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
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                              : 'text-gray-300 hover:bg-purple-500/10 hover:text-white'
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
                <div className="border-t border-purple-500/20 p-4">
                  <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <div className="relative">
                      <div className="absolute inset-0 bg-purple-500 rounded-xl blur-md opacity-40" />
                      <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {user?.nombre?.charAt(0).toUpperCase() || 'E'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {user?.nombre} {user?.apellido}
                      </p>
                      <p className="text-xs text-purple-300 font-medium">
                        Estudiante
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-base font-semibold text-gray-300 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200 border border-transparent hover:border-red-500/30"
                  >
                    <LogOut className="w-6 h-6" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Page Content - Sin header, sin padding, el dashboard maneja su propio layout */}
              <main className="flex-1 overflow-y-auto">
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
                <div className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-slate-800 to-slate-900 z-50 md:hidden border-r border-purple-500/20 shadow-2xl">
                  {/* Mobile Logo */}
                  <div className="flex items-center justify-between h-16 px-6 border-b border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-purple-500 rounded-xl blur-lg opacity-50" />
                        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                          <Rocket className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div>
                        <h1 className="text-sm font-bold text-white">
                          Portal Estudiante
                        </h1>
                        <p className="text-xs text-purple-300 font-medium">
                          Mateatletas
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 rounded-xl hover:bg-purple-500/10"
                    >
                      <X className="w-5 h-5 text-gray-300" />
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
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                                : 'text-gray-300 hover:bg-purple-500/10 hover:text-white'
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center bg-gradient-to-br from-slate-800 to-slate-900 p-12 rounded-3xl shadow-2xl border border-purple-500/20">
        <div className="w-16 h-16 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin mx-auto mb-6" />
        <p className="text-sm font-semibold text-white">Cargando Portal Estudiante...</p>
      </div>
    </div>
  );
}

function NotificationButton({ count }: { count: number }) {
  return (
    <button className="relative p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200">
      <Bell className="w-5 h-5 text-gray-300" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-pink-500 to-rose-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-pink-500/50">
          {count}
        </span>
      )}
    </button>
  );
}
