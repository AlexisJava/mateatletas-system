'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  LogIn,
  Mail,
  Lock,
  Sparkles,
  User,
  Rocket,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { useAuthStore, type UserRole, type LoginResult } from '@/store/auth.store';
import RoleSelectorModal from '@/components/auth/RoleSelectorModal';

type LoginTab = 'docente' | 'estudiante';

/**
 * Login Page Unificado con Tabs
 * - Tab Docentes: email + password (tutores, docentes, admins)
 * - Tab Estudiantes: username + password
 */
export default function LoginPage() {
  const router = useRouter();
  const { login, loginEstudiante, setSelectedRole } = useAuthStore();

  const [activeTab, setActiveTab] = useState<LoginTab>('docente');

  // Campos comunes
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Campo específico docente
  const [email, setEmail] = useState('');

  // Campo específico estudiante
  const [username, setUsername] = useState('');

  // Modal de roles
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);

  /**
   * Determina la ruta de redirección según el rol
   */
  const getRedirectPath = (role: UserRole): string => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'docente':
        return '/docente/dashboard';
      case 'estudiante':
        return '/estudiante';
      case 'tutor':
        return '/tutor/dashboard';
      default:
        return '/tutor/dashboard';
    }
  };

  /**
   * Maneja la selección de rol cuando el usuario tiene múltiples roles
   */
  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
    setShowRoleSelector(false);
    router.push(getRedirectPath(role));
  };

  /**
   * Login para Docentes/Tutores/Admins (con email)
   */
  const handleDocenteLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result: LoginResult = await login(email, password);

      if (!result.success && result.mfaRequired) {
        setError('Se requiere verificación MFA. Contacte al administrador.');
        setLoading(false);
        return;
      }

      if (result.success) {
        const { user, roles } = result;

        if (roles.length > 1) {
          setAvailableRoles(roles);
          setShowRoleSelector(true);
          setLoading(false);
          return;
        }

        const primaryRole = roles[0] ?? user.role;
        setSelectedRole(primaryRole);
        router.push(getRedirectPath(primaryRole));
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login para Estudiantes (con username)
   */
  const handleEstudianteLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginEstudiante(username, password);
      router.push('/estudiante');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al iniciar sesión. Verificá tu usuario y contraseña.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Limpiar campos al cambiar de tab
  const handleTabChange = (tab: LoginTab) => {
    setActiveTab(tab);
    setError('');
    setPassword('');
    setShowPassword(false);
  };

  const isDocente = activeTab === 'docente';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--estudiante-bg)]">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Gradientes según tab activo */}
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 rounded-full blur-[120px] animate-pulse"
          animate={{
            backgroundColor: isDocente ? 'rgba(14, 165, 233, 0.2)' : 'rgba(168, 85, 247, 0.2)',
          }}
          transition={{ duration: 0.5 }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-[120px] animate-pulse"
          animate={{
            backgroundColor: isDocente ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 182, 212, 0.2)',
          }}
          transition={{ duration: 0.5 }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]" />

        {/* Floating orbs */}
        <motion.div
          className="absolute top-40 right-1/4 w-64 h-64 rounded-full blur-[100px]"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            backgroundColor: isDocente ? 'rgba(16, 185, 129, 0.3)' : 'rgba(168, 85, 247, 0.3)',
          }}
          transition={{
            y: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
            x: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
            backgroundColor: { duration: 0.5 },
          }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 w-64 h-64 rounded-full blur-[100px]"
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
            backgroundColor: isDocente ? 'rgba(14, 165, 233, 0.3)' : 'rgba(6, 182, 212, 0.3)',
          }}
          transition={{
            y: { duration: 10, repeat: Infinity, ease: 'easeInOut' },
            x: { duration: 10, repeat: Infinity, ease: 'easeInOut' },
            backgroundColor: { duration: 0.5 },
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative bg-black/40 backdrop-blur-xl rounded-3xl border-2 border-white/10 overflow-hidden shadow-2xl">
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none rounded-3xl"
                animate={{
                  background: isDocente
                    ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                }}
                transition={{ duration: 0.5 }}
              />

              {/* Tabs */}
              <div className="relative flex border-b border-white/10">
                <button
                  onClick={() => handleTabChange('docente')}
                  className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-semibold transition-all relative ${
                    isDocente ? 'text-white' : 'text-white/40 hover:text-white/60'
                  }`}
                  disabled={loading}
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>Docentes</span>
                  {isDocente && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500"
                    />
                  )}
                </button>
                <button
                  onClick={() => handleTabChange('estudiante')}
                  className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-semibold transition-all relative ${
                    !isDocente ? 'text-white' : 'text-white/40 hover:text-white/60'
                  }`}
                  disabled={loading}
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Estudiantes</span>
                  {!isDocente && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500"
                    />
                  )}
                </button>
              </div>

              {/* Content */}
              <div className="p-10">
                <div className="relative z-10">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <motion.div
                      className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-2xl"
                      animate={{
                        background: isDocente
                          ? 'linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)'
                          : 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
                        boxShadow: isDocente
                          ? '0 25px 50px rgba(14, 165, 233, 0.4)'
                          : '0 25px 50px rgba(168, 85, 247, 0.4)',
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {isDocente ? (
                        <Sparkles className="w-8 h-8 text-white" />
                      ) : (
                        <Rocket className="w-8 h-8 text-white" />
                      )}
                    </motion.div>
                    <h2 className="text-3xl font-black text-white mb-2">Mateatletas</h2>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-white/60"
                      >
                        {isDocente
                          ? 'Ingresá con tu email y contraseña'
                          : 'Ingresá con tu usuario y contraseña'}
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  {/* Forms */}
                  <AnimatePresence mode="wait">
                    {isDocente ? (
                      <motion.form
                        key="docente-form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        onSubmit={handleDocenteLogin}
                        className="space-y-6"
                      >
                        {/* Email Field */}
                        <div>
                          <label className="block text-sm font-bold text-white/80 mb-2">
                            Email
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                              <Mail className="w-5 h-5 text-cyan-400" />
                            </div>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full pl-12 pr-4 py-4 bg-black/30 border-2 border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500 transition-all"
                              placeholder="tu@email.com"
                              required
                              disabled={loading}
                              autoComplete="email"
                            />
                          </div>
                        </div>

                        {/* Password Field */}
                        <div>
                          <label className="block text-sm font-bold text-white/80 mb-2">
                            Contraseña
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                              <Lock className="w-5 h-5 text-cyan-400" />
                            </div>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full pl-12 pr-12 py-4 bg-black/30 border-2 border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500 transition-all"
                              placeholder="Tu contraseña"
                              required
                              disabled={loading}
                              autoComplete="current-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-4 flex items-center text-white/40 hover:text-white transition-colors"
                              disabled={loading}
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                          >
                            <p className="text-sm text-red-400 text-center">{error}</p>
                          </motion.div>
                        )}

                        {/* Forgot Password Link */}
                        <div className="text-right">
                          <Link
                            href="/forgot-password"
                            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            ¿Olvidaste tu contraseña?
                          </Link>
                        </div>

                        {/* Login Button */}
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-4 px-6 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/30"
                        >
                          {loading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Ingresando...</span>
                            </>
                          ) : (
                            <>
                              <LogIn className="w-5 h-5" />
                              <span>INGRESAR</span>
                            </>
                          )}
                        </button>
                      </motion.form>
                    ) : (
                      <motion.form
                        key="estudiante-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        onSubmit={handleEstudianteLogin}
                        className="space-y-6"
                      >
                        {/* Username Field */}
                        <div>
                          <label className="block text-sm font-bold text-white/80 mb-2">
                            Usuario
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                              <User className="w-5 h-5 text-purple-400" />
                            </div>
                            <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              className="w-full pl-12 pr-4 py-4 bg-black/30 border-2 border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-all"
                              placeholder="tu_usuario"
                              required
                              disabled={loading}
                              autoComplete="username"
                            />
                          </div>
                        </div>

                        {/* Password Field */}
                        <div>
                          <label className="block text-sm font-bold text-white/80 mb-2">
                            Contraseña
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                              <Lock className="w-5 h-5 text-purple-400" />
                            </div>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full pl-12 pr-12 py-4 bg-black/30 border-2 border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-all"
                              placeholder="Tu contraseña"
                              required
                              disabled={loading}
                              autoComplete="current-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-4 flex items-center text-white/40 hover:text-white transition-colors"
                              disabled={loading}
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                          >
                            <p className="text-sm text-red-400 text-center">{error}</p>
                          </motion.div>
                        )}

                        {/* Login Button */}
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-purple-500/30"
                        >
                          {loading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Ingresando...</span>
                            </>
                          ) : (
                            <>
                              <LogIn className="w-5 h-5" />
                              <span>INGRESAR AL PORTAL</span>
                            </>
                          )}
                        </button>

                        {/* Help text for students */}
                        <p className="text-sm text-white/40 text-center">
                          ¿No tenés usuario? Pedile a tu tutor que te cree uno
                        </p>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <span className="text-sm">← Volver al inicio</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Role Selector Modal */}
      {showRoleSelector && (
        <RoleSelectorModal roles={availableRoles} onSelectRole={handleRoleSelection} />
      )}
    </div>
  );
}
