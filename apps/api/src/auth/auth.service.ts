import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../core/database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginEstudianteDto } from './dto/login-estudiante.dto';
import * as bcrypt from 'bcrypt';
import { Role } from './decorators/roles.decorator';
import { parseUserRoles } from '../common/utils/role.utils';
import {
  EstudiantePrimerLoginEvent,
  UserLoggedInEvent,
  UserRegisteredEvent,
} from '../common/events';

// Use-cases
import {
  ValidateCredentialsUseCase,
  LoginUseCase,
  LoginEstudianteUseCase,
  CompleteMfaLoginUseCase,
  CambiarPasswordUseCase,
  GetProfileUseCase,
} from './use-cases';

/**
 * AuthService - Facade
 *
 * Este servicio actúa como facade, delegando la lógica de negocio
 * a use-cases especializados. Mantiene la misma interfaz pública
 * para no romper los controllers existentes.
 *
 * Use-cases delegados:
 * - ValidateCredentialsUseCase: Validación de credenciales con migración de bcrypt
 * - LoginUseCase: Login unificado para Tutor/Docente/Admin con MFA
 * - LoginEstudianteUseCase: Login de estudiantes por username
 * - CompleteMfaLoginUseCase: Verificación de códigos MFA
 * - CambiarPasswordUseCase: Cambio de contraseña para todos los usuarios
 * - GetProfileUseCase: Obtención de perfil por rol
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly BCRYPT_ROUNDS = 12;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
    // Use-cases
    private readonly validateCredentialsUseCase: ValidateCredentialsUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly loginEstudianteUseCase: LoginEstudianteUseCase,
    private readonly completeMfaLoginUseCase: CompleteMfaLoginUseCase,
    private readonly cambiarPasswordUseCase: CambiarPasswordUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
  ) {}

  // ============================================================
  // MÉTODOS DELEGADOS A USE-CASES
  // ============================================================

  /**
   * Valida credenciales de un tutor
   * @delegate ValidateCredentialsUseCase
   */
  async validateUser(email: string, password: string) {
    return this.validateCredentialsUseCase.execute(email, password);
  }

  /**
   * Login unificado para Tutor/Docente/Admin
   * @delegate LoginUseCase
   */
  async login(loginDto: LoginDto, ip: string = 'unknown') {
    return this.loginUseCase.execute(loginDto, ip);
  }

  /**
   * Login de estudiante por username
   * @delegate LoginEstudianteUseCase
   */
  async loginEstudiante(
    loginEstudianteDto: LoginEstudianteDto,
    ip: string = 'unknown',
  ) {
    return this.loginEstudianteUseCase.execute(loginEstudianteDto, ip);
  }

  /**
   * Completa el login verificando código MFA
   * @delegate CompleteMfaLoginUseCase
   */
  async completeMfaLogin(
    mfaToken: string,
    totpCode?: string,
    backupCode?: string,
  ) {
    return this.completeMfaLoginUseCase.execute(mfaToken, totpCode, backupCode);
  }

  /**
   * Cambia la contraseña de un usuario
   * @delegate CambiarPasswordUseCase
   */
  async cambiarPassword(
    userId: string,
    passwordActual: string,
    nuevaPassword: string,
  ) {
    return this.cambiarPasswordUseCase.execute(
      userId,
      passwordActual,
      nuevaPassword,
    );
  }

  /**
   * Obtiene el perfil de un usuario según su rol
   * @delegate GetProfileUseCase
   */
  async getProfile(userId: string, role: string) {
    return this.getProfileUseCase.execute(userId, role);
  }

  // ============================================================
  // MÉTODOS QUE PERMANECEN EN EL SERVICE (sin use-case aún)
  // ============================================================

  /**
   * Registra un nuevo tutor en la plataforma
   */
  async register(registerDto: RegisterDto) {
    const { email, password, nombre, apellido, dni, telefono } = registerDto;

    // 1. Verificar que el email no exista
    const existingTutor = await this.prisma.tutor.findUnique({
      where: { email },
    });

    if (existingTutor) {
      throw new BadRequestException(
        'Error en el registro. Verifica los datos ingresados.',
      );
    }

    // 2. Hashear la contraseña
    const passwordHash = await bcrypt.hash(password, this.BCRYPT_ROUNDS);

    // 3. Crear el tutor
    const tutor = await this.prisma.tutor.create({
      data: {
        email,
        password_hash: passwordHash,
        nombre,
        apellido,
        dni: dni || null,
        telefono: telefono || null,
        fecha_registro: new Date(),
        ha_completado_onboarding: false,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        dni: true,
        telefono: true,
        fecha_registro: true,
        ha_completado_onboarding: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 4. Emitir evento de registro
    this.eventEmitter.emit(
      'user.registered',
      new UserRegisteredEvent(
        tutor.id,
        'tutor',
        tutor.email || '',
        tutor.nombre,
        tutor.apellido,
      ),
    );

    this.logger.log(`Tutor registrado: ${tutor.id} (${tutor.email})`);

    return {
      message: 'Tutor registrado exitosamente',
      user: {
        ...tutor,
        role: Role.TUTOR,
      },
    };
  }

  /**
   * Login con username para estudiantes y tutores
   * (método legacy, se mantiene por compatibilidad)
   */
  async loginWithUsername(username: string, password: string) {
    // 1. Buscar como estudiante
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { username },
      include: {
        tutor: {
          select: { id: true, nombre: true, apellido: true },
        },
        casa: {
          select: {
            id: true,
            nombre: true,
            colorPrimary: true,
            colorSecondary: true,
          },
        },
      },
    });

    if (estudiante) {
      const passwordValida = await bcrypt.compare(
        password,
        estudiante.password_hash || '',
      );

      if (!passwordValida) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Verificar primer login
      const logrosDesbloqueados = await this.prisma.logroEstudiante.count({
        where: { estudiante_id: estudiante.id },
      });
      const esPrimerLogin = logrosDesbloqueados === 0;

      // Emitir eventos
      this.eventEmitter.emit(
        'estudiante.logged-in',
        new UserLoggedInEvent(
          estudiante.id,
          'estudiante',
          estudiante.email || estudiante.username || '',
          esPrimerLogin,
        ),
      );

      if (esPrimerLogin) {
        this.eventEmitter.emit(
          'estudiante.primer-login',
          new EstudiantePrimerLoginEvent(
            estudiante.id,
            estudiante.username || estudiante.id,
          ),
        );
      }

      const roles = parseUserRoles(estudiante.roles);
      const token = this.generateJwtToken(
        estudiante.id,
        estudiante.username || estudiante.email || estudiante.id,
        roles,
      );

      return {
        access_token: token,
        user: {
          id: estudiante.id,
          username: estudiante.username,
          nombre: estudiante.nombre,
          apellido: estudiante.apellido,
          edad: estudiante.edad,
          nivelEscolar: estudiante.nivelEscolar,
          avatar_gradient: estudiante.avatar_gradient,
          puntos_totales: estudiante.puntos_totales,
          casa: estudiante.casa,
          tutor: estudiante.tutor,
          debe_cambiar_password: estudiante.debe_cambiar_password,
          roles,
        },
      };
    }

    // 2. Buscar como tutor
    const tutor = await this.prisma.tutor.findUnique({
      where: { username },
    });

    if (!tutor) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValida = await bcrypt.compare(password, tutor.password_hash);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const roles = parseUserRoles(tutor.roles);
    const token = this.generateJwtToken(tutor.id, tutor.email || '', roles);

    return {
      access_token: token,
      user: {
        id: tutor.id,
        username: tutor.username,
        email: tutor.email,
        nombre: tutor.nombre,
        apellido: tutor.apellido,
        debe_cambiar_password: tutor.debe_cambiar_password,
        roles,
      },
    };
  }

  // ============================================================
  // MÉTODOS PRIVADOS
  // ============================================================

  /**
   * Genera un token JWT
   */
  private generateJwtToken(
    userId: string,
    email: string,
    roles: Role[] | Role = [Role.TUTOR],
  ): string {
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    const normalizedRoles = rolesArray.length > 0 ? rolesArray : [Role.TUTOR];

    const payload = {
      sub: userId,
      email,
      role: normalizedRoles[0],
      roles: normalizedRoles,
    };

    return this.jwtService.sign(payload);
  }
}
