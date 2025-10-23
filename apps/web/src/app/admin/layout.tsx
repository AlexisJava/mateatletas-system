'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
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
  Bell,
  Menu,
  X,
  Crown,
  Zap,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Info,
  Key,
} from 'lucide-react';

/**
 * 🚀 MATEATLETAS OS - Layout Principal
 *
 * Sistema Operativo del Club con:
 * - Sidebar estilo macOS/Windows 11
 * - Fondo dinámico con gradientes
 * - Topbar con información viva
 * - Diseño moderno y colorido
 */

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'from-violet-500 to-purple-500', badge: null },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users, color: 'from-blue-500 to-cyan-500', badge: null },
  { href: '/admin/credenciales', label: 'Credenciales', icon: Key, color: 'from-amber-500 to-orange-500', badge: null },
  { href: '/admin/clases', label: 'Clases', icon: BookOpen, color: 'from-emerald-500 to-green-500', badge: '3' },
  { href: '/admin/estudiantes', label: 'Estudiantes', icon: GraduationCap, color: 'from-teal-500 to-cyan-500', badge: null },
  { href: '/admin/productos', label: 'Productos', icon: ShoppingCart, color: 'from-amber-500 to-yellow-500', badge: null },
  { href: '/admin/cursos', label: 'Cursos', icon: BookOpenCheck, color: 'from-indigo-500 to-purple-500', badge: '5' },
  { href: '/admin/pagos', label: 'Pagos', icon: CreditCard, color: 'from-green-500 to-emerald-500', badge: null },
  { href: '/admin/reportes', label: 'Reportes', icon: BarChart3, color: 'from-orange-500 to-red-500', badge: null },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, checkAuth } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
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
    <div className="h-screen relative overflow-hidden">

        {/* FONDO TIPO SISTEMA OPERATIVO */}
        {/* Gradiente base oscuro elegante */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black" />

        {/* Gradientes de colores dinámicos */}
        <div className="fixed inset-0 bg-gradient-to-tr from-violet-900/20 via-transparent to-blue-900/20" />
        <div className="fixed inset-0 bg-gradient-to-bl from-emerald-900/10 via-transparent to-transparent" />

        {/* Grid sutil de fondo */}
        <div
          className="fixed inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Orbes de luz flotantes */}
        <div className="fixed top-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse animation-delay-4000" />

        <div className="relative z-10 h-full">
        {isValidating ? (
          <LoadingScreen />
        ) : (
          <div className="flex h-full overflow-hidden">

            {/* SIDEBAR ESTILO macOS */}
            <aside className="hidden md:flex md:flex-shrink-0">
              <div className={`flex flex-col ${sidebarCollapsed ? 'w-20' : 'w-72'} backdrop-blur-2xl bg-white/5 border-r border-white/10 shadow-2xl transition-all duration-300`}>

                {/* Logo y Branding */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                  {!sidebarCollapsed ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-500 blur-lg opacity-50" />
                          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-violet-500/50">
                            <Crown className="w-7 h-7 text-white" strokeWidth={2.5} />
                          </div>
                        </div>
                        <div>
                          <h1 className="text-lg font-black bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent">
                            Mateatletas OS
                          </h1>
                          <p className="text-xs text-white/50 font-bold">Admin Portal</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSidebarCollapsed(true)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        title="Colapsar sidebar"
                      >
                        <ChevronLeft className="w-5 h-5 text-white/70" strokeWidth={2.5} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setSidebarCollapsed(false)}
                      className="mx-auto p-2 rounded-lg hover:bg-white/10 transition-colors"
                      title="Expandir sidebar"
                    >
                      <ChevronRight className="w-5 h-5 text-white/70" strokeWidth={2.5} />
                    </button>
                  )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActiveRoute(item.href);

                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        className={`
                          group relative flex items-center rounded-xl
                          transition-all duration-300
                          ${sidebarCollapsed ? 'justify-center px-2 py-3.5' : 'gap-4 px-4 py-3.5'}
                          ${
                            isActive
                              ? 'bg-white/10 shadow-lg'
                              : 'hover:bg-white/5'
                          }
                        `}
                      >
                        {/* Barra lateral de color cuando está activo - solo en modo expandido */}
                        {isActive && !sidebarCollapsed && (
                          <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b ${item.color} rounded-r-full`} />
                        )}

                        {/* Icono con gradiente */}
                        <div className="relative flex-shrink-0">
                          {isActive && (
                            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} blur-md opacity-50`} />
                          )}
                          <div className={`relative w-10 h-10 rounded-lg ${isActive ? `bg-gradient-to-br ${item.color}` : 'bg-white/5'} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                            <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                          </div>
                        </div>

                        {/* Label - Solo visible cuando no está colapsado */}
                        {!sidebarCollapsed && (
                          <>
                            <span className={`text-base font-bold ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'} transition-colors`}>
                              {item.label}
                            </span>

                            {/* Badge */}
                            {item.badge && (
                              <div className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                {item.badge}
                              </div>
                            )}
                          </>
                        )}

                        {/* Badge cuando está colapsado - solo un punto */}
                        {sidebarCollapsed && item.badge && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                      </a>
                    );
                  })}
                </nav>

                {/* User Section */}
                <div className="border-t border-white/10 p-4">
                  {!sidebarCollapsed ? (
                    <>
                      {/* User Info - Expandido */}
                      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5 backdrop-blur-sm">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 blur-md opacity-50" />
                          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/50">
                            {user?.nombre?.charAt(0).toUpperCase() || 'A'}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {user?.nombre} {user?.apellido}
                          </p>
                          <p className="text-xs text-white/50 font-medium">
                            Administrador
                          </p>
                        </div>
                        <Zap className="w-4 h-4 text-amber-400" />
                      </div>

                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white/70 hover:text-white bg-white/5 hover:bg-red-500/20 rounded-xl transition-all duration-200 border border-white/10 hover:border-red-500/50 group"
                      >
                        <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" strokeWidth={2.5} />
                        Cerrar sesión
                      </button>
                    </>
                  ) : (
                    <>
                      {/* User Info - Colapsado (solo avatar) */}
                      <div className="flex flex-col items-center gap-3 mb-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 blur-md opacity-50" />
                          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/50">
                            {user?.nombre?.charAt(0).toUpperCase() || 'A'}
                          </div>
                        </div>
                      </div>

                      {/* Logout Button - Colapsado (solo icono) */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center p-3 text-white/70 hover:text-white bg-white/5 hover:bg-red-500/20 rounded-xl transition-all duration-200 border border-white/10 hover:border-red-500/50 group"
                        title="Cerrar sesión"
                      >
                        <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" strokeWidth={2.5} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">

              {/* Top Bar estilo OS */}
              <header className="h-16 backdrop-blur-2xl bg-white/5 border-b border-white/10 shadow-lg">
                <div className="h-full px-6 flex items-center justify-between">

                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <Menu className="w-5 h-5 text-white" />
                  </button>

                  {/* Page Title */}
                  <div className="hidden md:flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                      {navItems.find((item) => isActiveRoute(item.href))?.icon && (
                        <>{(() => {
                          const ActiveIcon = navItems.find((item) => isActiveRoute(item.href))!.icon;
                          return <ActiveIcon className="w-5 h-5 text-white" strokeWidth={2.5} />;
                        })()}</>
                      )}
                    </div>
                    <h2 className="text-lg font-black text-white">
                      {navItems.find((item) => isActiveRoute(item.href))?.label || 'Dashboard'}
                    </h2>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <NotificationButton count={3} onClick={() => setNotificationsOpen(!notificationsOpen)} />
                  </div>
                </div>
              </header>

              {/* Page Content - CON SCROLL */}
              <main className="flex-1 overflow-y-auto relative">
                <div className="min-h-full w-full p-6">
                  {children}
                </div>

                {/* Panel de Notificaciones */}
                {notificationsOpen && (
                  <>
                    <div
                      className="fixed inset-0 bg-black/20 z-40"
                      onClick={() => setNotificationsOpen(false)}
                    />
                    <div className="fixed top-20 right-6 w-96 backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden">
                      <div className="p-5 border-b border-white/10">
                        <h3 className="text-lg font-black text-white">Notificaciones</h3>
                        <p className="text-xs text-white/50 mt-1">Tienes 3 notificaciones nuevas</p>
                      </div>

                      <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                        {/* Notificación 1 */}
                        <div className="p-4 border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                              <AlertCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white mb-1">3 clases sin docente</p>
                              <p className="text-xs text-white/60">Programadas para esta semana</p>
                              <p className="text-xs text-white/40 mt-1">Hace 5 minutos</p>
                            </div>
                          </div>
                        </div>

                        {/* Notificación 2 */}
                        <div className="p-4 border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white mb-1">15 nuevos estudiantes</p>
                              <p className="text-xs text-white/60">Registrados este mes</p>
                              <p className="text-xs text-white/40 mt-1">Hace 1 hora</p>
                            </div>
                          </div>
                        </div>

                        {/* Notificación 3 */}
                        <div className="p-4 hover:bg-white/5 transition-colors cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                              <Info className="w-5 h-5 text-white" strokeWidth={2.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white mb-1">Actualización disponible</p>
                              <p className="text-xs text-white/60">Nueva versión de Mateatletas OS</p>
                              <p className="text-xs text-white/40 mt-1">Hace 2 horas</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 border-t border-white/10">
                        <button className="w-full px-4 py-2 text-sm font-bold text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                          Ver todas las notificaciones
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
                  onClick={() => setSidebarOpen(false)}
                />
                <div className="fixed inset-y-0 left-0 w-72 backdrop-blur-2xl bg-white/5 z-50 md:hidden border-r border-white/10 shadow-2xl">
                  {/* Mobile Sidebar content (same as desktop) */}
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
                          <Crown className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h1 className="text-lg font-black text-white">Mateatletas OS</h1>
                          <p className="text-xs text-white/50">Admin Portal</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 rounded-xl hover:bg-white/10"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isActiveRoute(item.href);
                        return (
                          <a
                            key={item.href}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}
                          >
                            <div className={`w-10 h-10 rounded-lg ${isActive ? `bg-gradient-to-br ${item.color}` : 'bg-white/5'} flex items-center justify-center`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <span className={`text-base font-bold ${isActive ? 'text-white' : 'text-white/60'}`}>
                              {item.label}
                            </span>
                            {item.badge && (
                              <div className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {item.badge}
                              </div>
                            )}
                          </a>
                        );
                      })}
                    </nav>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black" />
      <div className="fixed top-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />

      <div className="relative text-center backdrop-blur-xl bg-white/5 p-12 rounded-3xl shadow-2xl border border-white/10">
        <div className="w-20 h-20 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto mb-6" />
        <p className="text-lg font-bold text-white">Cargando Mateatletas OS...</p>
        <p className="text-sm text-white/50 mt-2">Preparando tu centro de comando</p>
      </div>
    </div>
  );
}

function NotificationButton({ count, onClick }: { count: number; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative p-3 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-200 group"
    >
      <Bell className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" strokeWidth={2.5} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-red-500 to-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse">
          {count}
        </span>
      )}
    </button>
  );
}
