'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MfaSetupResult } from '@/lib/api/mfa.api';

type SetupStep = 'qr' | 'verify' | 'backup';

interface MfaSetupModalProps {
  isOpen: boolean;
  setupData: MfaSetupResult | null;
  verificationCode: string;
  onVerificationCodeChange: (code: string) => void;
  onVerify: () => void;
  onConfirmBackup: () => void;
  onCancel: () => void;
  isVerifying: boolean;
  error: string | null;
}

/**
 * MfaSetupModal - Modal de configuración de MFA paso a paso
 */
export function MfaSetupModal({
  isOpen,
  setupData,
  verificationCode,
  onVerificationCodeChange,
  onVerify,
  onConfirmBackup,
  onCancel,
  isVerifying,
  error,
}: MfaSetupModalProps) {
  const [step, setStep] = useState<SetupStep>('qr');
  const [backupConfirmed, setBackupConfirmed] = useState(false);

  if (!isOpen || !setupData) return null;

  const handleVerify = async () => {
    await onVerify();
    // Si no hay error, avanzamos al paso de backup
    if (!error) {
      setStep('backup');
    }
  };

  const handleConfirmBackup = () => {
    onConfirmBackup();
  };

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
          className="bg-[var(--admin-surface)] border border-white/[0.08] rounded-2xl w-full max-w-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔐</span>
              <h2 className="text-lg font-semibold text-[var(--admin-text)]">
                Configurar Autenticación 2FA
              </h2>
            </div>
            <button
              onClick={onCancel}
              className="p-1 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              <svg
                className="w-5 h-5 text-[var(--admin-text-muted)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-3 border-b border-white/[0.05] flex items-center gap-4">
            {(['qr', 'verify', 'backup'] as const).map((s, index) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${
                    step === s
                      ? 'bg-[var(--admin-accent)] text-white'
                      : index < ['qr', 'verify', 'backup'].indexOf(step)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/[0.1] text-[var(--admin-text-muted)]'
                  }
                `}
                >
                  {index < ['qr', 'verify', 'backup'].indexOf(step) ? '✓' : index + 1}
                </div>
                <span
                  className={`text-xs ${step === s ? 'text-[var(--admin-text)]' : 'text-[var(--admin-text-muted)]'}`}
                >
                  {s === 'qr' && 'Escanear'}
                  {s === 'verify' && 'Verificar'}
                  {s === 'backup' && 'Códigos'}
                </span>
                {index < 2 && <div className="w-8 h-px bg-white/[0.1] ml-2" />}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: QR Code */}
            {step === 'qr' && (
              <div className="text-center space-y-4">
                <p className="text-sm text-[var(--admin-text-muted)]">
                  Escanea este código QR con tu app de autenticación (Google Authenticator, Authy,
                  etc.)
                </p>

                <div className="bg-white rounded-xl p-4 inline-block mx-auto">
                  <img src={setupData.qrCodeUrl} alt="Código QR para MFA" className="w-48 h-48" />
                </div>

                <div className="bg-white/[0.03] rounded-xl p-4">
                  <p className="text-xs text-[var(--admin-text-muted)] mb-2">
                    ¿No puedes escanear? Ingresa este código manualmente:
                  </p>
                  <code className="text-sm font-mono text-[var(--admin-accent)] bg-[var(--admin-accent)]/10 px-3 py-1.5 rounded break-all">
                    {setupData.secret}
                  </code>
                </div>

                <button
                  onClick={() => setStep('verify')}
                  className="
                    w-full px-4 py-3 rounded-xl
                    bg-[var(--admin-accent)] text-white
                    hover:bg-[var(--admin-accent)]/90
                    transition-colors font-medium
                  "
                >
                  Siguiente: Verificar código
                </button>
              </div>
            )}

            {/* Step 2: Verify */}
            {step === 'verify' && (
              <div className="space-y-4">
                <p className="text-sm text-[var(--admin-text-muted)] text-center">
                  Ingresa el código de 6 dígitos de tu app de autenticación
                </p>

                <div className="flex justify-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => onVerificationCodeChange(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="
                      w-48 px-4 py-4 text-center text-2xl font-mono tracking-[0.5em]
                      bg-white/[0.03] border border-white/[0.08] rounded-xl
                      text-[var(--admin-text)] placeholder-[var(--admin-text-muted)]/30
                      focus:outline-none focus:border-[var(--admin-accent)]/50
                      transition-colors
                    "
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('qr')}
                    className="
                      flex-1 px-4 py-3 rounded-xl
                      bg-white/[0.03] border border-white/[0.08]
                      text-[var(--admin-text-muted)] hover:bg-white/[0.05]
                      transition-colors font-medium
                    "
                  >
                    Atrás
                  </button>
                  <button
                    onClick={handleVerify}
                    disabled={verificationCode.length !== 6 || isVerifying}
                    className="
                      flex-1 px-4 py-3 rounded-xl
                      bg-[var(--admin-accent)] text-white
                      hover:bg-[var(--admin-accent)]/90
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors font-medium flex items-center justify-center gap-2
                    "
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      'Verificar y Continuar'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Backup Codes */}
            {step === 'backup' && (
              <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="text-sm font-medium text-amber-400">¡Guarda estos códigos!</p>
                      <p className="text-xs text-amber-400/80 mt-1">
                        Si pierdes acceso a tu app de autenticación, estos códigos son la única
                        forma de recuperar tu cuenta. Cada código solo puede usarse una vez.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.03] rounded-xl p-4">
                  <p className="text-xs text-[var(--admin-text-muted)] mb-3">
                    Códigos de recuperación (copia y guarda en lugar seguro):
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {setupData.backupCodes.map((code, index) => (
                      <code
                        key={index}
                        className="text-sm font-mono text-[var(--admin-text)] bg-black/20 px-3 py-2 rounded text-center"
                      >
                        {code}
                      </code>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={backupConfirmed}
                    onChange={(e) => setBackupConfirmed(e.target.checked)}
                    className="w-5 h-5 rounded border-white/[0.2] bg-white/[0.05] text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                  />
                  <span className="text-sm text-[var(--admin-text)]">
                    Confirmo que he guardado estos códigos de recuperación
                  </span>
                </label>

                <button
                  onClick={handleConfirmBackup}
                  disabled={!backupConfirmed}
                  className="
                    w-full px-4 py-3 rounded-xl
                    bg-emerald-500 text-white
                    hover:bg-emerald-500/90
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors font-medium flex items-center justify-center gap-2
                  "
                >
                  <span>✓</span>
                  Completar configuración
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
