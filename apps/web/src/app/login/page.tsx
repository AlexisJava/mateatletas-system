'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import ModalCambioPasswordObligatorio from '@/components/auth/ModalCambioPasswordObligatorio';
import ModalSelectorRol from '@/components/auth/ModalSelectorRol';
import type { UserRole } from '@/store/auth.store';
import {
  Terminal,
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  Sparkles,
  Code2,
  Brain,
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
        className="absolute w-1 h-1 bg-emerald-400 rounded-full blur-[1px] opacity-0"
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
      className="absolute w-1 h-1 bg-emerald-400 rounded-full blur-[1px]"
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
  const { login, loginEstudiante, isLoading, isAuthenticated, user, selectedRole, setSelectedRole } = useAuthStore();

  // Declarar TODOS los estados primero
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [userType, setUserType] = useState<'tutor' | 'estudiante'>('tutor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasRedirectedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // RESET: Al montar el componente, limpiar selectedRole Y detectar modal inmediatamente
  useEffect(() => {
    if (selectedRole !== null) {
      setSelectedRole(null);
    }

    // CRÍTICO: Si ya hay un usuario autenticado multi-rol al montar, mostrar modal INMEDIATAMENTE
    if (isAuthenticated && user && !user.debe_cambiar_password && user.roles && user.roles.length > 1 && !selectedRole) {
      setShowRoleSelector(true);
    }
  }, []); // Solo ejecutar al montar

  // CONSOLIDADO: Detectar si debe cambiar contraseña O si debe seleccionar rol
  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    // PRIORIDAD 1: Cambio de contraseña obligatorio
    if (user.debe_cambiar_password && !showPasswordModal) {
      setShowPasswordModal(true);
      return;
    }

    // PRIORIDAD 2: Selección de rol para usuarios multi-rol
    if (!user.debe_cambiar_password && user.roles && user.roles.length > 1 && !selectedRole && !showRoleSelector) {
      setShowRoleSelector(true);
      return;
    }
  }, [isAuthenticated, user, selectedRole, showPasswordModal, showRoleSelector]);

  // Función para manejar selección de rol
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setShowRoleSelector(false);
    hasRedirectedRef.current = false; // Reset para permitir redirección
  };

  // Redirigir si ya está autenticado, NO debe cambiar password, y tiene rol seleccionado (o solo 1 rol)
  useEffect(() => {
    // NO redirigir si se están mostrando modales
    if (showRoleSelector || showPasswordModal) return;

    // Verificar condiciones básicas
    if (!isAuthenticated || !user || user.debe_cambiar_password || hasRedirectedRef.current || isLoading) {
      return;
    }

    // Si tiene múltiples roles pero no ha seleccionado, esperar
    if (user.roles && user.roles.length > 1 && !selectedRole) {
      return;
    }

    // Todas las condiciones cumplidas - proceder con redirección
    hasRedirectedRef.current = true;
    setIsRedirecting(true);

    // Usar selectedRole si existe, sino user.role
    const activeRole = selectedRole || user.role;

    // Redirigir según el rol activo
    const redirectPath =
      activeRole === 'admin' ? '/admin/dashboard' :
      activeRole === 'docente' ? '/docente/dashboard' :
      activeRole === 'estudiante' ? '/estudiante/dashboard' :
      '/dashboard';

    router.replace(redirectPath);
  }, [isAuthenticated, user, selectedRole, router, isLoading, showRoleSelector, showPasswordModal]);

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
      // Usar método de login según el tipo de usuario seleccionado
      if (userType === 'estudiante') {
        await loginEstudiante(email, password);
      } else {
        await login(email, password);
      }

      // NO setear isRedirecting aquí - el useEffect de redirección lo manejará
      // Esto permite que el modal se muestre para usuarios multi-rol
    } catch (err: unknown) {
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
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-black to-teal-950/20" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.3) 1.5px, transparent 1.5px),
                            linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1.5px, transparent 1.5px)`,
            backgroundSize: '64px 64px',
          }}
        />

        {/* Loading content */}
        <div className="relative z-10 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full mb-6"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/90 text-lg font-semibold"
          >
            Redirigiendo al portal...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-black overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-black to-teal-950/20" />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.3) 1.5px, transparent 1.5px),
                            linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1.5px, transparent 1.5px)`,
            backgroundSize: '64px 64px',
          }}
        />

        {/* Radial gradient spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />

        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.3} left={5 + i * 6} />
        ))}
      </div>

      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.03] bg-black/50 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20"
                >
                  <Terminal className="w-4 h-4 text-white" strokeWidth={2.5} />
                </motion.div>
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight">Mateatletas</h1>
                <p className="text-[9px] text-emerald-400/40 font-medium uppercase tracking-wider">
                  Entrenamiento Mental
                </p>
              </div>
            </Link>

            <Link
              href="/"
              className="text-sm text-white/50 hover:text-emerald-400 transition-colors font-medium"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content - Split Screen Design */}
      <div className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="max-w-6xl w-full mx-auto px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Branding & Animation */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative hidden lg:block"
            >
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px]" />
              <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-teal-500/10 rounded-full blur-[100px]" />

              <div className="relative z-10 space-y-8">
                {/* Hero text */}
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400 font-semibold">
                      Portal de Acceso
                    </span>
                  </motion.div>

                  <h2 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
                    Bienvenido de vuelta
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400">
                      a tu entrenamiento
                    </span>
                  </h2>

                  <p className="text-lg text-white/60 leading-relaxed max-w-md">
                    Accede a tu portal personalizado para continuar desarrollando tus habilidades
                    en matemáticas y programación.
                  </p>
                </div>

                {/* Feature cards */}
                <div className="space-y-4 mt-12">
                  {[
                    {
                      icon: Code2,
                      title: 'Clases en Vivo',
                      description: 'Máximo 8 estudiantes por sesión',
                    },
                    {
                      icon: Brain,
                      title: 'Seguimiento Personalizado',
                      description: 'Monitoreo continuo de progreso',
                    },
                    {
                      icon: Terminal,
                      title: 'Entorno Real',
                      description: 'Herramientas profesionales desde día 1',
                    },
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-emerald-500/30 transition-all group"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                        <feature.icon className="w-5 h-5 text-emerald-400" strokeWidth={2} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white/90">{feature.title}</h4>
                        <p className="text-xs text-white/50 mt-1">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Side - Login Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {/* Glow effect behind card */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-[60px] opacity-30" />

              {/* Login Card */}
              <div className="relative bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-zinc-900/90 backdrop-blur-2xl rounded-3xl border border-white/[0.08] shadow-2xl shadow-emerald-500/10 overflow-hidden">
                {/* Card header glow */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

                <div className="p-8 lg:p-12">
                  {/* Mobile title */}
                  <div className="lg:hidden mb-8 space-y-3">
                    <h2 className="text-3xl font-bold tracking-tight">Iniciar Sesión</h2>
                    <p className="text-white/60">Accede a tu portal personalizado</p>
                  </div>

                  {/* Desktop title */}
                  <div className="hidden lg:block mb-8 space-y-3">
                    <h2 className="text-3xl font-bold tracking-tight">Iniciar Sesión</h2>
                    <p className="text-white/60">Ingresa tus credenciales para continuar</p>
                  </div>

                  {/* Toggle Tutor/Estudiante - EVOLVED */}
                  <div className="mb-8 grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-black/40 border border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => {
                        setUserType('tutor');
                        setError('');
                      }}
                      className={`relative py-3 px-4 rounded-xl font-semibold transition-all ${
                        userType === 'tutor'
                          ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20 border border-emerald-500/30'
                          : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <User className="w-4 h-4" strokeWidth={2.5} />
                        <span>Tutor/Padre</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserType('estudiante');
                        setError('');
                      }}
                      className={`relative py-3 px-4 rounded-xl font-semibold transition-all ${
                        userType === 'estudiante'
                          ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20 border border-emerald-500/30'
                          : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <GraduationCap className="w-4 h-4" strokeWidth={2.5} />
                        <span>Estudiante</span>
                      </div>
                    </button>
                  </div>

                  {/* Alert de error - EVOLVED */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-xl"
                    >
                      <p className="text-red-400 text-sm flex items-center gap-2">
                        <span className="text-lg">⚠️</span>
                        {error}
                      </p>
                    </motion.div>
                  )}

                  {/* Login Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Input - EVOLVED */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-semibold text-white/80">
                        Correo electrónico
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="w-5 h-5 text-emerald-400/50 group-focus-within:text-emerald-400 transition-colors" />
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
                          className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Password Input - EVOLVED */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="password" className="block text-sm font-semibold text-white/80">
                          Contraseña
                        </label>
                        <span className="text-xs text-gray-400">
                          ¿Olvidaste tu contraseña? Contacta al administrador
                        </span>
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="w-5 h-5 text-emerald-400/50 group-focus-within:text-emerald-400 transition-colors" />
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
                          className="w-full pl-12 pr-12 py-3.5 bg-black/40 border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-emerald-400 transition-colors disabled:opacity-50"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me - EVOLVED */}
                    <div className="flex items-center">
                      <input
                        id="remember"
                        type="checkbox"
                        disabled={isLoading}
                        className="w-4 h-4 rounded border-white/[0.08] bg-black/40 text-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-0 disabled:opacity-50"
                      />
                      <label htmlFor="remember" className="ml-3 text-sm text-white/60">
                        Mantener sesión iniciada
                      </label>
                    </div>

                    {/* Submit Button - EVOLVED */}
                    <MagneticButton
                      type="submit"
                      disabled={isLoading || isSubmitting}
                      className="w-full group px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-base font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all inline-flex items-center justify-center gap-2 shadow-xl shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/[0.08]" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-zinc-900/90 text-white/40">¿Primera vez aquí?</span>
                    </div>
                  </div>

                  {/* Sign Up Link */}
                  <div className="text-center space-y-3">
                    <p className="text-sm text-white/60">
                      ¿Aún no tienes cuenta?{' '}
                      <Link
                        href="/register"
                        className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold"
                      >
                        Regístrate aquí
                      </Link>
                    </p>
                    <p className="text-xs text-white/40">
                      o{' '}
                      <a
                        href="mailto:info@mateatletas.com?subject=Información sobre el programa"
                        className="text-emerald-400/80 hover:text-emerald-300 transition-colors font-medium underline"
                      >
                        solicita información sobre el programa
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal de cambio de contraseña obligatorio */}
      <ModalCambioPasswordObligatorio isOpen={showPasswordModal} />

      {/* Modal de selector de rol para multi-rol */}
      <ModalSelectorRol
        isOpen={showRoleSelector}
        roles={user?.roles || []}
        onSelectRole={handleSelectRole}
      />
    </div>
  );
}
