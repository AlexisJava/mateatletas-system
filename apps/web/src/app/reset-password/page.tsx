'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle, XCircle, KeyRound } from 'lucide-react';
import apiClient from '@/lib/axios';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Verificar token al cargar
  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !email) {
        setVerifying(false);
        setTokenValid(false);
        return;
      }

      try {
        const response = await apiClient.post<{ valid: boolean }>('/auth/verify-reset-token', {
          token,
          email,
        });
        setTokenValid(response.valid);
      } catch {
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/auth/reset-password', {
        token,
        email,
        newPassword,
      });
      setSuccess(true);

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError('El enlace expiró o ya fue utilizado. Solicitá uno nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Estado de carga inicial
  if (verifying) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60">Verificando enlace...</p>
      </div>
    );
  }

  // Token inválido o no proporcionado
  if (!tokenValid) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-6">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Enlace inválido</h2>
        <p className="text-white/60 mb-8">
          El enlace de recuperación es inválido, expiró o ya fue utilizado. Solicitá uno nuevo.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-all"
        >
          Solicitar nuevo enlace
        </Link>
      </motion.div>
    );
  }

  // Éxito
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">¡Contraseña actualizada!</h2>
        <p className="text-white/60 mb-4">
          Tu contraseña fue actualizada exitosamente. Ya podés iniciar sesión con tu nueva
          contraseña.
        </p>
        <p className="text-white/40 text-sm">Redirigiendo al login...</p>
      </motion.div>
    );
  }

  // Formulario de reset
  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-emerald-600 mb-4 shadow-lg shadow-cyan-500/30">
          <KeyRound className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Nueva contraseña</h2>
        <p className="text-white/60">Ingresá tu nueva contraseña para {email}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* New Password */}
        <div>
          <label className="block text-sm font-bold text-white/80 mb-2">Nueva contraseña</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-cyan-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-black/30 border-2 border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500 transition-all"
              placeholder="Mínimo 8 caracteres"
              required
              disabled={loading}
              minLength={8}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-4 flex items-center text-white/40 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-bold text-white/80 mb-2">Confirmar contraseña</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-cyan-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-black/30 border-2 border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500 transition-all"
              placeholder="Repetí tu contraseña"
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>
        </div>

        {/* Password requirements */}
        <div className="text-sm text-white/40">
          <p className="flex items-center gap-2">
            <span className={newPassword.length >= 8 ? 'text-emerald-400' : ''}>
              {newPassword.length >= 8 ? '✓' : '○'}
            </span>
            Mínimo 8 caracteres
          </p>
          <p className="flex items-center gap-2">
            <span
              className={newPassword && newPassword === confirmPassword ? 'text-emerald-400' : ''}
            >
              {newPassword && newPassword === confirmPassword ? '✓' : '○'}
            </span>
            Las contraseñas coinciden
          </p>
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
          disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
          className="w-full py-4 px-6 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/30"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Actualizando...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>CAMBIAR CONTRASEÑA</span>
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
  );
}

/**
 * Página de restablecimiento de contraseña
 * Permite establecer una nueva contraseña usando el token recibido por email
 */
export default function ResetPasswordPage() {
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
                <Suspense
                  fallback={
                    <div className="text-center">
                      <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-white/60">Cargando...</p>
                    </div>
                  }
                >
                  <ResetPasswordContent />
                </Suspense>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
