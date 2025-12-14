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

export interface DocenteLoginResult {
  access_token: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    titulo: string | null;
    bio: string | null;
    role: Role;
    roles: Role[];
  };
}

// ============================================================================
// SERVICIO
// ============================================================================

/**
 * DocenteAuthService - Autenticación específica para docentes
 *
 * Responsabilidades:
 * - Login de docente por email/password
 * - Validación de credenciales con timing attack protection
 * - Generación de token JWT
 * - Registro de intentos de login
 */
@Injectable()
export class DocenteAuthService {
  private readonly logger = new Logger(DocenteAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly loginAttemptService: LoginAttemptService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Autentica un docente con email y password
   *
   * @param email - Email del docente
   * @param password - Contraseña del docente
   * @param ip - IP del cliente (para rate limiting)
   * @returns Token JWT y datos del docente
   * @throws UnauthorizedException si las credenciales son inválidas
   */
  async login(
    email: string,
    password: string,
    ip: string = 'unknown',
  ): Promise<DocenteLoginResult> {
    // 1. Buscar docente por email
    const docente = await this.prisma.docente.findUnique({
      where: { email },
    });

    // 2. Verificar password con timing attack protection
    const verificationResult =
      await this.passwordService.verifyWithTimingProtection(
        password,
        docente?.password_hash ?? null,
      );

    // 3. Validar credenciales
    if (!docente || !verificationResult.isValid) {
      await this.loginAttemptService.checkAndRecordAttempt(email, ip, false);
      this.logger.warn(`Login fallido docente: email=${email}, ip=${ip}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 4. Registrar intento exitoso
    await this.loginAttemptService.checkAndRecordAttempt(email, ip, true);

    // 5. Verificar si necesita rehash
    if (verificationResult.needsRehash) {
      await this.upgradePasswordHash(docente.id, password);
    }

    // 6. Validar que el docente tenga email
    if (!docente.email) {
      throw new UnauthorizedException('El usuario no tiene email configurado');
    }

    // 7. Obtener roles
    const userRoles = parseUserRoles(docente.roles);
    const finalRoles = userRoles.length > 0 ? userRoles : [Role.DOCENTE];

    // 7. Generar token
    const accessToken = this.tokenService.generateAccessToken(
      docente.id,
      docente.email,
      finalRoles,
    );

    // 8. Emitir evento de login
    this.eventEmitter.emit(
      'user.logged-in',
      new UserLoggedInEvent(docente.id, 'docente', docente.email, false),
    );

    this.logger.log(`Login exitoso docente: ${docente.id} (${docente.email})`);

    return {
      access_token: accessToken,
      user: {
        id: docente.id,
        email: docente.email,
        nombre: docente.nombre,
        apellido: docente.apellido,
        titulo: docente.titulo,
        bio: docente.bio,
        role: Role.DOCENTE,
        roles: finalRoles,
      },
    };
  }

  /**
   * Actualiza el hash de password cuando necesita rehash
   */
  private async upgradePasswordHash(
    docenteId: string,
    plainPassword: string,
  ): Promise<void> {
    const newHash = await this.passwordService.hash(plainPassword);
    await this.prisma.docente.update({
      where: { id: docenteId },
      data: { password_hash: newHash },
    });
    this.logger.log(`Password hash upgraded for docente ${docenteId}`);
  }
}
