import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { LoginAttemptService } from './login-attempt.service';
import { PrismaService } from '../../core/database/prisma.service';
import { Role } from '../decorators/roles.decorator';
import { parseUserRoles } from '../../common/utils/role.utils';
import { UserLoggedInEvent } from '../../common/events';

// ============================================================================
// TIPOS DE RESULTADO
// ============================================================================

export interface AdminLoginResult {
  access_token: string;
  requires_mfa?: false;
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    fecha_registro: Date | null;
    role: Role;
    roles: Role[];
  };
}

export interface AdminMfaRequiredResult {
  requires_mfa: true;
  mfa_token: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
  };
  message: string;
}

export type AdminLoginResponse = AdminLoginResult | AdminMfaRequiredResult;

// ============================================================================
// TYPE GUARD
// ============================================================================

export function isMfaRequired(
  result: AdminLoginResponse,
): result is AdminMfaRequiredResult {
  return 'requires_mfa' in result && result.requires_mfa === true;
}

// ============================================================================
// SERVICIO
// ============================================================================

/**
 * AdminAuthService - Autenticación específica para administradores
 *
 * Responsabilidades:
 * - Login de admin por email/password
 * - Manejo de MFA (retorna token temporal si está habilitado)
 * - Validación de credenciales con timing attack protection
 * - Generación de token JWT
 */
@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly loginAttemptService: LoginAttemptService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Autentica un admin con email y password
   * Si tiene MFA habilitado, retorna un token temporal para verificación
   *
   * @param email - Email del admin
   * @param password - Contraseña del admin
   * @param ip - IP del cliente (para rate limiting)
   * @returns Token JWT o token MFA pendiente
   * @throws UnauthorizedException si las credenciales son inválidas
   */
  async login(
    email: string,
    password: string,
    ip: string = 'unknown',
  ): Promise<AdminLoginResponse> {
    // 1. Buscar admin por email
    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });

    // 2. Verificar password con timing attack protection
    const verificationResult =
      await this.passwordService.verifyWithTimingProtection(
        password,
        admin?.password_hash ?? null,
      );

    // 3. Validar credenciales
    if (!admin || !verificationResult.isValid) {
      await this.loginAttemptService.checkAndRecordAttempt(email, ip, false);
      this.logger.warn(`Login fallido admin: email=${email}, ip=${ip}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 4. Registrar intento exitoso
    await this.loginAttemptService.checkAndRecordAttempt(email, ip, true);

    // 5. Verificar si necesita rehash
    if (verificationResult.needsRehash) {
      await this.upgradePasswordHash(admin.id, password);
    }

    // 6. Validar que el admin tenga email
    if (!admin.email) {
      throw new UnauthorizedException('El usuario no tiene email configurado');
    }

    // 7. Si tiene MFA habilitado, retornar token temporal
    if (admin.mfa_enabled) {
      this.logger.log(`Admin ${admin.email} requiere verificación MFA`);

      const mfaToken = this.tokenService.generateMfaToken(
        admin.id,
        admin.email,
      );

      return {
        requires_mfa: true,
        mfa_token: mfaToken,
        user: {
          id: admin.id,
          email: admin.email,
          nombre: admin.nombre,
          apellido: admin.apellido,
        },
        message:
          'Verificación MFA requerida. Por favor ingresa tu código de autenticación.',
      };
    }

    // 7. Sin MFA: generar token normal
    const userRoles = parseUserRoles(admin.roles);
    const finalRoles = userRoles.length > 0 ? userRoles : [Role.ADMIN];

    const accessToken = this.tokenService.generateAccessToken(
      admin.id,
      admin.email,
      finalRoles,
    );

    // 8. Emitir evento de login
    this.eventEmitter.emit(
      'user.logged-in',
      new UserLoggedInEvent(admin.id, 'admin', admin.email, false),
    );

    this.logger.log(`Login exitoso admin: ${admin.id} (${admin.email})`);

    return {
      access_token: accessToken,
      user: {
        id: admin.id,
        email: admin.email,
        nombre: admin.nombre,
        apellido: admin.apellido,
        fecha_registro: admin.fecha_registro,
        role: Role.ADMIN,
        roles: finalRoles,
      },
    };
  }

  /**
   * Actualiza el hash de password cuando necesita rehash
   */
  private async upgradePasswordHash(
    adminId: string,
    plainPassword: string,
  ): Promise<void> {
    const newHash = await this.passwordService.hash(plainPassword);
    await this.prisma.admin.update({
      where: { id: adminId },
      data: { password_hash: newHash },
    });
    this.logger.log(`Password hash upgraded for admin ${adminId}`);
  }
}
