"use client";

import { useState, useMemo } from 'react';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { getErrorMessage } from '@/lib/utils/error-handler';

interface ForcePasswordChangeOverlayProps {
  /**
   * Callback opcional luego de completar el cambio de contraseña
   */
  onSuccess?: () => void;
}

/**
 * Modal forzado para cambio de contraseña en primer ingreso
 */
export function ForcePasswordChangeOverlay({
  onSuccess,
}: ForcePasswordChangeOverlayProps) {
  const {
    user,
    login,
    loginEstudiante,
    setUser,
  } = useAuthStore((state) => ({
    user: state.user,
    login: state.login,
    loginEstudiante: state.loginEstudiante,
    setUser: state.setUser,
  }));

  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shouldShow = Boolean(user?.debe_cambiar_password);

  const passwordStrengthMessage = useMemo(() => {
    if (!nuevaPassword) return '';
    const conditions = [
      /[A-Z]/.test(nuevaPassword),
      /[a-z]/.test(nuevaPassword),
      /\d/.test(nuevaPassword),
      /[^A-Za-z0-9]/.test(nuevaPassword),
      nuevaPassword.length >= 12,
    ];
    const score = conditions.filter(Boolean).length;
    if (score >= 4) return 'Contraseña fuerte';
    if (score >= 3) return 'Contraseña moderada';
    return 'Contraseña débil';
  }, [nuevaPassword]);

  if (!shouldShow || !user) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (nuevaPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.changePassword({
        passwordActual,
        nuevaPassword,
      });

      // Refrescar sesión automáticamente
      if (user.email) {
        if (user.role === 'estudiante') {
          await loginEstudiante(user.email, nuevaPassword);
        } else {
          await login(user.email, nuevaPassword);
        }
      } else {
        // Si no tenemos email (caso raro), al menos actualizar flag local
        setUser({ ...user, debe_cambiar_password: false });
      }

      setPasswordActual('');
      setNuevaPassword('');
      setConfirmPassword('');
      setSuccessMessage('Contraseña actualizada. Sesión renovada con tu nueva contraseña.');

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error al cambiar contraseña'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
        <div className="p-8 space-y-6">
          <header className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Actualiza tu contraseña</h2>
            <p className="text-gray-600">
              Por seguridad, necesitas crear una contraseña nueva antes de continuar usando la plataforma.
            </p>
          </header>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña actual
              </label>
              <input
                type="password"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                value={passwordActual}
                onChange={(event) => setPasswordActual(event.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva contraseña
              </label>
              <input
                type="password"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                value={nuevaPassword}
                onChange={(event) => setNuevaPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
              {nuevaPassword && (
                <p className="mt-1 text-xs text-gray-500">
                  {passwordStrengthMessage}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar nueva contraseña
              </label>
              <input
                type="password"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <ul className="text-xs text-gray-500 space-y-1 bg-gray-50 border border-gray-200 rounded-xl p-3">
              <li>• Mínimo 8 caracteres</li>
              <li>• Incluye al menos una mayúscula y una minúscula</li>
              <li>• Agrega un número y un caracter especial</li>
            </ul>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-white font-semibold shadow-lg shadow-amber-200/40 transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando cambios...' : 'Guardar nueva contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForcePasswordChangeOverlay;

