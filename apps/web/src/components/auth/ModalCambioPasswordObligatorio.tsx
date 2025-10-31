'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';

interface ModalCambioPasswordObligatorioProps {
  isOpen: boolean;
  onClose?: () => void; // Opcional porque el modal NO se puede cerrar
}

export default function ModalCambioPasswordObligatorio({
  isOpen,
}: ModalCambioPasswordObligatorioProps) {
  const { cambiarPassword, isLoading } = useAuthStore();
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [error, setError] = useState('');
  const [showPasswordActual, setShowPasswordActual] = useState(false);
  const [showNuevaPassword, setShowNuevaPassword] = useState(false);
  const [showConfirmarPassword, setShowConfirmarPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!passwordActual || !nuevaPassword || !confirmarPassword) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (nuevaPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwordActual === nuevaPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    try {
      await cambiarPassword(passwordActual, nuevaPassword);
      // El modal se cerrará automáticamente cuando debe_cambiar_password sea false
    } catch (error) {
      const apiMessage =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message ===
          'string'
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;

      setError(apiMessage || 'Error al cambiar la contraseña');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/20">
            <Lock className="h-8 w-8 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            Cambio de Contraseña Obligatorio
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Por seguridad, debes cambiar tu contraseña antes de continuar
          </p>
        </div>

        {/* Alert */}
        <div className="mb-6 flex items-start gap-3 rounded-lg bg-orange-500/10 border border-orange-500/30 p-4">
          <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-orange-300">
            Tu contraseña actual es temporal. Elige una contraseña segura que solo tú conozcas.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password Actual */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Contraseña Actual
            </label>
            <div className="relative">
              <input
                type={showPasswordActual ? 'text' : 'password'}
                value={passwordActual}
                onChange={(e) => setPasswordActual(e.target.value)}
                className="w-full rounded-lg bg-slate-800/50 border border-slate-600 px-4 py-3 pr-12 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="Tu contraseña temporal"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPasswordActual(!showPasswordActual)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                {showPasswordActual ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Nueva Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showNuevaPassword ? 'text' : 'password'}
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                className="w-full rounded-lg bg-slate-800/50 border border-slate-600 px-4 py-3 pr-12 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="Mínimo 6 caracteres"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNuevaPassword(!showNuevaPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                {showNuevaPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirmar Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showConfirmarPassword ? 'text' : 'password'}
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                className="w-full rounded-lg bg-slate-800/50 border border-slate-600 px-4 py-3 pr-12 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="Repite la nueva contraseña"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmarPassword(!showConfirmarPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                {showConfirmarPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-orange-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
          </button>
        </form>

        {/* Footer Info */}
        <p className="mt-6 text-center text-xs text-slate-500">
          No podrás acceder al sistema hasta que cambies tu contraseña
        </p>
      </div>
    </div>
  );
}
