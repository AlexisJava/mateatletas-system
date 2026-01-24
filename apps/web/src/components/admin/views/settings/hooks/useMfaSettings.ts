'use client';

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { setupMfa, enableMfa, disableMfa, type MfaSetupResult } from '@/lib/api/mfa.api';
import { useAuthStore } from '@/store/auth.store';

type MfaStep = 'idle' | 'setup' | 'verify' | 'backup-codes' | 'enabled' | 'disable-confirm';

interface UseMfaSettingsReturn {
  // Estado actual
  mfaEnabled: boolean;
  currentStep: MfaStep;

  // Datos de setup
  setupData: MfaSetupResult | null;
  verificationCode: string;
  setVerificationCode: (code: string) => void;

  // Estados de carga
  isSettingUp: boolean;
  isVerifying: boolean;
  isDisabling: boolean;

  // Modal visibility (derivados de currentStep)
  showSetupModal: boolean;
  showDisableModal: boolean;

  // Errores
  error: string | null;
  clearError: () => void;

  // Acciones
  startSetup: () => Promise<void>;
  verifyAndEnable: () => Promise<void>;
  confirmBackupCodes: () => void;
  startDisable: () => void;
  confirmDisable: () => Promise<void>;
  cancelSetup: () => void;
}

/**
 * Hook para gestionar configuración de MFA
 */
export function useMfaSettings(): UseMfaSettingsReturn {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<MfaStep>('idle');
  const [setupData, setSetupData] = useState<MfaSetupResult | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  // El estado de MFA viene del usuario autenticado (admin)
  // El campo mfaEnabled se retorna del backend para admins
  const mfaEnabled = (user as { mfaEnabled?: boolean } | null)?.mfaEnabled ?? false;

  // Derivados para visibilidad de modales
  const showSetupModal =
    currentStep === 'setup' || currentStep === 'verify' || currentStep === 'backup-codes';
  const showDisableModal = currentStep === 'disable-confirm';

  // Mutation: Setup
  const setupMutation = useMutation({
    mutationFn: setupMfa,
    onSuccess: (data) => {
      setSetupData(data);
      setCurrentStep('setup');
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message || 'Error al iniciar configuración de MFA');
    },
  });

  // Mutation: Enable
  const enableMutation = useMutation({
    mutationFn: enableMfa,
    onSuccess: () => {
      setCurrentStep('backup-codes');
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message || 'Código inválido. Por favor verifica e intenta de nuevo.');
    },
  });

  // Mutation: Disable
  const disableMutation = useMutation({
    mutationFn: disableMfa,
    onSuccess: () => {
      setCurrentStep('idle');
      setSetupData(null);
      setError(null);
      // Aquí debería actualizarse el estado del usuario
      // Por ahora solo refrescamos la página
      window.location.reload();
    },
    onError: (err: Error) => {
      setError(err.message || 'Error al deshabilitar MFA');
    },
  });

  // Acciones
  const startSetup = useCallback(async () => {
    setError(null);
    await setupMutation.mutateAsync();
  }, [setupMutation]);

  const verifyAndEnable = useCallback(async () => {
    if (!setupData || verificationCode.length !== 6) {
      setError('Ingresa un código de 6 dígitos');
      return;
    }

    await enableMutation.mutateAsync({
      secret: setupData.secret,
      token: verificationCode,
      backupCodes: setupData.backupCodes,
    });
  }, [setupData, verificationCode, enableMutation]);

  const confirmBackupCodes = useCallback(() => {
    setCurrentStep('enabled');
    // Refrescar para obtener el nuevo estado del usuario
    window.location.reload();
  }, []);

  const startDisable = useCallback(() => {
    setCurrentStep('disable-confirm');
  }, []);

  const confirmDisable = useCallback(async () => {
    await disableMutation.mutateAsync();
  }, [disableMutation]);

  const cancelSetup = useCallback(() => {
    setCurrentStep('idle');
    setSetupData(null);
    setVerificationCode('');
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    mfaEnabled,
    currentStep,
    setupData,
    verificationCode,
    setVerificationCode,
    isSettingUp: setupMutation.isPending,
    isVerifying: enableMutation.isPending,
    isDisabling: disableMutation.isPending,
    showSetupModal,
    showDisableModal,
    error,
    clearError,
    startSetup,
    verifyAndEnable,
    confirmBackupCodes,
    startDisable,
    confirmDisable,
    cancelSetup,
  };
}
