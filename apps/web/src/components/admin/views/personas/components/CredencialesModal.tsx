'use client';

import { X, Key, User, Copy, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface CredencialesModalProps {
  isOpen: boolean;
  onClose: () => void;
  nombre: string;
  apellido: string;
  username: string;
  pin: string | null; // null cuando no se ha regenerado
  isNewStudent?: boolean;
  estudianteId: string | null;
  onRegenerarPin?: (estudianteId: string) => Promise<void>;
}

/**
 * CredencialesModal - Modal para mostrar credenciales de estudiante
 *
 * Dos modos:
 * 1. Ver credenciales: Muestra username, con opción de regenerar PIN
 * 2. Estudiante nuevo: Muestra username y PIN generado automáticamente
 */
export function CredencialesModal({
  isOpen,
  onClose,
  nombre,
  apellido,
  username,
  pin,
  isNewStudent = false,
  estudianteId,
  onRegenerarPin,
}: CredencialesModalProps) {
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showConfirmRegenerar, setShowConfirmRegenerar] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const lineas = [
      `CREDENCIALES DE ${nombre.toUpperCase()} ${apellido.toUpperCase()}`,
      '',
      `Usuario: ${username}`,
    ];

    if (pin) {
      lineas.push(`PIN: ${pin}`);
    }

    navigator.clipboard.writeText(lineas.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRegenerarPin = async () => {
    if (!estudianteId || !onRegenerarPin) return;

    setIsRegenerating(true);
    try {
      await onRegenerarPin(estudianteId);
      setShowConfirmRegenerar(false);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--admin-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--admin-accent)]/20 flex items-center justify-center">
              <Key className="w-5 h-5 text-[var(--admin-accent)]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--admin-text)]">
                {isNewStudent ? 'Estudiante Creado' : 'Credenciales'}
              </h3>
              <p className="text-sm text-[var(--admin-text-muted)]">
                {nombre} {apellido}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--admin-text-muted)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {isNewStudent && (
            <div className="p-3 bg-[var(--status-success)]/10 border border-[var(--status-success)]/20 rounded-xl">
              <p className="text-sm text-[var(--status-success)]">
                El estudiante ha sido creado exitosamente.
              </p>
            </div>
          )}

          {/* Credentials */}
          <div className="space-y-3">
            {/* Username - siempre visible */}
            <div className="p-4 bg-[var(--admin-surface-2)] rounded-xl">
              <div className="flex items-center gap-2 text-[var(--admin-text-muted)] mb-2">
                <User className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Usuario</span>
              </div>
              <p className="text-xl font-mono font-bold text-[var(--admin-text)]">{username}</p>
            </div>

            {/* PIN - solo si existe */}
            {pin ? (
              <div className="p-4 bg-[var(--admin-surface-2)] rounded-xl">
                <div className="flex items-center gap-2 text-[var(--admin-text-muted)] mb-2">
                  <Key className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider">PIN</span>
                  {!isNewStudent && (
                    <span className="ml-auto text-xs text-amber-400">Recién generado</span>
                  )}
                </div>
                <p className="text-3xl font-mono font-bold text-[var(--admin-accent)] tracking-widest">
                  {pin}
                </p>
              </div>
            ) : (
              /* Sin PIN - mostrar opción de regenerar */
              <div className="p-4 bg-[var(--admin-surface-2)] rounded-xl">
                <div className="flex items-center gap-2 text-[var(--admin-text-muted)] mb-2">
                  <Key className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider">PIN</span>
                </div>
                <p className="text-sm text-[var(--admin-text-muted)] mb-3">
                  El PIN está encriptado y no se puede mostrar. Si el estudiante olvidó su PIN,
                  puede regenerar uno nuevo.
                </p>

                {!showConfirmRegenerar ? (
                  <button
                    onClick={() => setShowConfirmRegenerar(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg font-medium hover:bg-amber-500/20 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerar PIN
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-400">
                        El PIN anterior dejará de funcionar inmediatamente. El estudiante no podrá
                        iniciar sesión hasta que reciba el nuevo PIN.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowConfirmRegenerar(false)}
                        className="flex-1 px-3 py-2 bg-[var(--admin-surface-1)] text-[var(--admin-text-muted)] border border-[var(--admin-border)] rounded-lg text-sm hover:bg-[var(--admin-surface-2)] transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleRegenerarPin}
                        disabled={isRegenerating}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {isRegenerating ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Regenerando...
                          </>
                        ) : (
                          'Confirmar'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info */}
          <p className="text-xs text-[var(--admin-text-muted)] text-center">
            {pin
              ? 'Comparta estas credenciales de forma segura con el tutor del estudiante.'
              : 'El usuario puede usar estas credenciales para iniciar sesión.'}
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-[var(--admin-border)]">
          {pin && (
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--admin-surface-2)] text-[var(--admin-text)] rounded-xl font-medium hover:bg-[var(--admin-surface-1)] border border-[var(--admin-border)] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[var(--status-success)]" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar
                </>
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className={`${pin ? 'flex-1' : 'w-full'} px-4 py-2.5 bg-[var(--admin-accent)] text-black rounded-xl font-medium hover:opacity-90 transition-opacity`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default CredencialesModal;
