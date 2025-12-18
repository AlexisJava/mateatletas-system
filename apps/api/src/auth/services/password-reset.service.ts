import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../../core/database/prisma.service';
import { EmailService } from '../../email/email.service';
import { PasswordService } from './password.service';
import { UserLookupService, UserType } from './user-lookup.service';

/**
 * PasswordResetService - Flujo de "Olvidé mi contraseña"
 *
 * Flujo completo:
 * 1. Usuario solicita reset con su email
 * 2. Se genera token único (32 bytes random, hasheado con SHA256)
 * 3. Se envía email con link de reset
 * 4. Usuario hace clic en link y establece nueva contraseña
 * 5. Token se marca como usado (single-use)
 *
 * Seguridad:
 * - Tokens expiran en 1 hora
 * - Tokens son de un solo uso
 * - Se almacena hash del token (no texto plano)
 * - Rate limiting en endpoint (manejado por Throttle)
 * - No revelar si el email existe o no
 */
@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);
  private readonly frontendUrl: string;
  private readonly tokenExpirationMinutes = 60; // 1 hora

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly passwordService: PasswordService,
    private readonly userLookupService: UserLookupService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  /**
   * Solicita un reset de password
   *
   * IMPORTANTE: Siempre retorna éxito para no revelar si el email existe
   *
   * @param email - Email del usuario
   * @returns Mensaje genérico de éxito
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Buscar usuario por email
    const userResult =
      await this.userLookupService.findByEmail(normalizedEmail);

    if (!userResult) {
      // NO revelar que el email no existe (seguridad)
      this.logger.log(
        `Password reset solicitado para email no existente: ${normalizedEmail}`,
      );
      return {
        message:
          'Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.',
      };
    }

    // 2. Invalidar tokens anteriores no usados
    await this.invalidatePreviousTokens(normalizedEmail);

    // 3. Generar nuevo token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = this.hashToken(rawToken);
    const expiresAt = new Date(
      Date.now() + this.tokenExpirationMinutes * 60 * 1000,
    );

    // 4. Guardar token en DB
    await this.prisma.passwordResetToken.create({
      data: {
        email: normalizedEmail,
        token: hashedToken,
        user_type: userResult.userType,
        expiresAt,
        used: false,
      },
    });

    // 5. Construir URL de reset
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;

    // 6. Enviar email
    const emailSent = await this.emailService.sendPasswordResetEmail(
      normalizedEmail,
      resetUrl,
      userResult.user.nombre,
    );

    if (emailSent) {
      this.logger.log(
        `Email de password reset enviado a ${normalizedEmail} (${userResult.userType})`,
      );
    } else {
      this.logger.error(
        `Error enviando email de password reset a ${normalizedEmail}`,
      );
    }

    return {
      message:
        'Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.',
    };
  }

  /**
   * Verifica si un token de reset es válido
   *
   * @param token - Token raw (no hasheado)
   * @param email - Email asociado al token
   * @returns true si el token es válido
   */
  async verifyResetToken(token: string, email: string): Promise<boolean> {
    const hashedToken = this.hashToken(token);
    const normalizedEmail = email.toLowerCase().trim();

    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        email: normalizedEmail,
        token: hashedToken,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return !!resetToken;
  }

  /**
   * Completa el reset de password
   *
   * @param token - Token raw de reset
   * @param email - Email del usuario
   * @param newPassword - Nueva contraseña
   * @returns Mensaje de éxito
   * @throws BadRequestException si el token es inválido o expirado
   */
  async resetPassword(
    token: string,
    email: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const hashedToken = this.hashToken(token);
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Buscar token válido
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        email: normalizedEmail,
        token: hashedToken,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!resetToken) {
      this.logger.warn(
        `Intento de reset con token inválido para ${normalizedEmail}`,
      );
      throw new BadRequestException(
        'El enlace de recuperación es inválido o ha expirado. Por favor, solicita uno nuevo.',
      );
    }

    // 2. Buscar usuario
    const userResult =
      await this.userLookupService.findByEmail(normalizedEmail);

    if (!userResult) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 3. Validar nueva contraseña
    const strengthResult = this.passwordService.validateStrength(newPassword);
    if (!strengthResult.valid) {
      throw new BadRequestException(
        strengthResult.errors?.join('. ') || 'Contraseña no válida',
      );
    }

    // 4. Hashear nueva contraseña
    const newHash = await this.passwordService.hash(newPassword);

    // 5. Actualizar contraseña según tipo de usuario
    await this.updateUserPassword(
      userResult.user.id,
      resetToken.user_type as UserType,
      newHash,
    );

    // 6. Marcar token como usado
    await this.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    // 7. Invalidar todos los otros tokens de este email
    await this.invalidatePreviousTokens(normalizedEmail);

    this.logger.log(
      `Password reset completado para ${normalizedEmail} (${resetToken.user_type})`,
    );

    return {
      message:
        'Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.',
    };
  }

  /**
   * Hashea un token con SHA256
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Invalida todos los tokens anteriores de un email
   */
  private async invalidatePreviousTokens(email: string): Promise<void> {
    await this.prisma.passwordResetToken.updateMany({
      where: {
        email,
        used: false,
      },
      data: {
        used: true,
      },
    });
  }

  /**
   * Actualiza la contraseña de un usuario
   */
  private async updateUserPassword(
    userId: string,
    userType: UserType,
    newHash: string,
  ): Promise<void> {
    const updateData = {
      password_hash: newHash,
      fecha_ultimo_cambio: new Date(),
    };

    switch (userType) {
      case 'estudiante':
        await this.prisma.estudiante.update({
          where: { id: userId },
          data: updateData,
        });
        break;
      case 'tutor':
        await this.prisma.tutor.update({
          where: { id: userId },
          data: updateData,
        });
        break;
      case 'docente':
        await this.prisma.docente.update({
          where: { id: userId },
          data: updateData,
        });
        break;
      case 'admin':
        await this.prisma.admin.update({
          where: { id: userId },
          data: updateData,
        });
        break;
    }
  }

  /**
   * Limpia tokens expirados (para cron job)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.prisma.passwordResetToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { used: true }],
      },
    });

    if (result.count > 0) {
      this.logger.log(
        `Limpiados ${result.count} tokens de password reset expirados/usados`,
      );
    }

    return result.count;
  }
}
