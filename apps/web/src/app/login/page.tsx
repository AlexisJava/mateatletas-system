'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Mail, Lock, Sparkles } from 'lucide-react';
import { useAuthStore, type UserRole, type LoginResult } from '@/store/auth.store';
import RoleSelectorModal from '@/components/auth/RoleSelectorModal';

/**
 * Login Page - Unificado para todos los usuarios
 * Tutores, Docentes, Admins usan el mismo formulario
 * El backend determina el rol y redirige automáticamente
 */
export default function LoginPage() {
  const router = useRouter();
  const { login, setSelectedRole } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
      default:
        return '/dashboard';
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result: LoginResult = await login(email, password);

      // Verificar si se requiere MFA
      if (!result.success && result.mfaRequired) {
        setError('Se requiere verificación MFA. Contacte al administrador.');
        setLoading(false);
        return;
      }

      // Login exitoso
      if (result.success) {
        const { user, roles } = result;

        // Si tiene múltiples roles, mostrar selector
        if (roles.length > 1) {
          setAvailableRoles(roles);
          setShowRoleSelector(true);
          setLoading(false);
          return;
        }

        // Si solo tiene un rol, redirigir directamente
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Cosmos Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#0ea5e9]/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#10b981]/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8b5cf6]/10 rounded-full blur-[120px]" />

        {/* Floating orbs */}
        <motion.div
          className="absolute top-40 right-1/4 w-96 h-96 bg-[#10b981]/30 rounded-full blur-[120px]"
          animate={{
            y: [0, -40, 0],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 w-96 h-96 bg-[#0ea5e9]/30 rounded-full blur-[120px]"
          animate={{
            y: [0, 40, 0],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(14, 165, 233, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(14, 165, 233, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Main Content - Centered */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative card-glass rounded-3xl border-2 border-white/10 p-10">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/5 to-[#10b981]/5 rounded-3xl pointer-events-none" />

              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-[#10b981] mb-4 shadow-2xl">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2">Mateatletas</h2>
                  <p className="text-white/60">Ingresá con tu email y contraseña</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-[#0ea5e9]" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-black/30 border-2 border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-[#0ea5e9] transition-all"
                        placeholder="tu@email.com"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2">Contraseña</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-[#0ea5e9]" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 bg-black/30 border-2 border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-[#0ea5e9] transition-all"
                        placeholder="Tu contraseña"
                        required
                        disabled={loading}
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
                    className="w-full btn-pulse flex items-center justify-center gap-3"
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
                </form>

                {/* Footer - Solo link a estudiantes */}
                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                  <Link
                    href="/estudiante-login"
                    className="text-sm text-white/40 hover:text-white transition-colors"
                  >
                    ¿Sos estudiante? Ingresá acá
                  </Link>
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
