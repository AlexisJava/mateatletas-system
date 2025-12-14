import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../core/database/prisma.service';
import { LoginAttemptService } from '../services/login-attempt.service';
import { LoginDto } from '../dto/login.dto';
import { Role } from '../decorators/roles.decorator';
import { parseUserRoles } from '../../common/utils/role.utils';
import { UserLoggedInEvent } from '../../common/events';
import { Tutor, Docente, Admin as AdminModel } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Tipo unificado para usuarios autenticados
 */
type AuthenticatedUser = Tutor | Docente | AdminModel;

/**
 * Type guards para detectar tipo de usuario
 */
const isTutorUser = (user: AuthenticatedUser): user is Tutor =>
  'ha_completado_onboarding' in user;

const isDocenteUser = (user: AuthenticatedUser): user is Docente =>
  'titulo' in user;

const isAdminUser = (user: AuthenticatedUser): user is AdminModel =>
  !isTutorUser(user) && !isDocenteUser(user);

/**
 * Resultado de login para Tutor
 */
interface TutorLoginResult {
  access_token: string;
  user: {
    id: string;
    email: string | null;
    nombre: string;
    apellido: string;
    dni: string | null;
    telefono: string | null;
    fecha_registro: Date;
    ha_completado_onboarding: boolean;
    role: string;
    roles: string[];
  };
}

/**
 * Resultado de login para Docente
 */
interface DocenteLoginResult {
  access_token: string;
  user: {
    id: string;
    email: string | null;
    nombre: string;
    apellido: string;
    titulo: string | null;
    bio: string | null;
    role: string;
    roles: string[];
  };
}

/**
 * Resultado de login para Admin
 */
interface AdminLoginResult {
  access_token: string;
  user: {
    id: string;
    email: string | null;
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
 * Resultado cuando se requiere MFA
 */
interface MfaRequiredResult {
  requires_mfa: true;
  mfa_token: string;
  user: {
    id: string;
    email: string | null;
    nombre: string;
    apellido: string;
  };
  message: string;
  access_token?: undefined;
}

/**
 * Tipo de resultado de login
 */
export type LoginResult =
  | TutorLoginResult
  | DocenteLoginResult
  | AdminLoginResult
  | MfaRequiredResult;

/**
 * Use Case: Login de Usuario
 *
 * RESPONSABILIDAD ÚNICA:
 * - Autenticar usuarios (tutor, docente, admin) por email + password
 * - Manejar protección contra timing attacks
 * - Detectar si requiere MFA (admin)
 * - Generar JWT token
 * - Emitir eventos de login
 * - Registrar intentos de login (lockout)
 *
 * SEGURIDAD:
 * - Timing attack protection (bcrypt siempre ejecutado)
 * - Login attempt tracking
 * - MFA para admin
 */
@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
    private readonly loginAttemptService: LoginAttemptService,
  ) {}

  /**
   * Ejecuta el login de un usuario
   *
   * @param loginDto - Credenciales del usuario
   * @param ip - IP del cliente (para tracking de intentos)
   * @returns Token JWT y datos del usuario, o MFA requerido
   * @throws UnauthorizedException si las credenciales son inválidas
   */
  async execute(
    loginDto: LoginDto,
    ip: string = 'unknown',
  ): Promise<LoginResult> {
    const { email, password } = loginDto;

    // 1. Buscar usuario en orden: tutor -> docente -> admin
    const { user, adminUser } = await this.findUser(email);

    // 2. Protección contra timing attack: ejecutar bcrypt SIEMPRE
    const dummyHash = '$2b$12$dummyhashforunknownusers1234567890ab';
    const hashToCompare = user?.password_hash || dummyHash;
    const isPasswordValid = await bcrypt.compare(password, hashToCompare);

    // 3. Verificar que el usuario exista y el password sea válido
    if (!user || !isPasswordValid) {
      await this.loginAttemptService.checkAndRecordAttempt(email, ip, false);
      this.logger.warn(
        `Intento de login fallido: email=${email}, ip=${ip}, reason=credenciales_invalidas`,
      );
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 4. Registrar intento exitoso
    await this.loginAttemptService.checkAndRecordAttempt(email, ip, true);

    // 5. Si es admin con MFA habilitado, retornar token temporal
    if (adminUser && isAdminUser(user) && adminUser.mfa_enabled) {
      this.logger.log(`Admin ${user.email} requiere verificación MFA`);
      return this.buildMfaRequiredResponse(user);
    }

    // 6. Emitir evento de login exitoso
    this.emitLoginEvent(user);

    // 7. Generar token y retornar respuesta según tipo de usuario
    return this.buildLoginResponse(user);
  }

  /**
   * Busca un usuario por email en las 3 tablas
   */
  private async findUser(email: string): Promise<{
    user: AuthenticatedUser | null;
    adminUser: AdminModel | null;
  }> {
    // Intentar buscar como tutor primero
    let user: AuthenticatedUser | null = await this.prisma.tutor.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.docente.findUnique({
        where: { email },
      });
    }

    let adminUser: AdminModel | null = null;
    if (!user) {
      adminUser = await this.prisma.admin.findUnique({
        where: { email },
      });
      user = adminUser;
    }

    return { user, adminUser };
  }

