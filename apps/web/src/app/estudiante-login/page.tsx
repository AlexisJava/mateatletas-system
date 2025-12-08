'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, User, Lock, Rocket } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

/**
 * Login Page para Estudiantes
 * Usa username + password (no email)
 */
export default function EstudianteLoginPage() {
  const router = useRouter();
  const { loginEstudiante } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginEstudiante(username, password);
      // Redirigir al portal de estudiante
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Nebula effects */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px]" />

        {/* Stars - posiciones fijas para evitar hydration mismatch */}
        {[
          { left: 5, top: 10 },
          { left: 15, top: 25 },
          { left: 25, top: 5 },
          { left: 35, top: 45 },
          { left: 45, top: 15 },
          { left: 55, top: 35 },
          { left: 65, top: 8 },
          { left: 75, top: 55 },
          { left: 85, top: 20 },
          { left: 95, top: 40 },
          { left: 10, top: 60 },
          { left: 20, top: 80 },
          { left: 30, top: 70 },
          { left: 40, top: 90 },
          { left: 50, top: 75 },
          { left: 60, top: 95 },
          { left: 70, top: 65 },
          { left: 80, top: 85 },
          { left: 90, top: 50 },
          { left: 3, top: 30 },
          { left: 12, top: 42 },
          { left: 22, top: 88 },
          { left: 33, top: 22 },
          { left: 44, top: 58 },
          { left: 56, top: 12 },
          { left: 67, top: 78 },
          { left: 78, top: 32 },
          { left: 88, top: 68 },
          { left: 97, top: 92 },
          { left: 8, top: 52 },
        ].map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              opacity: 0.5 + (i % 5) * 0.1,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2 + (i % 3),
              repeat: Infinity,
              delay: (i % 4) * 0.5,
            }}
          />
        ))}

        {/* Floating orbs */}
        <motion.div
          className="absolute top-40 right-1/4 w-64 h-64 bg-purple-500/30 rounded-full blur-[100px]"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 w-64 h-64 bg-cyan-500/30 rounded-full blur-[100px]"
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-3xl border-2 border-purple-500/30 p-10 shadow-2xl shadow-purple-500/10">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-3xl pointer-events-none" />

              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 mb-4 shadow-2xl shadow-purple-500/30"
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(168, 85, 247, 0.4)',
                        '0 0 40px rgba(168, 85, 247, 0.6)',
                        '0 0 20px rgba(168, 85, 247, 0.4)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Rocket className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-black text-white mb-2">Portal Estudiantes</h2>
                  <p className="text-purple-200/60">Ingresá con tu usuario y contraseña</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Username Field */}
                  <div>
                    <label className="block text-sm font-bold text-purple-200/80 mb-2">
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
                        className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border-2 border-purple-500/30 rounded-2xl text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-500 transition-all"
                        placeholder="tu_usuario"
                        required
                        disabled={loading}
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-bold text-purple-200/80 mb-2">
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
                        className="w-full pl-12 pr-12 py-4 bg-gray-800/50 border-2 border-purple-500/30 rounded-2xl text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-500 transition-all"
                        placeholder="Tu contraseña"
                        required
                        disabled={loading}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-4 flex items-center text-purple-300/40 hover:text-white transition-colors"
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
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-purple-500/30"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
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
                  </motion.button>
                </form>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-purple-500/20 text-center">
                  <p className="text-sm text-purple-200/40">
                    ¿No tenés usuario? Pedile a tu tutor que te cree uno
                  </p>
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
              href="/login"
              className="inline-flex items-center gap-2 text-purple-300/60 hover:text-white transition-colors"
            >
              <span className="text-sm">← Soy tutor o docente</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
