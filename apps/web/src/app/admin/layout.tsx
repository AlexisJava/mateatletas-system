'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { ThemeProvider, useTheme } from '@/lib/theme/ThemeContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  ShoppingCart,
  BookOpenCheck,
  CreditCard,
  BarChart3,
  LogOut,
  Sun,
  Moon,
  Bell,
  Menu,
  X,
  Crown,
} from 'lucide-react';

/**
 * Portal Admin - Diseño Verde Esmeralda (Matching Landing Page)
 *
 * Características:
 * - Glassmorphism con verde esmeralda
 * - Fondo negro con gradientes verdes sutiles
 * - Sombras con glow verde
 * - Tipografía Nunito
 * - Modo oscuro con tema verde
 */

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/clases', label: 'Clases', icon: BookOpen },
  { href: '/admin/estudiantes', label: 'Estudiantes', icon: GraduationCap },
  { href: '/admin/productos', label: 'Productos', icon: ShoppingCart },
  { href: '/admin/cursos', label: 'Cursos', icon: BookOpenCheck },
  { href: '/admin/pagos', label: 'Pagos', icon: CreditCard },
  { href: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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

      // Si ya tenemos un usuario admin, validar y terminar
      if (user && user.role === 'admin') {
        setIsValidating(false);
        return;
      }

      // Si el usuario tiene otro rol, redirigir al dashboard apropiado
      if (user && user.role !== 'admin') {
        const redirectPath =
          user.role === 'docente' ? '/docente/dashboard' :
          user.role === 'estudiante' ? '/estudiante/dashboard' :
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

          if (currentUser.role !== 'admin') {
            const redirectPath =
              currentUser.role === 'docente' ? '/docente/dashboard' :
              currentUser.role === 'estudiante' ? '/estudiante/dashboard' :
              '/dashboard';
            router.replace(redirectPath);
            return;
          }

          // Usuario es admin, validación exitosa
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
    if (route === '/admin/dashboard') {
      return pathname === '/admin' || pathname === '/admin/dashboard';
    }
    return pathname?.startsWith(route);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen relative bg-black overflow-hidden">
        {/* Fondo base con tono verde esmeralda */}
        <div className="fixed inset-0 bg-gradient-to-br from-emerald-950/20 via-black to-emerald-950/10" />

        {/* Grid Pattern */}
        <div
          className="fixed inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(16, 185, 129, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(16, 185, 129, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10">
        {isValidating ? (
          <LoadingScreen />
        ) : (
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex md:flex-shrink-0">
              <div className="flex flex-col w-64 backdrop-blur-xl bg-emerald-500/[0.05] border-r border-emerald-500/20 shadow-xl shadow-emerald-500/10">
                {/* Logo */}
                <div className="flex items-center gap-3 h-16 px-6 border-b border-emerald-500/20">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-white">
                      Portal Admin
                    </h1>
                    <p className="text-[10px] text-emerald-400/70 font-medium">
                      Mateatletas
                    </p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
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
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/40'
                              : 'text-white/70 hover:bg-emerald-500/10 hover:text-emerald-400'
                          }
                        `}
                      >
                        <Icon className="w-[18px] h-[18px]" />
                        {item.label}
                      </a>
                    );
                  })}
                </nav>

                {/* User Section */}
                <div className="border-t border-emerald-500/20 p-4">
                  <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-emerald-500/10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/40">
                      {user?.nombre?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-white truncate">
                        {user?.nombre} {user?.apellido}
                      </p>
                      <p className="text-[11px] text-emerald-400/70 font-medium">
                        Administrador
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-[13px] font-semibold text-white/70 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200 border border-white/[0.08] hover:border-red-500/30"
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
              <header className="h-16 backdrop-blur-xl bg-black/50 border-b border-emerald-500/10 shadow-sm">
                <div className="h-full px-6 flex items-center justify-between">
                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden p-2 rounded-xl hover:bg-emerald-500/10 transition-colors"
                  >
                    <Menu className="w-5 h-5 text-emerald-400" />
                  </button>

                  {/* Page Title */}
                  <div className="hidden md:block">
                    <h2 className="text-base font-bold text-white">
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
              <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto p-6">
                  {children}
                </div>
              </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
                  onClick={() => setSidebarOpen(false)}
                />
                <div className="fixed inset-y-0 left-0 w-64 backdrop-blur-xl bg-emerald-500/[0.05] z-50 md:hidden border-r border-emerald-500/20 shadow-2xl shadow-emerald-500/20">
                  {/* Mobile Logo */}
                  <div className="flex items-center justify-between h-16 px-6 border-b border-emerald-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h1 className="text-sm font-bold text-white">
                          Portal Admin
                        </h1>
                        <p className="text-[10px] text-emerald-400/70 font-medium">
                          Mateatletas
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 rounded-xl hover:bg-emerald-500/10"
                    >
                      <X className="w-5 h-5 text-emerald-400" />
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
                            flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold rounded-xl transition-all
                            ${
                              isActive
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/40'
                                : 'text-white/70 hover:bg-emerald-500/10 hover:text-emerald-400'
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
      </div>
    </ThemeProvider>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Fondo base */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-black to-emerald-950/10" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(16, 185, 129, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(16, 185, 129, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative text-center backdrop-blur-xl bg-emerald-500/[0.05] p-12 rounded-3xl shadow-2xl shadow-emerald-500/20 border border-emerald-500/20">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mx-auto mb-6" />
        <p className="text-sm font-semibold text-white">Cargando Portal Admin...</p>
      </div>
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/20 hover:border-emerald-400/30 shadow-sm transition-all duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-[18px] h-[18px] text-amber-400" />
      ) : (
        <Moon className="w-[18px] h-[18px] text-emerald-400" />
      )}
    </button>
  );
}

function NotificationButton({ count }: { count: number }) {
  return (
    <button className="relative p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/20 hover:border-emerald-400/30 shadow-sm transition-all duration-200">
      <Bell className="w-[18px] h-[18px] text-emerald-400" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-orange-500 to-orange-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50">
          {count}
        </span>
      )}
    </button>
  );
}
