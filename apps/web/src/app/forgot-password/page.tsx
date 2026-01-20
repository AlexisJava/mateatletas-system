'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import apiClient from '@/lib/axios';

/**
 * Página de solicitud de recuperación de contraseña
 * Permite a docentes y tutores solicitar un email para restablecer su contraseña
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      // El backend siempre responde 200 por seguridad, pero manejamos errores de red
      if (err instanceof Error) {
        setError('Error de conexión. Intentá de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--estudiante-bg)]">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]" />

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative bg-black/40 backdrop-blur-xl rounded-3xl border-2 border-white/10 overflow-hidden shadow-2xl p-10">
              {/* Glow effect */}
              <div className="absolute inset-0 pointer-events-none rounded-3xl bg-gradient-to-br from-cyan-500/10 to-emerald-500/10" />

              <div className="relative z-10">
                {success ? (
                  // Success State
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 mb-6">
                      <CheckCircle className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">¡Email enviado!</h2>
                    <p className="text-white/60 mb-8">
                      Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu
                      contraseña. Revisá también tu carpeta de spam.
                    </p>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Volver al login
                    </Link>
                  </motion.div>
                ) : (
                  // Form State
                  <>
                    {/* Header */}
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-emerald-600 mb-4 shadow-lg shadow-cyan-500/30">
                        <Mail className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        ¿Olvidaste tu contraseña?
                      </h2>
                      <p className="text-white/60">
                        Ingresá tu email y te enviaremos un enlace para restablecerla
                      </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-white/80 mb-2">Email</label>
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

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 px-6 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/30"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Enviando...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            <span>ENVIAR ENLACE</span>
                          </>
                        )}
                      </button>
                    </form>

                    {/* Back to Login */}
                    <div className="mt-8 text-center">
                      <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al login
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Help text for students */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-white/40 text-sm">
              ¿Sos estudiante? Contactá a tu tutor para recuperar tu contraseña
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
