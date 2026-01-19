'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { gamificacionApi } from '@/lib/api/gamificacion.api';
import { useAccesoEstudiante } from '@/hooks/useAccesoEstudiante';
import { useCasaTheme } from '@/hooks/useCasaTheme';
import { LogOut, Home, Crown, Zap, Flame, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Portal Estudiante - Layout con Auth Guard y Header Candy
 *
 * Solo permite acceso a usuarios con rol "estudiante"
 * Redirige automáticamente según el rol del usuario
 */
export default function EstudianteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, checkAuth, logout } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);
  const [stats, setStats] = useState({ nivel: 1, xp: 0, racha: 0 });

  // Aplicar tema de casa dinámicamente
  useCasaTheme(user?.casa?.tipo);

  // Hook de acceso - solo se activa después de validar auth
  const {
    acceso,
    isLoading: isLoadingAcceso,
    error: accesoError,
    refetch: refetchAcceso,
  } = useAccesoEstudiante();

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

  // Cargar stats del estudiante
  useEffect(() => {
    async function fetchStats() {
      if (!user?.id) return;
      try {
        const recursos = await gamificacionApi.obtenerRecursos(user.id).catch(() => null);
        setStats({
          nivel: recursos?.nivel_actual ?? user.nivel_actual ?? 1,
          xp: recursos?.xp_actual ?? user.puntos_totales ?? 0,
          racha: recursos?.racha?.dias_consecutivos ?? 0,
        });
      } catch {
        setStats({
          nivel: user.nivel_actual ?? 1,
          xp: user.puntos_totales ?? 0,
          racha: 0,
        });
      }
    }
    fetchStats();
  }, [user?.id, user?.nivel_actual, user?.puntos_totales]);

  const handleLogout = async () => {
    await logout();
    router.push('/estudiante-login');
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, #f472b6 0%, #c026d3 50%, #7c3aed 100%)',
              boxShadow: '0 8px 32px rgba(192,38,211,0.5)',
            }}
          >
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-white/70 text-lg font-bold">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Verificando acceso a la plataforma
  if (isLoadingAcceso) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
              boxShadow: '0 8px 32px rgba(59,130,246,0.5)',
            }}
          >
            <RefreshCw className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-white/70 text-lg font-bold">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Error al verificar acceso
  if (accesoError) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #db2777 100%)',
              boxShadow: '0 8px 32px rgba(244,63,94,0.5)',
            }}
          >
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Error de conexión</h2>
          <p className="text-white/60 mb-6">{accesoError}</p>
          <button
            onClick={refetchAcceso}
            className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Sin acceso a la plataforma
  if (acceso && !acceso.puedeAcceder) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{
              background: 'linear-gradient(135deg, var(--color-xp) 0%, #f59e0b 50%, #d97706 100%)',
              boxShadow: '0 8px 32px rgba(251,191,36,0.5)',
            }}
          >
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Tu acceso ha finalizado</h2>
          <p className="text-white/60 mb-6 text-lg">{acceso.mensaje}</p>

          {/* Información adicional según el motivo */}
          <div
            className="p-4 rounded-xl mb-6"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <p className="text-white/50 text-sm">
              {acceso.motivo === 'SIN_ACCESO' && (
                <>
                  Para continuar aprendiendo, pedí a tu tutor que renueve tu suscripción o contactá
                  a soporte.
                </>
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleLogout}
              className="px-6 py-3 rounded-xl font-bold text-white/70 transition-all hover:text-white"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              Cerrar sesión
            </button>
            <a
              href="https://wa.me/5491112345678"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, var(--color-correct) 0%, #16a34a 100%)',
                boxShadow: '0 4px 16px rgba(34,197,94,0.4)',
              }}
            >
              Contactar soporte
            </a>
          </div>
        </div>
      </div>
    );
  }

  const isHomePage = pathname === '/estudiante';

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Header Candy - solo mostrar si NO estamos en home */}
      {!isHomePage && (
        <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
          <div className="max-w-6xl mx-auto">
            <div
              className="flex items-center justify-between gap-4 px-5 py-3 rounded-2xl"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              {/* Left side - Logo + Avatar */}
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Home button */}
                <Link
                  href="/estudiante"
                  className="p-2.5 rounded-xl transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #374151 0%, #1f2937 50%, #111827 100%)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                  title="Inicio"
                >
                  <Home className="w-5 h-5 text-white" />
                </Link>

                {/* Logo */}
                <Link href="/estudiante" className="flex items-center gap-2.5 group">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #f472b6 0%, #c026d3 50%, #7c3aed 100%)',
                      boxShadow:
                        '0 4px 20px rgba(192,38,211,0.5), inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.2)',
                    }}
                  >
                    <span className="text-xl font-black text-white">M</span>
                  </div>
                </Link>

                {/* Casa badge - usa variables CSS dinámicas */}
                {user?.casa && (
                  <div
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{
                      background: 'var(--casa-gradient)',
                      boxShadow: `0 2px 10px var(--casa-glow), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.1)`,
                    }}
                  >
                    <span className="text-white">{user.casa.nombre}</span>
                  </div>
                )}

                {/* Avatar */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-black text-white"
                      style={{
                        background:
                          'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
                        boxShadow:
                          '0 4px 16px rgba(59,130,246,0.4), inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.2)',
                      }}
                    >
                      {user?.nombre?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    {/* Badge de nivel */}
                    <div
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black text-white"
                      style={{
                        background: 'linear-gradient(135deg, var(--color-xp) 0%, #f59e0b 100%)',
                        boxShadow: '0 2px 8px rgba(251,191,36,0.5)',
                      }}
                    >
                      {stats.nivel}
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <h1 className="text-base font-bold text-white flex items-center gap-1.5">
                      {user?.nombre}
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                    </h1>
                    <p className="text-white/50 text-xs font-medium">Exploremos juntos</p>
                  </div>
                </div>
              </div>

              {/* Right side - Stats Pills */}
              <div className="flex items-center gap-2">
                <CandyPill
                  icon={<Crown className="w-4 h-4" />}
                  value={stats.nivel}
                  colors={['var(--color-xp)', '#f59e0b', '#d97706']}
                />
                <CandyPill
                  icon={<Zap className="w-4 h-4" />}
                  value={stats.xp}
                  colors={['#a855f7', '#7c3aed', '#6366f1']}
                />
                <CandyPill
                  icon={<Flame className="w-4 h-4" />}
                  value={`${Math.max(stats.racha, 1)}d`}
                  colors={['#f43f5e', '#ec4899', '#db2777']}
                />

                <button
                  onClick={handleLogout}
                  className="ml-1 p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-white/50 hover:text-rose-400 transition-all"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main content - con padding solo si hay header */}
      <main className={isHomePage ? '' : 'pt-24'}>{children}</main>
    </div>
  );
}

// ============================================================================
// COMPONENTE CANDY PILL
// ============================================================================

interface CandyPillProps {
  icon: React.ReactNode;
  value: number | string;
  colors: [string, string, string];
}

function CandyPill({ icon, value, colors }: CandyPillProps) {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-bold"
      style={{
        background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`,
        boxShadow: `0 4px 16px ${colors[0]}60, inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.15)`,
      }}
    >
      {icon}
      <span>{value}</span>
    </div>
  );
}
