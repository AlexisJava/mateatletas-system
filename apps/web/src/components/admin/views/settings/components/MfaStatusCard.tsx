'use client';

import { motion } from 'framer-motion';

interface MfaStatusCardProps {
  mfaEnabled: boolean;
  onEnableClick: () => void;
  onDisableClick: () => void;
  isLoading: boolean;
}

/**
 * MfaStatusCard - Muestra el estado actual de MFA y acciones
 */
export function MfaStatusCard({
  mfaEnabled,
  onEnableClick,
  onDisableClick,
  isLoading,
}: MfaStatusCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`
            w-12 h-12 rounded-xl flex items-center justify-center text-2xl
            ${mfaEnabled ? 'bg-emerald-500/20' : 'bg-amber-500/20'}
          `}
          >
            {mfaEnabled ? '🔒' : '🔓'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--admin-text)]">
              Autenticación de Dos Factores (2FA)
            </h3>
            <p className="text-sm text-[var(--admin-text-muted)] mt-1 max-w-md">
              {mfaEnabled
                ? 'Tu cuenta está protegida con autenticación de dos factores. Necesitarás tu app de autenticación para iniciar sesión.'
                : 'Agrega una capa extra de seguridad a tu cuenta. Requerirás un código de tu app de autenticación además de tu contraseña.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`
            text-xs font-medium px-3 py-1.5 rounded-full
            ${mfaEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}
          `}
          >
            {mfaEnabled ? 'Habilitado' : 'Deshabilitado'}
          </span>

          {mfaEnabled ? (
            <button
              onClick={onDisableClick}
              disabled={isLoading}
              className="
                px-4 py-2 rounded-xl
                bg-red-500/10 border border-red-500/30
                text-red-400 hover:bg-red-500/20
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors text-sm font-medium
              "
            >
              Deshabilitar
            </button>
          ) : (
            <button
              onClick={onEnableClick}
              disabled={isLoading}
              className="
                px-4 py-2 rounded-xl
                bg-[var(--admin-accent)]/20 border border-[var(--admin-accent)]/30
                text-[var(--admin-accent)] hover:bg-[var(--admin-accent)]/30
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors text-sm font-medium
                flex items-center gap-2
              "
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Cargando...
                </>
              ) : (
                'Habilitar 2FA'
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
