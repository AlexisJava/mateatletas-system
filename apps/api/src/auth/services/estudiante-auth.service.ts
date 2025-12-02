import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { LoginAttemptService } from './login-attempt.service';
import { PrismaService } from '../../core/database/prisma.service';
import { Role } from '../decorators/roles.decorator';
import { parseUserRoles } from '../../common/utils/role.utils';
import {
  UserLoggedInEvent,
  EstudiantePrimerLoginEvent,
} from '../../common/events';

// ============================================================================
// TIPOS DE RESULTADO
// ============================================================================

export interface EstudianteLoginResult {
  access_token: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    edad: number;
    nivelEscolar: string;
    fotoUrl: string | null;
    avatarUrl: string | null;
    animacion_idle_url: string | null;
    puntos_totales: number;
    nivel_actual: number;
    equipo: {
      id: string;
      nombre: string;
      color_primario: string;
    } | null;
    tutor: {
      id: string;
      nombre: string;
      apellido: string;
      email: string | null;
    } | null;
    role: Role;
    roles: Role[];
    debe_cambiar_password: boolean;
  };
}

// ============================================================================
// SERVICIO
// ============================================================================

/**
 * EstudianteAuthService - Autenticación específica para estudiantes
 *
 * Responsabilidades:
 * - Login de estudiante por username/password
 * - Validación de credenciales con timing attack protection
 * - Generación de token JWT
 * - Detección de primer login
 * - Emisión de eventos para gamificación
 */
@Injectable()
export class EstudianteAuthService {
  private readonly logger = new Logger(EstudianteAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly loginAttemptService: LoginAttemptService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Autentica un estudiante con username y password
   *
   * @param username - Username del estudiante
   * @param password - Contraseña/PIN del estudiante
   * @param ip - IP del cliente (para rate limiting)
   * @returns Token JWT y datos del estudiante
   * @throws UnauthorizedException si las credenciales son inválidas
   */
  async login(
    username: string,
    password: string,
    ip: string = 'unknown',
  ): Promise<EstudianteLoginResult> {
    // 1. Buscar estudiante por username con relaciones
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { username },
      include: {
        tutor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        equipo: {
          select: {
            id: true,
            nombre: true,
            color_primario: true,
          },
        },
      },
    });

    // 2. Verificar password con timing attack protection
    const verificationResult = await this.passwordService.verifyWithTimingProtection(
      password,
      estudiante?.password_hash ?? null,
    );

    // 3. Validar credenciales
    if (!estudiante || !estudiante.username || !verificationResult.isValid) {
      await this.loginAttemptService.checkAndRecordAttempt(username, ip, false);
      this.logger.warn(`Login fallido estudiante: username=${username}, ip=${ip}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 4. Registrar intento exitoso
    await this.loginAttemptService.checkAndRecordAttempt(username, ip, true);

    // 5. Verificar si necesita rehash
    if (verificationResult.needsRehash) {
      await this.upgradePasswordHash(estudiante.id, password);
    }

    // 6. Obtener roles
    const userRoles = parseUserRoles(estudiante.roles);
    const finalRoles = userRoles.length > 0 ? userRoles : [Role.ESTUDIANTE];

    // 7. Generar token (usar username como identificador)
    const accessToken = this.tokenService.generateAccessToken(
      estudiante.id,
      estudiante.username,
      finalRoles,
    );

    // 8. Detectar primer login y emitir eventos
    await this.emitLoginEvents(estudiante);

    this.logger.log(`Login exitoso estudiante: ${estudiante.id} (${estudiante.username})`);

    return {
      access_token: accessToken,
      user: {
        id: estudiante.id,
        email: estudiante.email || estudiante.username,
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        edad: estudiante.edad,
        nivelEscolar: estudiante.nivelEscolar,
        fotoUrl: estudiante.fotoUrl,
        avatarUrl: estudiante.avatarUrl,
        animacion_idle_url: estudiante.animacion_idle_url,
        puntos_totales: estudiante.puntos_totales,
        nivel_actual: estudiante.nivel_actual,
        equipo: estudiante.equipo,
        tutor: estudiante.tutor,
        role: Role.ESTUDIANTE,
        roles: finalRoles,
        debe_cambiar_password: estudiante.debe_cambiar_password,
      },
    };
  }

  /**
   * Emite eventos de login para el sistema de gamificación
   */
  private async emitLoginEvents(estudiante: {
    id: string;
    username: string | null;
    email: string | null;
  }): Promise<void> {
    // Verificar si es primer login (no tiene logros desbloqueados)
    const logrosDesbloqueados = await this.prisma.logroEstudiante.count({
      where: { estudiante_id: estudiante.id },
    });

    const esPrimerLogin = logrosDesbloqueados === 0;

    // Emitir evento de login
    this.eventEmitter.emit(
      'estudiante.logged-in',
      new UserLoggedInEvent(
        estudiante.id,
        'estudiante',
        estudiante.email || estudiante.username || '',
        esPrimerLogin,
      ),
    );

    // Emitir evento específico de primer login si aplica
    if (esPrimerLogin) {
      this.eventEmitter.emit(
        'estudiante.primer-login',
        new EstudiantePrimerLoginEvent(
          estudiante.id,
          estudiante.username || estudiante.id,
        ),
      );
    }
  }

  /**
   * Actualiza el hash de password cuando necesita rehash
   */
  private async upgradePasswordHash(
    estudianteId: string,
    plainPassword: string,
  ): Promise<void> {
    const newHash = await this.passwordService.hash(plainPassword);
    await this.prisma.estudiante.update({
      where: { id: estudianteId },
      data: { password_hash: newHash },
    });
    this.logger.log(`Password hash upgraded for estudiante ${estudianteId}`);
  }
}