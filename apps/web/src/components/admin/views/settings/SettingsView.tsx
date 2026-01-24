'use client';

import { motion } from 'framer-motion';
import { useMfaSettings } from './hooks';
import { MfaStatusCard, MfaSetupModal, MfaDisableModal } from './components';
import { useAuthStore } from '@/store/auth.store';

/**
 * SettingsView - Vista de configuración del userWithMfa
 * Incluye gestión de MFA y otras configuraciones de cuenta
 */
export function SettingsView() {
  const { user } = useAuthStore();
  const mfa = useMfaSettings();

  // Type assertion para acceder a mfaEnabled (solo disponible para userWithMfas)
  const userWithMfa = user as { mfaEnabled?: boolean; email?: string; role?: string } | null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-[var(--userWithMfa-text)]">Configuración</h1>
          <p className="text-sm text-[var(--userWithMfa-text-muted)] mt-1">
            Administra la seguridad y preferencias de tu cuenta
          </p>
        </div>
      </motion.div>

      {/* Sección de Seguridad */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold text-[var(--userWithMfa-text)] flex items-center gap-2">
          <span className="text-xl">🛡️</span>
          Seguridad
        </h2>

        {/* Card de estado MFA */}
        <MfaStatusCard
          mfaEnabled={userWithMfa?.mfaEnabled ?? false}
          onEnableClick={mfa.startSetup}
          onDisableClick={mfa.startDisable}
          isLoading={mfa.isSettingUp}
        />

        {/* Info adicional de seguridad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Última actividad */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <span className="text-lg">📅</span>
              </div>
              <h3 className="font-medium text-[var(--userWithMfa-text)]">Información de Cuenta</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--userWithMfa-text-muted)]">Email</span>
                <span className="text-[var(--userWithMfa-text)]">{userWithMfa?.email ?? '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--userWithMfa-text-muted)]">Rol</span>
                <span className="text-[var(--userWithMfa-text)] capitalize">
                  {userWithMfa?.role?.toLowerCase() ?? '-'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Tips de seguridad */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <span className="text-lg">💡</span>
              </div>
              <h3 className="font-medium text-[var(--userWithMfa-text)]">Tips de Seguridad</h3>
            </div>
            <ul className="space-y-2 text-sm text-[var(--userWithMfa-text-muted)]">
              <li className="flex items-center gap-2">
                <span className={userWithMfa?.mfaEnabled ? 'text-emerald-400' : 'text-amber-400'}>
                  {userWithMfa?.mfaEnabled ? '✓' : '○'}
                </span>
                Habilitar autenticación 2FA
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Usar contraseña fuerte
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                No compartir credenciales
              </li>
            </ul>
          </motion.div>
        </div>
      </motion.section>

      {/* Modales */}
      <MfaSetupModal
        isOpen={mfa.showSetupModal}
        setupData={mfa.setupData}
        verificationCode={mfa.verificationCode}
        onVerificationCodeChange={mfa.setVerificationCode}
        onVerify={mfa.verifyAndEnable}
        onConfirmBackup={mfa.confirmBackupCodes}
        onCancel={mfa.cancelSetup}
        isVerifying={mfa.isVerifying}
        error={mfa.error}
      />

      <MfaDisableModal
        isOpen={mfa.showDisableModal}
        onConfirm={mfa.confirmDisable}
        onCancel={mfa.cancelSetup}
        isDisabling={mfa.isDisabling}
        error={mfa.error}
      />
    </div>
  );
}
