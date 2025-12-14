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

export interface TutorLoginResult {
  access_token: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    dni: string | null;
    telefono: string | null;
    fecha_registro: Date | null;
    ha_completado_onboarding: boolean;
    role: Role;
    roles: Role[];
  };
}

// ============================================================================
// SERVICIO
// ============================================================================

/**
 * TutorAuthService - Autenticación específica para tutores
 *
 * Responsabilidades:
 * - Login de tutor por email/password
 * - Validación de credenciales con timing attack protection
 * - Generación de token JWT
 * - Registro de intentos de login
 *
 * Dependencias:
 * - PasswordService: verificación de contraseñas
 * - TokenService: generación de JWT
 * - LoginAttemptService: protección contra brute force
 * - PrismaService: acceso a BD
 */
@Injectable()
export class TutorAuthService {
  private readonly logger = new Logger(TutorAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly loginAttemptService: LoginAttemptService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Autentica un tutor con email y password
   *
   * @param email - Email del tutor
   * @param password - Contraseña del tutor
   * @param ip - IP del cliente (para rate limiting)
   * @returns Token JWT y datos del tutor
   * @throws UnauthorizedException si las credenciales son inválidas
   */
  async login(
    email: string,
    password: string,
    ip: string = 'unknown',
  ): Promise<TutorLoginResult> {
    // 1. Buscar tutor por email
    const tutor = await this.prisma.tutor.findUnique({
      where: { email },
    });

    // 2. Verificar password con timing attack protection
    const verificationResult =
      await this.passwordService.verifyWithTimingProtection(
        password,
        tutor?.password_hash ?? null,
      );

    // 3. Validar credenciales
    if (!tutor || !verificationResult.isValid) {
      await this.loginAttemptService.checkAndRecordAttempt(email, ip, false);
      this.logger.warn(`Login fallido tutor: email=${email}, ip=${ip}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 4. Registrar intento exitoso
    await this.loginAttemptService.checkAndRecordAttempt(email, ip, true);

    // 5. Verificar si necesita rehash (upgrade de rounds)
    if (verificationResult.needsRehash) {
      await this.upgradePasswordHash(tutor.id, password);
    }

    // 6. Validar que el tutor tenga email
    if (!tutor.email) {
      throw new UnauthorizedException('El usuario no tiene email configurado');
    }

    // 7. Obtener roles
    const userRoles = parseUserRoles(tutor.roles);
    const finalRoles = userRoles.length > 0 ? userRoles : [Role.TUTOR];

    // 8. Generar token
    const accessToken = this.tokenService.generateAccessToken(
      tutor.id,
      tutor.email,
      finalRoles,
    );

    // 9. Emitir evento de login
    this.eventEmitter.emit(
      'user.logged-in',
      new UserLoggedInEvent(tutor.id, 'tutor', tutor.email, false),
    );

    this.logger.log(`Login exitoso tutor: ${tutor.id} (${tutor.email})`);

    return {
      access_token: accessToken,
      user: {
        id: tutor.id,
        email: tutor.email,
        nombre: tutor.nombre,
        apellido: tutor.apellido,
        dni: tutor.dni,
        telefono: tutor.telefono,
        fecha_registro: tutor.fecha_registro,
        ha_completado_onboarding: tutor.ha_completado_onboarding,
        role: Role.TUTOR,
        roles: finalRoles,
      },
    };
  }

  /**
   * Actualiza el hash de password cuando necesita rehash
   * (Por ejemplo, cuando se aumentan los rounds de bcrypt)
   */
  private async upgradePasswordHash(
    tutorId: string,
    plainPassword: string,
  ): Promise<void> {
    const newHash = await this.passwordService.hash(plainPassword);
    await this.prisma.tutor.update({
      where: { id: tutorId },
      data: { password_hash: newHash },
    });
    this.logger.log(`Password hash upgraded for tutor ${tutorId}`);
  }
}
