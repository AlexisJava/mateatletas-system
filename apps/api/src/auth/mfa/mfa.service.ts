import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * Configuración de MFA result
 */
export interface MfaSetupResult {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

/**
 * MFA Service
 *
 * Implementa Multi-Factor Authentication (MFA) usando TOTP (Time-based One-Time Password)
 * Compatible con Google Authenticator, Microsoft Authenticator, Authy, etc.
 *
 * SEGURIDAD:
 * - ✅ TOTP con 30 segundos de ventana
 * - ✅ Secrets únicos por usuario
 * - ✅ Backup codes para recuperación
 * - ✅ Verificación de código antes de habilitar MFA
 * - ✅ Rate limiting implementado en controller
 *
 * @module auth/mfa
 */
@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);
  private readonly APP_NAME = 'Mateatletas';

  constructor(private readonly prisma: PrismaService) {
    // Configurar TOTP con opciones seguras
    authenticator.options = {
      window: 1, // Acepta 1 código antes/después (tolerancia de 30s)
      step: 30, // Cambio de código cada 30 segundos
    };
  }

  /**
   * Genera un secret TOTP y QR code para configurar MFA
   *
   * Flujo:
   * 1. Genera secret aleatorio criptográficamente seguro
   * 2. Crea URI otpauth:// para apps authenticator
   * 3. Genera QR code en formato Data URL
   * 4. Genera 8 backup codes para recuperación
   *
   * @param userId - ID del usuario
   * @param userEmail - Email del usuario (aparece en la app)
   * @returns Secret, QR code URL y backup codes
   */
  async setupMfa(userId: string, userEmail: string): Promise<MfaSetupResult> {
    this.logger.log(`🔐 Iniciando setup MFA para usuario: ${userId}`);

    // 1. Generar secret criptográficamente seguro
    const secret = authenticator.generateSecret();

    // 2. Crear otpauth:// URI para apps authenticator
    const otpauthUrl = authenticator.keyuri(
      userEmail, // Account name (aparece en la app)
      this.APP_NAME, // Issuer (nombre de la app)
      secret,
    );

    // 3. Generar QR code como Data URL (base64)
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

    // 4. Generar backup codes para recuperación
    const backupCodes = this.generateBackupCodes(8);

    this.logger.log(`✅ MFA setup generado para usuario: ${userId}`);

    return {
      secret,
      qrCodeUrl,
      backupCodes,
    };
  }

  /**
   * Habilita MFA para un usuario después de verificar el código
   *
   * IMPORTANTE: Se debe verificar el código ANTES de habilitar MFA
   * para asegurar que el usuario configuró correctamente la app.
   *
   * @param userId - ID del usuario
   * @param secret - Secret TOTP generado en setupMfa
   * @param token - Código de 6 dígitos ingresado por el usuario
   * @param backupCodes - Códigos de backup hasheados
   * @returns true si se habilitó correctamente
   * @throws BadRequestException si el token es inválido
   */
  async enableMfa(
    userId: string,
    secret: string,
    token: string,
    backupCodes: string[],
  ): Promise<boolean> {
    this.logger.log(`🔐 Habilitando MFA para usuario: ${userId}`);

    // 1. Verificar que el token sea válido
    const isValid = this.verifyToken(secret, token);

    if (!isValid) {
      this.logger.warn(`❌ Token MFA inválido para usuario: ${userId}`);
      throw new BadRequestException(
        'Código de verificación inválido. Verifica que el código sea correcto y no haya expirado.',
      );
    }

    // 2. Guardar secret y backup codes en la base de datos
    // El rol del usuario determina dónde se guarda:
    // - Admin → tabla Admin
    // - Docente → tabla Docente
    // - Tutor → tabla Tutor

    // Por simplicidad, asumimos que el MFA se implementa primero para Admins
    // Se puede extender a otros roles después

    await this.prisma.admin.update({
      where: { id: userId },
      data: {
        mfa_secret: secret,
        mfa_enabled: true,
        mfa_backup_codes: backupCodes, // Array de codes hasheados
      },
    });

    this.logger.log(`✅ MFA habilitado exitosamente para usuario: ${userId}`);

    return true;
  }

  /**
   * Deshabilita MFA para un usuario
   *
   * @param userId - ID del usuario
   * @returns true si se deshabilitó correctamente
   */
  async disableMfa(userId: string): Promise<boolean> {
    this.logger.log(`🔓 Deshabilitando MFA para usuario: ${userId}`);

    await this.prisma.admin.update({
      where: { id: userId },
      data: {
        mfa_secret: null,
        mfa_enabled: false,
        mfa_backup_codes: [],
      },
    });

    this.logger.log(`✅ MFA deshabilitado para usuario: ${userId}`);

    return true;
  }

  /**
   * Verifica un token TOTP
   *
   * @param secret - Secret del usuario
   * @param token - Código de 6 dígitos
   * @returns true si el token es válido
   */
  verifyToken(secret: string, token: string): boolean {
    try {
      return authenticator.verify({ token, secret });
    } catch (error) {
      this.logger.error(`Error verificando token TOTP: ${error}`);
      return false;
    }
  }

  /**
   * Verifica un backup code
   *
   * IMPORTANTE: Los backup codes son de un solo uso.
   * Después de usarse, deben eliminarse de la base de datos.
   *
   * @param userId - ID del usuario
   * @param backupCode - Código de backup ingresado
   * @returns true si el código es válido
   */
  async verifyBackupCode(userId: string, backupCode: string): Promise<boolean> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: userId },
      select: { mfa_backup_codes: true },
    });

    if (!admin || !admin.mfa_backup_codes) {
      return false;
    }

    // Los backup codes se guardan hasheados (similar a passwords)
    const bcrypt = require('bcrypt');

    for (const [index, hashedCode] of admin.mfa_backup_codes.entries()) {
      const isValid = await bcrypt.compare(backupCode, hashedCode);

      if (isValid) {
        // ✅ Código válido - Eliminarlo de la lista (un solo uso)
        const updatedCodes = admin.mfa_backup_codes.filter(
          (_, i) => i !== index,
        );

        await this.prisma.admin.update({
          where: { id: userId },
          data: { mfa_backup_codes: updatedCodes },
        });

        this.logger.log(
          `✅ Backup code usado exitosamente para usuario: ${userId}`,
        );

        return true;
      }
    }

    this.logger.warn(`❌ Backup code inválido para usuario: ${userId}`);
    return false;
  }

  /**
   * Genera códigos de backup aleatorios
   *
   * Formato: XXXX-XXXX-XXXX-XXXX (16 caracteres alfanuméricos)
   *
   * @param count - Número de códigos a generar
   * @returns Array de códigos en texto plano (deben ser hasheados antes de guardar)
   */
  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      const code = this.generateRandomCode(16);
      const formatted = this.formatBackupCode(code);
      codes.push(formatted);
    }

    return codes;
  }

  /**
   * Genera un código aleatorio criptográficamente seguro
   *
   * @param length - Longitud del código
   * @returns Código alfanumérico en mayúsculas
   */
  private generateRandomCode(length: number): string {
    const crypto = require('crypto');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    // Generar bytes aleatorios criptográficamente seguros
    const randomBytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
      code += chars[randomBytes[i] % chars.length];
    }

    return code;
  }

  /**
   * Formatea un código de backup con guiones
   *
   * Ejemplo: ABCD1234EFGH5678 → ABCD-1234-EFGH-5678
   *
   * @param code - Código sin formato
   * @returns Código formateado con guiones
   */
  private formatBackupCode(code: string): string {
    const parts: string[] = [];

    for (let i = 0; i < code.length; i += 4) {
      parts.push(code.substring(i, i + 4));
    }

    return parts.join('-');
  }

  /**
   * Verifica si un usuario tiene MFA habilitado
   *
   * @param userId - ID del usuario
   * @returns true si el usuario tiene MFA activo
   */
  async isMfaEnabled(userId: string): Promise<boolean> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: userId },
      select: { mfa_enabled: true },
    });

    return admin?.mfa_enabled ?? false;
  }

  /**
   * Obtiene el secret MFA de un usuario
   *
   * @param userId - ID del usuario
   * @returns Secret TOTP o null si no tiene MFA
   */
  async getMfaSecret(userId: string): Promise<string | null> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: userId },
      select: { mfa_secret: true },
    });

    return admin?.mfa_secret ?? null;
  }
}
