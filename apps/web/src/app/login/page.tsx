'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import ForcePasswordChangeOverlay from '@/components/auth/ForcePasswordChangeOverlay';
import { RoleSelectorModal } from '@/components/auth/RoleSelectorModal';
import {
  Terminal,
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  Sparkles,
  User,
  GraduationCap,
} from 'lucide-react';

// Magnetic Button Component
function MagneticButton({
  children,
  className = '',
  href,
  type = 'button',
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: () => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const button = (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={className}
      style={{ x: xSpring, y: ySpring }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );

  return href ? <Link href={href}>{button}</Link> : button;
}

// Floating Particle Component
function FloatingParticle({ delay = 0, left = 50 }: { delay?: number; left?: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // En SSR, renderizar una partícula invisible en posición fija
    return (
      <div
        className="absolute w-1 h-1 bg-orange-400 rounded-full blur-[1px] opacity-0"
        style={{ left: `${left}%`, bottom: 0 }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{
        opacity: [0, 0.6, 0],
        y: [-20, -100],
        x: [0, Math.random() * 40 - 20],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay,
        ease: 'easeOut',
      }}
      className="absolute w-1 h-1 bg-orange-400 rounded-full blur-[1px]"
      style={{
        left: `${left}%`,
        bottom: 0,
      }}
    />
  );
}

/**
 * Página de login unificada para tutores y estudiantes - EVOLVED DESIGN
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
  }, [isAuthenticated, user, router, isLoading, mustChangePassword, hasMultipleRoles, selectedRole]);

  const [userType, setUserType] = useState<'tutor' | 'estudiante'>('tutor');
  const [email, setEmail] = useState('');
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
   * Previene doble submit y race conditions
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevenir doble submit
    if (isSubmitting) {
      console.warn('Login already in progress');
      return;
    }

    setError('');
    setIsSubmitting(true);

    // Cancelar request anterior si existe
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    // Validación básica
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      setIsSubmitting(false);
      return;
    }

    try {
      // IMPORTANTE: Marcar que el usuario está haciendo login ANTES del await
      // para que cuando el login termine y el useEffect se ejecute, ya tenga el flag en true
      setHasJustLoggedIn(true);

      // Usar método de login según el tipo de usuario seleccionado
      if (userType === 'estudiante') {
        await loginEstudiante(email, password);
      } else {
        await login(email, password);
      }
    } catch (err: unknown) {
      // Si hay error, resetear el flag
      setHasJustLoggedIn(false);

      // Ignorar errores de abort
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      // Determinar mensaje de error según el tipo
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

  /**
   * Maneja la selección de rol cuando el usuario tiene múltiples roles
   */
  const handleRoleSelect = (role: 'admin' | 'docente') => {
    setSelectedRole(role);
    setShowRoleSelector(false);
    // No resetear hasJustLoggedIn aquí, el useEffect se encarga de la redirección
  };

  /**
   * Limpia el error cuando el usuario empieza a escribir
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
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
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/30 via-black to-yellow-950/20" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(249, 115, 22, 0.4) 1.5px, transparent 1.5px),
                            linear-gradient(90deg, rgba(249, 115, 22, 0.4) 1.5px, transparent 1.5px)`,
            backgroundSize: '64px 64px',
          }}
        />

        {/* Loading content */}
        <div className="relative z-10 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block w-16 h-16 border-4 border-orange-500/20 border-t-orange-400 rounded-full mb-6"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/90 text-lg font-bold uppercase tracking-wide"
          >
            Entrando a la arena...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-black overflow-hidden">
      {/* Animated Background - Brawl Stars Style */}
      <div className="fixed inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/30 via-black to-yellow-950/20" />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(249, 115, 22, 0.4) 1.5px, transparent 1.5px),
                            linear-gradient(90deg, rgba(249, 115, 22, 0.4) 1.5px, transparent 1.5px)`,
            backgroundSize: '64px 64px',
          }}
        />

        {/* Radial gradient spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/15 rounded-full blur-[120px] animate-pulse" />

        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.3} left={5 + i * 6} />
        ))}
      </div>

      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-orange-400/10 bg-black/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-center h-20">
            <div className="flex items-center gap-4">
              <div className="relative">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-orange-500/50"
                >
                  <Terminal className="w-7 h-7 text-white" strokeWidth={2.5} />
                </motion.div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">MATEATLETAS</h1>
                <p className="text-sm font-black uppercase tracking-widest">
                  <span className="text-white">CLUB </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-yellow-300 to-orange-300 drop-shadow-[0_0_10px_rgba(251,146,60,0.6)]">
                    STEAM
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Split 50/50 */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center max-h-[calc(100vh-8rem)] sm:max-h-[calc(100vh-10rem)] overflow-y-auto">
            {/* Epic Message - LEFT SIDE - HIDDEN ON MOBILE */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="hidden lg:block text-center lg:text-left space-y-4"
            >
              {/* Badge */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-orange-500/30 to-yellow-500/30 border-2 border-orange-400/60 shadow-lg shadow-orange-500/40"
              >
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                <span className="text-xs font-black text-orange-300 uppercase tracking-widest">
                  Nueva Era
                </span>
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              </motion.div>

              {/* Main Title */}
              <motion.h1
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]"
              >
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-yellow-300 to-orange-300 animate-pulse drop-shadow-[0_0_30px_rgba(251,146,60,0.5)]">
                  ¡COMIENZA
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]">
                  UNA NUEVA ERA
                </span>
                <span className="block text-white mt-1 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  EN MATEATLETAS
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg md:text-xl font-bold text-orange-300/90 uppercase tracking-wide"
              >
                Prepárate para la batalla matemática
              </motion.p>

              {/* Decorative Stars */}
              <div className="flex items-center justify-center lg:justify-start gap-2 pt-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ delay: 0.7 + i * 0.1, type: "spring", stiffness: 200 }}
                  >
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Login Form - RIGHT SIDE */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              {/* Glow effect behind card */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-yellow-500/30 blur-[60px] opacity-40" />

              {/* Login Card */}
              <div className="relative bg-gradient-to-br from-zinc-900/95 via-zinc-900/80 to-zinc-900/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border-2 border-orange-400/40 shadow-2xl shadow-orange-500/40 overflow-hidden">
                {/* Card header glow */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-300/90 to-transparent" />

                <div className="p-4 sm:p-5 lg:p-6">
                  {/* Title */}
                  <div className="mb-3 sm:mb-4 space-y-1 text-center">
                    <h2 className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-orange-300 to-yellow-300 text-transparent bg-clip-text drop-shadow-[0_0_20px_rgba(251,146,60,0.4)]">
                      ENTRAR A LA ARENA
                    </h2>
                    <p className="text-white/70 text-[10px] sm:text-xs">Selecciona tu tipo de usuario y accede</p>
                  </div>

                  {/* Toggle Tutor/Estudiante - Brawl Style */}
                  <div className="mb-3 sm:mb-4 grid grid-cols-2 gap-1.5 sm:gap-2 p-1 rounded-xl sm:rounded-2xl bg-black/50 border-2 border-orange-400/30">
                    <button
                      type="button"
                      onClick={() => {
                        setUserType('tutor');
                        setError('');
                      }}
                      className={`relative py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl font-bold transition-all ${
                        userType === 'tutor'
                          ? 'bg-gradient-to-br from-orange-500/40 to-yellow-500/40 text-orange-200 shadow-lg shadow-orange-500/50 border-2 border-orange-400/70'
                          : 'text-white/50 hover:text-white/70 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                        <User className="w-3 sm:w-3.5 h-3 sm:h-3.5" strokeWidth={2.5} />
                        <span className="text-[10px] sm:text-xs">Tutor/Padre</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserType('estudiante');
                        setError('');
                      }}
                      className={`relative py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl font-bold transition-all ${
                        userType === 'estudiante'
                          ? 'bg-gradient-to-br from-orange-500/40 to-yellow-500/40 text-orange-200 shadow-lg shadow-orange-500/50 border-2 border-orange-400/70'
                          : 'text-white/50 hover:text-white/70 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                        <GraduationCap className="w-3 sm:w-3.5 h-3 sm:h-3.5" strokeWidth={2.5} />
                        <span className="text-[10px] sm:text-xs">Estudiante</span>
                      </div>
                    </button>
                  </div>

                  {/* Alert de error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-xl"
                    >
                      <p className="text-red-400 text-xs flex items-center gap-2">
                        <span className="text-sm">⚠️</span>
                        {error}
                      </p>
                    </motion.div>
                  )}

                  {/* Login Form */}
                  <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
                    {/* Email Input - Brawl Style */}
                    <div className="space-y-1">
                      <label htmlFor="email" className="block text-[10px] sm:text-xs font-bold text-white/90">
                        Correo electrónico
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                          <Mail className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-orange-300/60 group-focus-within:text-orange-300 transition-colors" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={handleEmailChange}
                          required
                          placeholder="tu@email.com"
                          disabled={isLoading}
                          autoComplete="email"
                          className="w-full pl-8 sm:pl-10 pr-2.5 sm:pr-3 py-2 sm:py-2.5 text-xs sm:text-sm bg-black/50 border-2 border-orange-400/20 rounded-lg sm:rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-orange-400/60 focus:ring-2 focus:ring-orange-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Password Input - Brawl Style */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor="password" className="block text-[10px] sm:text-xs font-bold text-white/90">
                          Contraseña
                        </label>
                        <span className="text-[9px] sm:text-[10px] text-gray-400">
                          ¿Olvidaste tu contraseña?
                        </span>
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                          <Lock className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-orange-300/60 group-focus-within:text-orange-300 transition-colors" />
                        </div>
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={handlePasswordChange}
                          required
                          placeholder="••••••••"
                          disabled={isLoading}
                          autoComplete="current-password"
                          className="w-full pl-8 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 text-xs sm:text-sm bg-black/50 border-2 border-orange-400/20 rounded-lg sm:rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-orange-400/60 focus:ring-2 focus:ring-orange-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                          className="absolute inset-y-0 right-0 pr-2.5 sm:pr-3 flex items-center text-white/50 hover:text-orange-300 transition-colors disabled:opacity-50"
                        >
                          {showPassword ? (
                            <EyeOff className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                          ) : (
                            <Eye className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me - Brawl Style */}
                    <div className="flex items-center">
                      <input
                        id="remember"
                        type="checkbox"
                        disabled={isLoading}
                        className="w-3 sm:w-3.5 h-3 sm:h-3.5 rounded border-orange-400/30 bg-black/50 text-orange-400 focus:ring-2 focus:ring-orange-400/30 focus:ring-offset-0 disabled:opacity-50"
                      />
                      <label htmlFor="remember" className="ml-2 text-[10px] sm:text-xs text-white/70">
                        Mantener sesión iniciada
                      </label>
                    </div>

                    {/* Submit Button - EVOLVED */}
                    <MagneticButton
                      type="submit"
                      disabled={isLoading || isSubmitting}
                      className="w-full group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all inline-flex items-center justify-center gap-2 shadow-xl shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          <ArrowRight
                            className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                            strokeWidth={2.5}
                          />
                        </>
                      )}
                    </MagneticButton>
                  </form>

                  {/* Divider */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-orange-400/10" />
                    </div>
                    <div className="relative flex justify-center text-[10px]">
                      <span className="px-3 bg-zinc-900/90 text-white/50">¿Primera vez aquí?</span>
                    </div>
                  </div>

                  {/* Sign Up Link */}
                  <div className="text-center space-y-1">
                    <p className="text-xs text-white/70">
                      ¿Aún no tienes cuenta?{' '}
                      <Link
                        href="/register"
                        className="text-orange-300 hover:text-orange-200 transition-colors font-bold"
                      >
                        Regístrate aquí
                      </Link>
                    </p>
                    <p className="text-[10px] text-white/50">
                      o{' '}
                      <a
                        href="mailto:info@mateatletas.com?subject=Información sobre el programa"
                        className="text-orange-300/80 hover:text-orange-200 transition-colors font-medium underline"
                      >
                        solicita información
                      </a>
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
