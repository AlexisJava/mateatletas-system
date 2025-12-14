import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../core/database/prisma.service';
import { Role } from '../decorators/roles.decorator';
import { parseUserRoles } from '../../common/utils/role.utils';
import { UserLoggedInEvent } from '../../common/events';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';

/**
 * Resultado del login MFA completado
 */
export interface CompleteMfaLoginResult {
  access_token: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    fecha_registro: Date;
    dni: string | null;
    telefono: string | null;
    role: string;
    roles: string[];
  };
}

/**
 * Payload del token MFA temporal
 */
interface MfaTokenPayload {
  sub: string;
  email: string;
  type: string;
}

/**
 * Use Case: Completar Login MFA
 *
 * RESPONSABILIDAD ÚNICA:
 * - Verificar token MFA temporal
 * - Validar código TOTP o backup code
 * - Generar JWT final
 * - Emitir evento de login exitoso
 *
 * SEGURIDAD:
 * - TOTP con ventana de 1 (30 segundos)
 * - Backup codes de un solo uso
 * - Logging de intentos fallidos
 */
@Injectable()
export class CompleteMfaLoginUseCase {
  private readonly logger = new Logger(CompleteMfaLoginUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    // Configurar authenticator
    authenticator.options = {
      window: 1,
      step: 30,
    };
  }

  /**
   * Completa el login verificando el código MFA
   *
   * @param mfaToken - Token temporal MFA recibido en el login inicial
   * @param totpCode - Código TOTP de 6 dígitos (opcional)
   * @param backupCode - Código de backup (opcional)
   * @returns Token JWT final y datos del usuario
   * @throws UnauthorizedException si el token es inválido o el código es incorrecto
   */
  async execute(
    mfaToken: string,
    totpCode?: string,
    backupCode?: string,
  ): Promise<CompleteMfaLoginResult> {
    // 1. Verificar y decodificar el token temporal MFA
    const payload = this.verifyMfaToken(mfaToken);

    // 2. Obtener el admin de la base de datos
    const admin = await this.findAdmin(payload.sub);

    // 3. Verificar que MFA esté habilitado
    this.validateMfaEnabled(admin);

    // 4. Verificar el código TOTP o backup code
    await this.verifyCode(admin, totpCode, backupCode);

    // 5. Generar token JWT final
    const userRoles = parseUserRoles(admin.roles);
    const finalRoles = userRoles.length > 0 ? userRoles : [Role.ADMIN];

    const accessToken = this.generateJwtToken(
      admin.id,
      admin.email,
      finalRoles,
    );

    // 6. Emitir evento de login exitoso
    this.eventEmitter.emit(
      'user.logged-in',
      new UserLoggedInEvent(admin.id, 'admin', admin.email, false),
    );

    this.logger.log(`✅ Login MFA completado exitosamente para ${admin.email}`);

    // 7. Retornar token y datos del usuario
    return {
      access_token: accessToken,
      user: {
        id: admin.id,
        email: admin.email,
        nombre: admin.nombre,
        apellido: admin.apellido,
        fecha_registro: admin.fecha_registro,
        dni: admin.dni ?? null,
        telefono: admin.telefono ?? null,
        role: Role.ADMIN,
        roles: finalRoles,
      },
    };
  }

  /**
   * Verifica y decodifica el token MFA temporal
   */
  private verifyMfaToken(mfaToken: string): MfaTokenPayload {
    let payload: MfaTokenPayload;

    try {
      payload = this.jwtService.verify(mfaToken);
    } catch {
      throw new UnauthorizedException('Token MFA inválido o expirado');
    }

    if (payload.type !== 'mfa_pending') {
      throw new UnauthorizedException('Token MFA inválido');
    }

    return payload;
  }

  /**
   * Busca el admin en la base de datos
   */
  private async findAdmin(userId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: userId },
    });

    if (!admin) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return admin;
  }

  /**
   * Valida que MFA esté habilitado para el admin
   */
  private validateMfaEnabled(admin: {
    mfa_enabled: boolean;
    mfa_secret: string | null;
    email: string;
  }): void {
    if (!admin.mfa_enabled || !admin.mfa_secret) {
      throw new UnauthorizedException(
        'MFA no está habilitado para este usuario',
      );
    }
  }

  /**
   * Verifica el código TOTP o backup code
   */
  private async verifyCode(
    admin: {
      id: string;
      email: string;
      mfa_secret: string | null;
      mfa_backup_codes: string[];
    },
    totpCode?: string,
    backupCode?: string,
  ): Promise<void> {
    let isValid = false;

    if (totpCode && admin.mfa_secret) {
      // Verificar código TOTP
      isValid = authenticator.verify({
        token: totpCode,
        secret: admin.mfa_secret,
      });
    } else if (backupCode) {
      // Verificar backup code
      isValid = await this.verifyBackupCode(admin, backupCode);
    }

    if (!isValid) {
      this.logger.error(
        `❌ Código MFA inválido para usuario ${admin.email} (${admin.id})`,
      );
      throw new UnauthorizedException(
        'Código de verificación inválido. Por favor intenta nuevamente.',
      );
    }
  }

  /**
   * Verifica un código de backup y lo elimina si es válido
   */
  private async verifyBackupCode(
    admin: { id: string; email: string; mfa_backup_codes: string[] },
    backupCode: string,
  ): Promise<boolean> {
    for (const [index, hashedCode] of admin.mfa_backup_codes.entries()) {
      const isMatch = await bcrypt.compare(backupCode, hashedCode);
      if (isMatch) {
        // Eliminar el código usado (single-use)
        const updatedCodes = admin.mfa_backup_codes.filter(
          (_, i) => i !== index,
        );
        await this.prisma.admin.update({
          where: { id: admin.id },
          data: { mfa_backup_codes: updatedCodes },
        });
        this.logger.warn(
          `⚠️ Código de backup usado para ${admin.email}. Códigos restantes: ${updatedCodes.length}`,
        );
        return true;
      }
    }
    return false;
  }

  /**
   * Genera token JWT
   */
  private generateJwtToken(
    userId: string,
    email: string,
    roles: string[],
  ): string {
    const payload = {
      sub: userId,
      email,
      role: roles[0], // Backward compatibility
      roles,
    };

    return this.jwtService.sign(payload);
  }
}