  /**
   * Construye respuesta cuando se requiere MFA
   */
  private buildMfaRequiredResponse(user: AuthenticatedUser): MfaRequiredResult {
    const mfaToken = this.generateMfaToken(user.id, user.email);

    return {
      requires_mfa: true,
      mfa_token: mfaToken,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
      },
      message:
        'Verificación MFA requerida. Por favor ingresa tu código de autenticación.',
    };
  }

  /**
   * Genera token temporal para MFA (5 minutos)
   */
  private generateMfaToken(userId: string, email: string | null): string {
    const payload = {
      sub: userId,
      email,
      type: 'mfa_pending',
    };

    return this.jwtService.sign(payload, {
      expiresIn: '5m',
    });
  }

  /**
   * Emite evento de login exitoso
   */
  private emitLoginEvent(user: AuthenticatedUser): void {
    const userType = isTutorUser(user)
      ? 'tutor'
      : isDocenteUser(user)
        ? 'docente'
        : 'admin';

    this.eventEmitter.emit(
      'user.logged-in',
      new UserLoggedInEvent(user.id, userType, user.email, false),
    );
  }

  /**
   * Construye respuesta de login según tipo de usuario
   */
  private buildLoginResponse(
    user: AuthenticatedUser,
  ): TutorLoginResult | DocenteLoginResult | AdminLoginResult {
    const userRoles = parseUserRoles(user.roles);
    const detectedRole = isTutorUser(user)
      ? Role.TUTOR
      : isDocenteUser(user)
        ? Role.DOCENTE
        : Role.ADMIN;
    const finalUserRoles = userRoles.length > 0 ? userRoles : [detectedRole];

    const accessToken = this.generateJwtToken(
      user.id,
      user.email,
      finalUserRoles,
    );

    if (isTutorUser(user)) {
      return {
        access_token: accessToken,
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          apellido: user.apellido,
          dni: user.dni ?? null,
          telefono: user.telefono ?? null,
          fecha_registro: user.fecha_registro,
          ha_completado_onboarding: user.ha_completado_onboarding,
          role: Role.TUTOR,
          roles: finalUserRoles,
        },
      };
    }

    if (isDocenteUser(user)) {
      return {
        access_token: accessToken,
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          apellido: user.apellido,
          titulo: user.titulo ?? null,
          bio: user.bio ?? null,
          role: Role.DOCENTE,
          roles: finalUserRoles,
        },
      };
    }

    // Admin
    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        fecha_registro: user.fecha_registro,
        dni: isAdminUser(user) ? (user.dni ?? null) : null,
        telefono: isAdminUser(user) ? (user.telefono ?? null) : null,
        role: Role.ADMIN,
        roles: finalUserRoles,
      },
    };
  }

  /**
   * Genera token JWT
   */
  private generateJwtToken(
    userId: string,
    email: string | null,
    roles: string[],
  ): string {
    const payload = {
      sub: userId,
      email,
      roles,
    };

    return this.jwtService.sign(payload);
  }
}
