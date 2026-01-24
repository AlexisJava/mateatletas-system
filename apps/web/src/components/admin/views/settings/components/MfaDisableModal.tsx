'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface MfaDisableModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDisabling: boolean;
  error: string | null;
}

/**
 * MfaDisableModal - Modal de confirmación para deshabilitar MFA
 */
export function MfaDisableModal({
  isOpen,
  onConfirm,
  onCancel,
  isDisabling,
  error,
}: MfaDisableModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[var(--admin-surface)] border border-white/[0.08] rounded-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <h2 className="text-lg font-semibold text-[var(--admin-text)]">Deshabilitar 2FA</h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <p className="text-sm text-[var(--admin-text-muted)]">
              Estás a punto de deshabilitar la autenticación de dos factores. Esto reducirá la
              seguridad de tu cuenta.
            </p>

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-sm text-red-400">
                Sin 2FA, cualquier persona con tu contraseña podría acceder a tu cuenta. Solo
                desactívalo si es absolutamente necesario.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={onCancel}
                disabled={isDisabling}
                className="
                  flex-1 px-4 py-3 rounded-xl
                  bg-white/[0.03] border border-white/[0.08]
                  text-[var(--admin-text)] hover:bg-white/[0.05]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors font-medium
                "
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                disabled={isDisabling}
                className="
                  flex-1 px-4 py-3 rounded-xl
                  bg-red-500 text-white
                  hover:bg-red-500/90
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors font-medium flex items-center justify-center gap-2
                "
              >
                {isDisabling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deshabilitando...
                  </>
                ) : (
                  'Sí, deshabilitar'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
