'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Eye,
  EyeOff,
  LogIn,
  Mail,
  Lock,
  Heart,
  Users,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

/**
 * Login Page - Tutores (Padres/Madres)
 * Ultra-premium cosmos design
 * Ruta: /login
 */
export default function TutorLoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
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
          className="absolute top-40 right-1/4 w-64 h-64 bg-[#10b981]/15 rounded-full blur-[100px]"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 w-64 h-64 bg-[#0ea5e9]/15 rounded-full blur-[100px]"
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
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

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Message */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#0ea5e9]/20 to-[#10b981]/20 border border-[#0ea5e9]/30 mb-8">
                <Heart className="w-4 h-4 text-[#0ea5e9] animate-pulse" />
                <span className="text-xs font-black text-[#0ea5e9] uppercase tracking-widest">
                  Portal Familias
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                BIENVENIDO
                <br />
                <span className="title-gradient">DE VUELTA</span>
              </h1>

              <p className="text-xl text-white/70 mb-8 leading-relaxed">
                Accede al panel para seguir el progreso de tus hijos,
                <br />
                gestionar cursos y estar al día con todo.
              </p>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
                {[
                  { icon: Users, label: 'Mis Hijos' },
                  { icon: Shield, label: 'Seguro' },
                  { icon: Heart, label: 'Confiable' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="card-glass p-4 rounded-2xl border border-white/10 text-center"
                  >
                    <item.icon className="w-8 h-8 text-[#0ea5e9] mx-auto mb-2" />
                    <div className="text-xs text-white/50">{item.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Side - Login Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative card-glass rounded-3xl border-2 border-white/10 p-10">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/5 to-[#10b981]/5 rounded-3xl pointer-events-none" />

                <div className="relative z-10">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-[#10b981] mb-4 shadow-2xl">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">Ingreso Familias</h2>
                    <p className="text-white/60">Ingresa con tu email y contraseña</p>
                  </div>

                  {/* Login Form */}
                  <form onSubmit={handleLogin} className="space-y-6">
                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-bold text-white/80 mb-2">
                        Email
                      </label>
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
                      <label className="block text-sm font-bold text-white/80 mb-2">
                        Contraseña
                      </label>
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
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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

                  {/* Footer Links */}
                  <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-3">
                    <p className="text-sm text-white/60">
                      ¿No tienes cuenta?{' '}
                      <Link
                        href="/register"
                        className="text-[#0ea5e9] hover:text-[#10b981] transition-colors font-bold"
                      >
                        Crear cuenta
                      </Link>
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs text-white/40">
                      <Link href="/estudiante-login" className="hover:text-white transition-colors">
                        Soy Estudiante
                      </Link>
                      <span>•</span>
                      <Link href="/docente-login" className="hover:text-white transition-colors">
                        Soy Docente
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-12"
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
    </div>
  );
}
