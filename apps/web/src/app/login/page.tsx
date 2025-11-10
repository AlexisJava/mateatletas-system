'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore, type UserRole } from '@/store/auth.store';
import ForcePasswordChangeOverlay from '@/components/auth/ForcePasswordChangeOverlay';
import { RoleSelectorModal } from '@/components/auth/RoleSelectorModal';
import {
  Terminal,
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  User,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

/**
 * Página de login unificada para tutores y estudiantes - ULTRA PREMIUM DESIGN
 * Matching con landing page design system
 * Ruta: /login
 */
export default function LoginPage() {
  const router = useRouter();
  const { login, loginEstudiante, isLoading, isAuthenticated, user, setSelectedRole, selectedRole } = useAuthStore();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [hasJustLoggedIn, setHasJustLoggedIn] = useState(false);
  const hasRedirectedRef = useRef(false);

  const hasMultipleRoles = useMemo(
    () => user?.roles && user.roles.length > 1,
    [user?.roles],
  );

  const mustChangePassword = useMemo(
    () => Boolean(user?.debe_cambiar_password && hasJustLoggedIn),
    [user?.debe_cambiar_password, hasJustLoggedIn],
  );

  // Redirigir si ya está autenticado y tiene rol seleccionado
  useEffect(() => {
    if (!isAuthenticated || !user || isLoading) {
      return;
    }

    // Si tiene múltiples roles y NO ha seleccionado uno, mostrar selector
    if (hasMultipleRoles && !selectedRole && hasJustLoggedIn) {
      setShowRoleSelector(true);
      setIsRedirecting(false);
      hasRedirectedRef.current = false;
      return;
    }

    // Si debe cambiar password, mostrar modal
    if (mustChangePassword) {
      setIsRedirecting(false);
      hasRedirectedRef.current = false;
      return;
    }

    // Si ya seleccionó rol (o tiene un solo rol), redirigir
    if (!hasRedirectedRef.current && (selectedRole || !hasMultipleRoles)) {
      hasRedirectedRef.current = true;
      setIsRedirecting(true);

      const activeRole = selectedRole || user.role;
      const redirectPath =
        activeRole === 'admin' ? '/admin/dashboard' :
        activeRole === 'docente' ? '/docente/dashboard' :
        activeRole === 'estudiante' ? '/estudiante/gimnasio' :
        '/dashboard';

      router.replace(redirectPath);
    }
  }, [isAuthenticated, user, router, isLoading, mustChangePassword, hasMultipleRoles, selectedRole, hasJustLoggedIn]);

  const [userType, setUserType] = useState<'tutor' | 'estudiante' | 'docente'>('estudiante');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  /**
   * Maneja el submit del formulario de login
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) {
      console.warn('Login already in progress');
      return;
    }

    setError('');
    setIsSubmitting(true);

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    if (!username || !password) {
      setError('Por favor completa todos los campos');
      setIsSubmitting(false);
      return;
    }

    try {
      setHasJustLoggedIn(true);

      if (userType === 'estudiante') {
        await loginEstudiante(username, password);
      } else {
        await login(username, password);
      }
    } catch (err) {
      setHasJustLoggedIn(false);

      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      let errorMessage = 'Error de conexión, intenta nuevamente';

      if (err && typeof err === 'object') {
        if ('response' in err && err.response && typeof err.response === 'object') {
          if ('status' in err.response && err.response.status === 401) {
            errorMessage = 'Email o contraseña incorrectos';
          } else if ('data' in err.response && err.response.data && typeof err.response.data === 'object') {
            if ('message' in err.response.data && typeof err.response.data.message === 'string') {
              errorMessage = err.response.data.message;
            }
          }
        } else if ('message' in err && typeof err.message === 'string') {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setShowRoleSelector(false);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  // Mostrar loading mientras redirige
  if (isRedirecting) {
    return (
      <div className="min-h-screen relative bg-black flex items-center justify-center overflow-hidden">
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-black to-[#0a0a0a]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0ea5e9]/20 rounded-full blur-[120px] animate-pulse" />
        </div>

        <div className="relative z-10 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block w-16 h-16 border-4 border-[#0ea5e9]/20 border-t-[#0ea5e9] rounded-full mb-6"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/90 text-lg font-bold uppercase tracking-wide"
          >
            Entrando al portal...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-black overflow-hidden">
      {/* Cosmos Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-black to-[#0a0a0a]" />

        {/* Animated orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#0ea5e9]/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#8b5cf6]/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#10b981]/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(14, 165, 233, 0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(14, 165, 233, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/40 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-4">
              <div className="relative">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] flex items-center justify-center shadow-lg shadow-[#0ea5e9]/50"
                >
                  <Terminal className="w-6 h-6 text-white" strokeWidth={2.5} />
                </motion.div>
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white">MATEATLETAS</h1>
                <p className="text-xs font-black uppercase tracking-widest text-[#0ea5e9]">
                  CLUB STEAM
                </p>
              </div>
            </Link>

            <Link
              href="/register"
              className="text-sm font-bold text-white/70 hover:text-white transition-colors"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="max-w-6xl w-full mx-auto py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Epic Message */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="hidden lg:block text-center lg:text-left space-y-6"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#0ea5e9]/20 to-[#10b981]/20 border border-[#0ea5e9]/30"
              >
                <Sparkles className="w-4 h-4 text-[#0ea5e9] animate-pulse" />
                <span className="text-xs font-black text-[#0ea5e9] uppercase tracking-widest">
                  Bienvenido de vuelta
                </span>
              </motion.div>

              <motion.h1
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                className="text-5xl md:text-6xl font-black tracking-tight leading-[1.1]"
              >
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] via-[#10b981] to-[#0ea5e9] animate-pulse drop-shadow-[0_0_30px_rgba(14,165,233,0.5)]">
                  CONTINÚA
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] via-[#0ea5e9] to-[#10b981] drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                  TU AVENTURA
                </span>
                <span className="block text-white mt-1 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  EN MATEATLETAS
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg md:text-xl font-bold text-white/70 uppercase tracking-wide"
              >
                Más de 500 familias confían en nosotros
              </motion.p>

              <div className="flex items-center justify-center lg:justify-start gap-2 pt-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ delay: 0.7 + i * 0.1, type: "spring", stiffness: 200 }}
                  >
                    <Sparkles className="w-5 h-5 text-[#0ea5e9]" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Side - Login Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/20 to-[#10b981]/20 blur-[80px] opacity-50" />

              {/* Login Card */}
              <div className="relative card-glass rounded-3xl border-2 border-white/10 overflow-hidden">
                {/* Top gradient line */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#0ea5e9]/90 to-transparent" />

                <div className="p-8 sm:p-10">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.6 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#0ea5e9]/20 to-[#10b981]/20 border border-[#0ea5e9]/30 mb-4"
                    >
                      <Sparkles className="w-4 h-4 text-[#0ea5e9] animate-pulse" />
                      <span className="text-xs font-black text-[#0ea5e9] uppercase tracking-widest">
                        Iniciar Sesión
                      </span>
                    </motion.div>

                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                      Acceder al portal
                    </h2>
                    <p className="text-white/60 text-sm">
                      Selecciona tu tipo de usuario y accede
                    </p>
                  </div>

                  {/* Toggle User Type */}
                  <div className="mb-6 grid grid-cols-3 gap-2 p-1 rounded-xl bg-black/50 border-2 border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setUserType('tutor');
                        setError('');
                      }}
                      className={`relative py-2.5 px-3 rounded-lg font-bold transition-all ${
                        userType === 'tutor'
                          ? 'bg-gradient-to-br from-[#0ea5e9]/40 to-[#10b981]/40 text-white shadow-lg shadow-[#0ea5e9]/30 border-2 border-[#0ea5e9]/50'
                          : 'text-white/50 hover:text-white/70 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <User className="w-4 h-4" strokeWidth={2.5} />
                        <span className="text-xs">Tutor</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserType('estudiante');
                        setError('');
                      }}
                      className={`relative py-2.5 px-3 rounded-lg font-bold transition-all ${
                        userType === 'estudiante'
                          ? 'bg-gradient-to-br from-[#0ea5e9]/40 to-[#10b981]/40 text-white shadow-lg shadow-[#0ea5e9]/30 border-2 border-[#0ea5e9]/50'
                          : 'text-white/50 hover:text-white/70 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <GraduationCap className="w-4 h-4" strokeWidth={2.5} />
                        <span className="text-xs">Estudiante</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserType('docente');
                        setError('');
                      }}
                      className={`relative py-2.5 px-3 rounded-lg font-bold transition-all ${
                        userType === 'docente'
                          ? 'bg-gradient-to-br from-[#0ea5e9]/40 to-[#10b981]/40 text-white shadow-lg shadow-[#0ea5e9]/30 border-2 border-[#0ea5e9]/50'
                          : 'text-white/50 hover:text-white/70 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <Terminal className="w-4 h-4" strokeWidth={2.5} />
                        <span className="text-xs">Docente</span>
                      </div>
                    </button>
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-xl"
                    >
                      <p className="text-red-400 text-sm flex items-center gap-2">
                        <span className="text-base">⚠️</span>
                        {error}
                      </p>
                    </motion.div>
                  )}

                  {/* Login Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Username */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-white/90">
                        Nombre de Usuario
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="w-5 h-5 text-[#0ea5e9]/60 group-focus-within:text-[#0ea5e9] transition-colors" />
                        </div>
                        <input
                          type="text"
                          value={username}
                          onChange={handleUsernameChange}
                          required
                          placeholder="usuario"
                          disabled={isLoading}
                          autoComplete="username"
                          className="w-full pl-12 pr-4 py-3 text-sm bg-black/50 border-2 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/60 focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-bold text-white/90">
                          Contraseña
                        </label>
                        <span className="text-xs text-white/40 hover:text-white/60 transition-colors cursor-pointer">
                          ¿Olvidaste tu contraseña?
                        </span>
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="w-5 h-5 text-[#0ea5e9]/60 group-focus-within:text-[#0ea5e9] transition-colors" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={handlePasswordChange}
                          required
                          placeholder="••••••••"
                          disabled={isLoading}
                          autoComplete="current-password"
                          className="w-full pl-12 pr-12 py-3 text-sm bg-black/50 border-2 border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0ea5e9]/60 focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-[#0ea5e9] transition-colors disabled:opacity-50"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center">
                      <input
                        id="remember"
                        type="checkbox"
                        disabled={isLoading}
                        className="w-4 h-4 rounded border-white/20 bg-black/50 text-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/30 focus:ring-offset-0 disabled:opacity-50"
                      />
                      <label htmlFor="remember" className="ml-2 text-sm text-white/70">
                        Mantener sesión iniciada
                      </label>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={isLoading || isSubmitting}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-6 py-3.5 bg-gradient-to-r from-[#0ea5e9] to-[#10b981] text-white font-bold rounded-xl hover:shadow-xl hover:shadow-[#0ea5e9]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                    >
                      {isLoading || isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          />
                          <span>Ingresando...</span>
                        </>
                      ) : (
                        <>
                          <span>Ingresar al Portal</span>
                          <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                        </>
                      )}
                    </motion.button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3 bg-black/50 text-white/50">¿Primera vez aquí?</span>
                    </div>
                  </div>

                  {/* Sign Up Link */}
                  <div className="text-center">
                    <p className="text-sm text-white/60">
                      ¿Aún no tienes cuenta?{' '}
                      <Link
                        href="/register"
                        className="text-[#0ea5e9] hover:text-[#0284c7] transition-colors font-bold"
                      >
                        Regístrate aquí
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal de selección de rol */}
      {showRoleSelector && user && user.roles && (
        <RoleSelectorModal
          roles={user.roles}
          onSelectRole={handleRoleSelect}
          userName={`${user.nombre} ${user.apellido}`}
        />
      )}

      {/* Modal de cambio de contraseña */}
      <ForcePasswordChangeOverlay
        onSuccess={() => {
          hasRedirectedRef.current = false;
          setHasJustLoggedIn(false);
        }}
      />
    </div>
  );
}
