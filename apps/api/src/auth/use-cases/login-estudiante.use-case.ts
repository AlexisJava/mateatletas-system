import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../core/database/prisma.service';
import { LoginAttemptService } from '../services/login-attempt.service';
import { LoginEstudianteDto } from '../dto/login-estudiante.dto';
import { Role } from '../decorators/roles.decorator';
import { parseUserRoles } from '../../common/utils/role.utils';
import * as bcrypt from 'bcrypt';

/**
 * Datos de casa incluidos en la respuesta
 */
export interface CasaData {
  id: string;
  nombre: string;
  colorPrimary: string;
}

/**
 * Datos de tutor incluidos en la respuesta
 * NOTA: email REMOVIDO para no exponer PII del tutor al estudiante (OWASP)
 */
export interface TutorData {
  id: string;
  nombre: string;
  apellido: string;
}

/**
 * Resultado del login de estudiante
 */
export interface LoginEstudianteResult {
  access_token: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    edad: number | null;
    nivelEscolar: string | null;
    fotoUrl: string | null;
    avatarUrl: string | null;
    animacion_idle_url: string | null;
    xp_total: number;
    nivel_actual: number;
    casa: CasaData | null;
    tutor: TutorData | null;
    role: string;
  };
}

/**
 * Use Case: Login de Estudiante
 *
 * RESPONSABILIDAD ÚNICA:
 * - Autenticar estudiantes por username + password
 * - Incluir datos de casa y tutor relacionados
 * - Protección contra timing attacks
 * - Tracking de intentos de login (lockout)
 *
 * SEGURIDAD:
 * - Timing attack protection (bcrypt siempre ejecutado)
 * - Login attempt tracking
 * - Validación de credenciales propias del estudiante
 */
@Injectable()
export class LoginEstudianteUseCase {
  private readonly logger = new Logger(LoginEstudianteUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly loginAttemptService: LoginAttemptService,
  ) {}

  /**
   * Ejecuta el login de un estudiante
   *
   * @param loginEstudianteDto - Credenciales del estudiante (username, password)
   * @param ip - IP del cliente (para tracking de intentos)
   * @returns Token JWT y datos del estudiante
   * @throws UnauthorizedException si las credenciales son inválidas
   */
  async execute(
    loginEstudianteDto: LoginEstudianteDto,
    ip: string = 'unknown',
  ): Promise<LoginEstudianteResult> {
    const { username, password } = loginEstudianteDto;

    // 1. Buscar estudiante por username con relaciones
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { username },
      include: {
        tutor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            // email: REMOVIDO - No exponer PII del tutor al estudiante (OWASP)
          },
        },
        casa: {
          select: {
            id: true,
            nombre: true,
            colorPrimary: true,
          },
        },
        recursos: {
          select: {
            xp_total: true,
          },
        },
      },
    });

    // 2. Protección contra timing attack: ejecutar bcrypt SIEMPRE
    const dummyHash = '$2b$12$dummyhashforunknownusers1234567890ab';
    const hashToCompare = estudiante?.password_hash || dummyHash;
    const isPasswordValid = await bcrypt.compare(password, hashToCompare);

    // 3. Verificar que el estudiante exista, tenga credenciales y password válido
    if (
      !estudiante ||
      !estudiante.password_hash ||
      !estudiante.username ||
      !isPasswordValid
    ) {
      await this.loginAttemptService.checkAndRecordAttempt(username, ip, false);
      this.logger.warn(
        `Intento de login fallido: username=${username}, ip=${ip}, reason=credenciales_invalidas`,
      );
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 4. Registrar intento exitoso
    await this.loginAttemptService.checkAndRecordAttempt(username, ip, true);

    // 5. Obtener roles del estudiante
    const estudianteRoles = parseUserRoles(estudiante.roles);
    const finalRoles =
      estudianteRoles.length > 0 ? estudianteRoles : [Role.ESTUDIANTE];

    // 6. Generar token JWT
    const accessToken = this.generateJwtToken(
      estudiante.id,
      estudiante.username || estudiante.email || estudiante.id,
      finalRoles,
    );

    // 7. Construir y retornar respuesta
    return {
      access_token: accessToken,
      user: {
        id: estudiante.id,
        email: estudiante.email || estudiante.username, // Fallback a username
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        edad: estudiante.edad,
        nivelEscolar: estudiante.nivelEscolar,
        fotoUrl: estudiante.fotoUrl,
        avatarUrl: estudiante.avatarUrl,
        animacion_idle_url: estudiante.animacion_idle_url,
        xp_total: estudiante.recursos?.xp_total ?? 0,
        nivel_actual: estudiante.nivel_actual,
        casa: estudiante.casa,
        tutor: estudiante.tutor,
        role: Role.ESTUDIANTE,
      },
    };
  }

  /**
   * Genera token JWT
   */
  private generateJwtToken(
    userId: string,
    identifier: string,
    roles: string[],
  ): string {
    const payload = {
      sub: userId,
      email: identifier, // Compatible con estructura existente
      roles,
    };

    return this.jwtService.sign(payload);
  }
}
