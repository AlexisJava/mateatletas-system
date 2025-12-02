'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export default function LoginPage(): React.ReactElement {
  const router = useRouter();
  const { login, isLoading: storeLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = storeLoading || isSubmitting;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);

      // Redirigir a la página guardada o al dashboard
      const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/admin/studio';
      sessionStorage.removeItem('redirectAfterLogin');
      router.push(redirectTo);
    } catch {
      setError('Credenciales inválidas. Verifica tu email y contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md p-8">
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30">
            <span className="text-3xl">🧮</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Mateatletas Studio</h1>
          <p className="mt-2 text-sm text-white/50">Inicia sesión para continuar</p>
        </div>

        {/* Credenciales de desarrollo */}
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-xs font-medium text-amber-400">Credenciales de desarrollo:</p>
          <p className="mt-1 font-mono text-sm text-amber-300">admin@mateatletas.com</p>
          <p className="font-mono text-sm text-amber-300">Admin123!</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/70">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mateatletas.com"
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white/70">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-3 font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:from-orange-600 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
