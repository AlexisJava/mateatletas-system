'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { ThemeProvider, useTheme } from '@/lib/theme/ThemeContext';
import { ToastProvider } from '@/components/ui/Toast';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  LogOut,
  Sun,
  Moon,
  Bell,
  Menu,
  X,
} from 'lucide-react';

/**
 * Portal Docente - Diseño Elegante y Moderno
 *
 * Características:
 * - Glassmorphism sutil y elegante
 * - Gradientes suaves de fondo
 * - Sombras con profundidad
 * - Tipografía Inter premium
 * - Sin animaciones exageradas
 * - Modo oscuro funcional
 */

const navItems = [
  { href: '/docente/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/docente/calendario', label: 'Calendario', icon: Calendar },
  { href: '/docente/observaciones', label: 'Observaciones', icon: FileText },
];

export default function DocenteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, checkAuth, selectedRole } = useAuthStore();
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

      // Usar selectedRole si existe, sino user.role
      const activeRole = selectedRole || user?.role;

      // Si ya tenemos un usuario docente (por rol activo o selectedRole), validar y terminar
      if (user && activeRole === 'docente') {
        setIsValidating(false);
        return;
      }

      // Si el usuario tiene otro rol ACTIVO, redirigir al dashboard apropiado
      if (user && activeRole && activeRole !== 'docente') {
        const redirectPath =
          activeRole === 'admin' ? '/admin/dashboard' :
          activeRole === 'estudiante' ? '/estudiante/gimnasio' :
          '/dashboard';
        router.replace(redirectPath);
        return;
      }

      // Si no hay usuario, intentar verificar autenticación con el backend
      if (!user) {
        try {
          await checkAuth();
          const currentUser = useAuthStore.getState().user;
          const currentSelectedRole = useAuthStore.getState().selectedRole;

          // Después de checkAuth, validar el rol
          if (!currentUser) {
            router.replace('/login');
            return;
          }

          const currentActiveRole = currentSelectedRole || currentUser.role;

          if (currentActiveRole !== 'docente') {
            const redirectPath =
              currentActiveRole === 'admin' ? '/admin/dashboard' :
              currentActiveRole === 'estudiante' ? '/estudiante/gimnasio' :
              '/dashboard';
            router.replace(redirectPath);
            return;
          }

          // Usuario es docente (por rol activo), validación exitosa
          setIsValidating(false);
        } catch (error) {
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
    if (route === '/docente/dashboard') {
      return pathname === '/docente' || pathname === '/docente/dashboard';
    }
    return pathname?.startsWith(route);
  };

  return (
    <ThemeProvider>
      <ToastProvider />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/60 to-pink-50/50 dark:from-[#0f0a1f] dark:via-indigo-950 dark:to-indigo-900 transition-colors duration-300">
        {isValidating ? (
          <LoadingScreen />
        ) : (
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex md:flex-shrink-0">
              <div className="flex flex-col w-64 backdrop-blur-xl bg-white/65 dark:bg-indigo-950/60 border-r border-purple-200/30 dark:border-purple-700/30 shadow-xl shadow-purple-200/20 dark:shadow-purple-900/30">
                {/* Logo */}
                <div className="flex items-center gap-3 h-16 px-6 border-b border-purple-200/30 dark:border-purple-700/30">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/40">
                    <span className="text-xl">📚</span>
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-indigo-900 dark:text-white">
                      Portal Docente
                    </h1>
                    <p className="text-[10px] text-purple-600 dark:text-purple-300 font-medium">
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
                          group flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold rounded-xl
                          transition-all duration-200
                          ${
                            isActive
                              ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/40'
                              : 'text-indigo-900 dark:text-purple-100 hover:bg-purple-100/60 dark:hover:bg-purple-900/40'
                          }
                        `}
                      >
                        <Icon className={`w-[18px] h-[18px] ${isActive ? '' : 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`} />
                        {item.label}
                      </a>
                    );
                  })}
                </nav>

                {/* User Section */}
                <div className="border-t border-purple-200/30 dark:border-purple-700/30 p-4">
                  <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-purple-100/50 dark:bg-purple-900/30">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/40">
                      {user?.nombre?.charAt(0).toUpperCase() || 'D'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-indigo-900 dark:text-white truncate">
                        {user?.nombre} {user?.apellido}
                      </p>
                      <p className="text-[11px] text-purple-600 dark:text-purple-300 font-medium">
                        Docente
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-[13px] font-semibold text-indigo-900 dark:text-purple-200 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-200"
                  >
                    <LogOut className="w-[18px] h-[18px]" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Top Bar */}
              <header className="h-16 backdrop-blur-xl bg-white/50 dark:bg-indigo-950/40 border-b border-purple-200/30 dark:border-purple-700/30 shadow-sm">
                <div className="h-full px-6 flex items-center justify-between">
                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden p-2 rounded-xl hover:bg-purple-100/60 dark:hover:bg-purple-900/40 transition-colors"
                  >
                    <Menu className="w-5 h-5 text-indigo-900 dark:text-purple-200" />
                  </button>

                  {/* Page Title */}
                  <div className="hidden md:block">
                    <h2 className="text-base font-bold text-indigo-900 dark:text-white">
                      {navItems.find((item) => isActiveRoute(item.href))?.label || 'Dashboard'}
                    </h2>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <NotificationButton count={0} />
                  </div>
                </div>
              </header>

              {/* Page Content */}
              <main className="flex-1 relative overflow-hidden">
                {/* BLOBS ANIMADOS DE FONDO - MEGA BRUTAL */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div
                    className="absolute top-0 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob"
                    style={{
                      animation: 'blob 20s infinite ease-in-out',
                    }}
                  />
                  <div
                    className="absolute top-40 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl animate-blob"
                    style={{
                      animation: 'blob 25s infinite ease-in-out 5s',
                    }}
                  />
                  <div
                    className="absolute bottom-20 left-1/3 w-[400px] h-[400px] bg-pink-500/15 rounded-full blur-3xl animate-blob"
                    style={{
                      animation: 'blob 18s infinite ease-in-out 2s',
                    }}
                  />
                  <div
                    className="absolute -bottom-40 -right-20 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl animate-blob"
                    style={{
                      animation: 'blob 22s infinite ease-in-out 7s',
                    }}
                  />
                </div>

                <div className="h-full w-full px-8 py-6 relative z-10 overflow-y-auto">
                  {children}
                </div>
              </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <>
                <div
                  className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
                  onClick={() => setSidebarOpen(false)}
                />
                <div className="fixed inset-y-0 left-0 w-64 backdrop-blur-xl bg-white/85 dark:bg-indigo-950/85 z-50 md:hidden border-r border-purple-200/30 dark:border-purple-700/30 shadow-2xl shadow-purple-900/40">
                  {/* Mobile Logo */}
                  <div className="flex items-center justify-between h-16 px-6 border-b border-purple-200/30 dark:border-purple-700/30">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/40">
                        <span className="text-xl">📚</span>
                      </div>
                      <div>
                        <h1 className="text-sm font-bold text-indigo-900 dark:text-white">
                          Portal Docente
                        </h1>
                        <p className="text-[10px] text-purple-600 dark:text-purple-300 font-medium">
                          Mateatletas
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 rounded-xl hover:bg-purple-100/60 dark:hover:bg-purple-900/40"
                    >
                      <X className="w-5 h-5 text-indigo-900 dark:text-purple-200" />
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
                            flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold rounded-xl
                            ${
                              isActive
                                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/40'
                                : 'text-indigo-900 dark:text-purple-100 hover:bg-purple-100/60 dark:hover:bg-purple-900/40'
                            }
                          `}
                        >
                          <Icon className="w-[18px] h-[18px]" />
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50/60 to-pink-50/50 dark:from-[#0f0a1f] dark:via-indigo-950 dark:to-indigo-900">
      <div className="text-center backdrop-blur-xl bg-white/65 dark:bg-indigo-950/60 p-12 rounded-3xl shadow-2xl shadow-purple-200/20 dark:shadow-purple-900/30 border border-purple-200/30 dark:border-purple-700/30">
        <div className="w-16 h-16 border-4 border-purple-100 dark:border-purple-900/50 border-t-purple-600 rounded-full animate-spin mx-auto mb-6" />
        <p className="text-sm font-semibold text-indigo-900 dark:text-purple-100">Cargando Portal Docente...</p>
      </div>
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-purple-100/60 dark:bg-purple-900/40 hover:bg-purple-200/70 dark:hover:bg-purple-800/50 backdrop-blur-sm border border-purple-300/40 dark:border-purple-600/40 shadow-sm transition-all duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-[18px] h-[18px] text-amber-400" />
      ) : (
        <Moon className="w-[18px] h-[18px] text-purple-700" />
      )}
    </button>
  );
}

function NotificationButton({ count }: { count: number }) {
  return (
    <button className="relative p-2.5 rounded-xl bg-purple-100/60 dark:bg-purple-900/40 hover:bg-purple-200/70 dark:hover:bg-purple-800/50 backdrop-blur-sm border border-purple-300/40 dark:border-purple-600/40 shadow-sm transition-all duration-200">
      <Bell className="w-[18px] h-[18px] text-indigo-900 dark:text-purple-200" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-pink-500 to-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-pink-500/50">
          {count}
        </span>
      )}
    </button>
  );
}
