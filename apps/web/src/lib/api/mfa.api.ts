import apiClient from '../axios';

// ============================================================================
// MFA (Multi-Factor Authentication) API
// ============================================================================

/** Resultado del setup de MFA */
export interface MfaSetupResult {
  /** Secret TOTP (para mostrar manualmente si QR no funciona) */
  secret: string;
  /** QR Code como data URL base64 */
  qrCodeUrl: string;
  /** 8 códigos de backup (formato XXXX-XXXX-XXXX-XXXX) */
  backupCodes: string[];
}

/** DTO para habilitar MFA */
export interface EnableMfaDto {
  /** Secret recibido en setup */
  secret: string;
  /** Código TOTP de 6 dígitos */
  token: string;
  /** Códigos de backup recibidos en setup */
  backupCodes: string[];
}

/** Respuesta de operaciones MFA */
export interface MfaResponse {
  success: boolean;
  message: string;
}

/**
 * Iniciar setup de MFA
 * Genera QR code y códigos de backup
 * POST /auth/mfa/setup
 */
export const setupMfa = async (): Promise<MfaSetupResult> => {
  try {
    return await apiClient.post<MfaSetupResult>('/auth/mfa/setup');
  } catch (error) {
    console.error('Error al iniciar setup de MFA:', error);
    throw error;
  }
};

/**
 * Habilitar MFA después de verificar código
 * POST /auth/mfa/enable
 */
export const enableMfa = async (dto: EnableMfaDto): Promise<MfaResponse> => {
  try {
    return await apiClient.post<MfaResponse>('/auth/mfa/enable', dto);
  } catch (error) {
    console.error('Error al habilitar MFA:', error);
    throw error;
  }
};

/**
 * Deshabilitar MFA
 * DELETE /auth/mfa
 */
export const disableMfa = async (): Promise<MfaResponse> => {
  try {
    return await apiClient.delete<MfaResponse>('/auth/mfa');
  } catch (error) {
    console.error('Error al deshabilitar MFA:', error);
    throw error;
  }
};

/**
 * Verificar código MFA durante login
 * POST /auth/mfa/verify
 */
export const verifyMfaCode = async (token?: string, backupCode?: string): Promise<MfaResponse> => {
  try {
    return await apiClient.post<MfaResponse>('/auth/mfa/verify', {
      token,
      backupCode,
    });
  } catch (error) {
    console.error('Error al verificar código MFA:', error);
    throw error;
  }
};
