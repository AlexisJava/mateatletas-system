import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Logger,
  BadRequestException,
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
import { Tutor, Docente, Admin as AdminModel } from '@prisma/client';
import {
  EstudiantePrimerLoginEvent,
  UserLoggedInEvent,
  UserRegisteredEvent,
} from '../common/events';
import { LoginAttemptService } from './services/login-attempt.service';

type AuthenticatedUser = Tutor | Docente | AdminModel;

// Type guards usando campos ÚNICOS de cada modelo
// - Tutor: solo él tiene 'ha_completado_onboarding'
// - Docente: solo él tiene 'titulo'
// - Admin: detectado por eliminación
const isTutorUser = (user: AuthenticatedUser): user is Tutor =>
  'ha_completado_onboarding' in user;

const isDocenteUser = (user: AuthenticatedUser): user is Docente =>
  'titulo' in user;

const isAdminUser = (user: AuthenticatedUser): user is AdminModel =>
  !isTutorUser(user) && !isDocenteUser(user);

/**
 * Servicio de autenticación para tutores
 * Maneja registro, login, validación y generación de tokens JWT
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly BCRYPT_ROUNDS = 12; // ✅ NIST SP 800-63B 2025 (updated from 10)

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
    private loginAttemptService: LoginAttemptService,
  ) {}

  /**
   * Genera un token temporal para verificación MFA
   * Este token es válido solo 5 minutos y solo para el endpoint de verificación MFA
   * @param userId - ID del usuario
   * @param email - Email del usuario
   * @returns Token JWT temporal
   */
  private generateMfaToken(userId: string, email: string): string {
    const payload = {
      sub: userId,
      email,
      type: 'mfa_pending', // Tipo especial para distinguir de tokens regulares
    };

    return this.jwtService.sign(payload, {
      expiresIn: '5m', // Token válido solo 5 minutos
    });
  }

  /**
   * Registra un nuevo tutor en la plataforma
   * @param registerDto - Datos del tutor a registrar
   * @returns Datos del tutor registrado (sin password_hash)
   * @throws ConflictException si el email ya existe
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

    // 2. Hashear la contraseña con bcrypt
    const passwordHash = await bcrypt.hash(password, this.BCRYPT_ROUNDS);

    // 3. Crear el tutor en la base de datos
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
      // IMPORTANTE: NO seleccionar password_hash por seguridad
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

    // 4. Emitir evento de registro exitoso
    // Este evento será escuchado por GamificacionModule para asignar casa y logros
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

    this.logger.log(
      `Tutor registrado exitosamente: ${tutor.id} (${tutor.email})`,
    );

    return {
      message: 'Tutor registrado exitosamente',
      user: {
        ...tutor,
        role: Role.TUTOR,
      },
    };
  }

  /**
   * Autentica un estudiante con sus credenciales propias (username + password)
   * @param loginEstudianteDto - Credenciales del estudiante (username, password)
   * @returns Token JWT y datos del estudiante
   * @throws UnauthorizedException si las credenciales son inválidas
   */
  async loginEstudiante(
    loginEstudianteDto: LoginEstudianteDto,
    ip: string = 'unknown',
  ) {
    const { username, password } = loginEstudianteDto;

    // 1. Buscar estudiante por username
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
        casa: {
          select: {
            id: true,
            nombre: true,
            colorPrimary: true,
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
      // Registrar intento fallido y verificar lockout
      await this.loginAttemptService.checkAndRecordAttempt(username, ip, false);
      this.logger.warn(
        `Intento de login fallido: username=${username}, ip=${ip}, reason=credenciales_invalidas`,
      );
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Registrar intento exitoso y limpiar intentos fallidos previos
    await this.loginAttemptService.checkAndRecordAttempt(username, ip, true);

    // 4. Obtener roles del estudiante desde la BD - usando utility segura
    const estudianteRoles = parseUserRoles(estudiante.roles);
    const finalRoles =
      estudianteRoles.length > 0 ? estudianteRoles : [Role.ESTUDIANTE];

    // 5. Generar token JWT (usar username en lugar de email)
    const accessToken = this.generateJwtToken(
      estudiante.id,
      estudiante.username || estudiante.email || estudiante.id,
      finalRoles,
    );

    // 5. Retornar token y datos del estudiante
    return {
      access_token: accessToken,
      user: {
        id: estudiante.id,
        email: estudiante.email || estudiante.username, // Fallback a username si no tiene email
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        edad: estudiante.edad,
        nivelEscolar: estudiante.nivelEscolar,
        fotoUrl: estudiante.fotoUrl,
        avatarUrl: estudiante.avatarUrl, // Avatar 3D de Ready Player Me
        animacion_idle_url: estudiante.animacion_idle_url, // Animación idle seleccionada
        puntos_totales: estudiante.puntos_totales,
        nivel_actual: estudiante.nivel_actual,
        casa: estudiante.casa,
        tutor: estudiante.tutor,
        role: Role.ESTUDIANTE,
        debe_cambiar_password: estudiante.debe_cambiar_password,
      },
    };
  }

  /**
   * Autentica un usuario (tutor, docente o admin)
   * @param loginDto - Credenciales del usuario
   * @returns Token JWT y datos del usuario
   * @throws UnauthorizedException si las credenciales son inválidas
   */
  async login(loginDto: LoginDto, ip: string = 'unknown') {
    const { email, password } = loginDto;

    // 1. Intentar buscar como tutor primero
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

    // 4. Protección contra timing attack: ejecutar bcrypt SIEMPRE
    const dummyHash = '$2b$12$dummyhashforunknownusers1234567890ab';
    const hashToCompare = user?.password_hash || dummyHash;
    const isPasswordValid = await bcrypt.compare(password, hashToCompare);

    // 5. Verificar que el usuario exista y el password sea válido
    if (!user || !isPasswordValid) {
      // Registrar intento fallido y verificar lockout
      await this.loginAttemptService.checkAndRecordAttempt(email, ip, false);
      this.logger.warn(
        `Intento de login fallido: email=${email}, ip=${ip}, reason=credenciales_invalidas`,
      );
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Registrar intento exitoso y limpiar intentos fallidos previos
    await this.loginAttemptService.checkAndRecordAttempt(email, ip, true);

    // 5.5. Si es admin y tiene MFA habilitado, retornar token temporal
    if (adminUser && isAdminUser(user) && adminUser.mfa_enabled) {
      this.logger.log(`Admin ${user.email} requiere verificación MFA`);

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

    // 6. Obtener roles del usuario desde la BD (puede tener múltiples roles) - usando utility segura
    const userRoles = parseUserRoles(user.roles);
    const detectedRole = isTutorUser(user)
      ? Role.TUTOR
      : isDocenteUser(user)
        ? Role.DOCENTE
        : Role.ADMIN;
    const finalUserRoles = userRoles.length > 0 ? userRoles : [detectedRole];

    if (!user.email) {
      throw new UnauthorizedException('El usuario no tiene email configurado');
    }

    // 7. Emitir evento de login exitoso
    const userType = isTutorUser(user)
      ? 'tutor'
      : isDocenteUser(user)
        ? 'docente'
        : 'admin';
    this.eventEmitter.emit(
      'user.logged-in',
      new UserLoggedInEvent(
        user.id,
        userType,
        user.email,
        false, // Los tutores/docentes/admins no tienen "primer login"
      ),
    );

    // 8. Generar token JWT con todos los roles del usuario
    const accessToken = this.generateJwtToken(
      user.id,
      user.email,
      finalUserRoles,
    );

    // 9. Retornar token y datos del usuario (estructura diferente según rol)
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
          roles: finalUserRoles, // Array de todos los roles del usuario
          debe_cambiar_password: user.debe_cambiar_password,
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
          roles: finalUserRoles, // Array de todos los roles del usuario
          debe_cambiar_password: user.debe_cambiar_password,
        },
      };
    }

    // Si llegamos acá, es Admin
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
        roles: finalUserRoles, // Array de todos los roles del usuario
        debe_cambiar_password: isAdminUser(user)
          ? user.debe_cambiar_password
          : false,
      },
    };
  }

  /**
   * Valida un usuario por email y password
   * Método auxiliar usado por estrategias de autenticación
   *
   * ✅ SECURITY ENHANCEMENT: Rehashes passwords with old rounds (gradual migration)
   *
   * @param email - Email del tutor
   * @param password - Contraseña en texto plano
   * @returns Tutor si es válido, null si no
   */
  async validateUser(email: string, password: string) {
    try {
      const tutor = await this.prisma.tutor.findUnique({
        where: { email },
      });

      if (!tutor) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        tutor.password_hash,
      );

      if (!isPasswordValid) {
        return null;
      }

      // ✅ SECURITY: Rehash password if using old rounds (gradual migration)
      const currentRounds = this.getRoundsFromHash(tutor.password_hash);
      if (currentRounds < this.BCRYPT_ROUNDS) {
        this.logger.log(
          `Rehashing password for tutor ${tutor.id} from ${currentRounds} to ${this.BCRYPT_ROUNDS} rounds`,
        );

        const newHash = await bcrypt.hash(password, this.BCRYPT_ROUNDS);

        // Update hash in database (non-blocking, fire-and-forget)
        this.prisma.tutor
          .update({
            where: { id: tutor.id },
            data: { password_hash: newHash },
          })
          .catch((error) => {
            this.logger.error(
              `Failed to rehash password for tutor ${tutor.id}`,
              error instanceof Error ? error.stack : error,
            );
          });
      }

      // Retornar tutor sin password_hash
      const { password_hash, ...result } = tutor;
      void password_hash;
      return result;
    } catch (error) {
      // Log del error sin exponer detalles al cliente
      this.logger.error(
        'Error en validateUser',
        error instanceof Error ? error.stack : error,
      );
      return null;
    }
  }

  /**
   * Extrae el número de rounds de un hash de bcrypt
   *
   * Formato de bcrypt hash: $2b$XX$... donde XX es el número de rounds
   * Ejemplo: $2b$12$abcdef... -> 12 rounds
   *
   * @param hash - Hash de bcrypt
   * @returns Número de rounds usado en el hash
   * @private
   */
  private getRoundsFromHash(hash: string): number {
    try {
      const parts = hash.split('$');
      const roundsPart = parts[2];
      if (!roundsPart) {
        this.logger.warn(
          `Invalid bcrypt hash format: ${hash.substring(0, 10)}...`,
        );
        return 0;
      }
      return parseInt(roundsPart, 10);
    } catch (error) {
      this.logger.error(
        'Error extracting rounds from hash',
        error instanceof Error ? error.stack : error,
      );
      return 0;
    }
  }

  /**
   * Obtiene el perfil de un tutor por su ID
   * @param userId - ID del tutor
   * @returns Datos del tutor (sin password_hash)
   * @throws NotFoundException si el tutor no existe
   */
  async getProfile(userId: string, role: string) {
    // Comparar directamente con strings en lugar de usar el enum
    if (role === 'docente' || role === Role.DOCENTE) {
      const docente = await this.prisma.docente.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          titulo: true,
          bio: true,
          createdAt: true,
          updatedAt: true,
          debe_cambiar_password: true,
        },
      });

      if (!docente) {
        throw new NotFoundException('Docente no encontrado');
      }

      return {
        ...docente,
        role: Role.DOCENTE,
      };
    }

    if (role === 'admin' || role === Role.ADMIN) {
      const admin = await this.prisma.admin.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          fecha_registro: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!admin) {
        throw new NotFoundException('Admin no encontrado');
      }

      return {
        ...admin,
        role: Role.ADMIN,
      };
    }

    if (role === 'estudiante' || role === Role.ESTUDIANTE) {
      const estudiante = await this.prisma.estudiante.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          edad: true,
          nivelEscolar: true,
          fotoUrl: true,
          puntos_totales: true,
          nivel_actual: true,
          casaId: true,
          tutor_id: true,
          createdAt: true,
          updatedAt: true,
          debe_cambiar_password: true,
        },
      });

      if (!estudiante) {
        throw new NotFoundException('Estudiante no encontrado');
      }

      return {
        ...estudiante,
        role: Role.ESTUDIANTE,
      };
    }

    // Por defecto, asumir que es tutor
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: userId },
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
        debe_cambiar_password: true,
        // IMPORTANTE: NO seleccionar password_hash
      },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor no encontrado');
    }

    return {
      ...tutor,
      role: Role.TUTOR,
    };
  }

  /**
   * Cambia la contraseña de un usuario (estudiante o tutor)
   * @param userId - ID del usuario
   * @param passwordActual - Contraseña actual del usuario
   * @param nuevaPassword - Nueva contraseña a establecer
   * @throws UnauthorizedException si la contraseña actual es incorrecta
   */
  async cambiarPassword(
    userId: string,
    passwordActual: string,
    nuevaPassword: string,
  ) {
    // 1. Buscar el usuario (puede ser estudiante, tutor o docente)
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password_hash: true,
        password_temporal: true,
        debe_cambiar_password: true,
      },
    });

    let tutor = null;
    let docente = null;
    let admin = null;
    let tipoUsuario: 'estudiante' | 'tutor' | 'docente' | 'admin' =
      'estudiante';

    if (!estudiante) {
      tutor = await this.prisma.tutor.findUnique({
        where: { id: userId },
        select: {
          id: true,
          password_hash: true,
          password_temporal: true,
          debe_cambiar_password: true,
        },
      });
      tipoUsuario = 'tutor';

      if (!tutor) {
        docente = await this.prisma.docente.findUnique({
          where: { id: userId },
          select: {
            id: true,
            password_hash: true,
            password_temporal: true,
            debe_cambiar_password: true,
          },
        });
        tipoUsuario = 'docente';

        if (!docente) {
          admin = await this.prisma.admin.findUnique({
            where: { id: userId },
            select: {
              id: true,
              password_hash: true,
              password_temporal: true,
              debe_cambiar_password: true,
            },
          });
          tipoUsuario = 'admin';

          if (!admin) {
            throw new NotFoundException('Usuario no encontrado');
          }
        }
      }
    }

    const usuario = estudiante || tutor || docente || admin;

    // 2. Verificar que la contraseña actual sea correcta
    const passwordValida = await bcrypt.compare(
      passwordActual,
      usuario!.password_hash!,
    );

    if (!passwordValida) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    // 3. Hashear la nueva contraseña
    const nuevoHash = await bcrypt.hash(nuevaPassword, this.BCRYPT_ROUNDS);

    // 4. Actualizar el usuario
    const updateData = {
      password_hash: nuevoHash,
      password_temporal: null,
      debe_cambiar_password: false,
      fecha_ultimo_cambio: new Date(),
    };

    if (tipoUsuario === 'estudiante') {
      await this.prisma.estudiante.update({
        where: { id: userId },
        data: updateData,
      });
    } else if (tipoUsuario === 'tutor') {
      await this.prisma.tutor.update({
        where: { id: userId },
        data: updateData,
      });
    } else if (tipoUsuario === 'docente') {
      await this.prisma.docente.update({
        where: { id: userId },
        data: updateData,
      });
    } else {
      // admin
      await this.prisma.admin.update({
        where: { id: userId },
        data: updateData,
      });
    }

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente',
    };
  }

  /**
   * Login con username para estudiantes y tutores
   * @param username - Username del usuario
   * @param password - Contraseña o PIN del usuario
   * @returns Token JWT y datos del usuario
   */
  async loginWithUsername(username: string, password: string) {
    // 1. Buscar primero como estudiante
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { username },
      include: {
        tutor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
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
      // Verificar contraseña
      const passwordValida = await bcrypt.compare(
        password,
        estudiante.password_hash || '',
      );

      if (!passwordValida) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Verificar si es el primer login (no tiene logros desbloqueados)
      const logrosDesbloqueados = await this.prisma.logroEstudiante.count({
        where: { estudiante_id: estudiante.id },
      });

      const esPrimerLogin = logrosDesbloqueados === 0;

      // Emitir evento de login de estudiante
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
        this.logger.log(
          `Primer login detectado para estudiante ${estudiante.id}`,
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

    // 2. Si no es estudiante, buscar como tutor
    const tutor = await this.prisma.tutor.findUnique({
      where: { username },
    });

    if (!tutor) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
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

  /**
   * Completa el login verificando el código MFA
   *
   * @param mfaToken - Token temporal MFA recibido en el login inicial
   * @param totpCode - Código TOTP de 6 dígitos (opcional)
   * @param backupCode - Código de backup (opcional)
   * @returns Token JWT final y datos del usuario
   * @throws UnauthorizedException si el token es inválido o el código es incorrecto
   */
  async completeMfaLogin(
    mfaToken: string,
    totpCode?: string,
    backupCode?: string,
  ) {
    // 1. Verificar y decodificar el token temporal MFA
    let payload: { sub: string; email: string; type: string };
    try {
      payload = this.jwtService.verify(mfaToken) as {
        sub: string;
        email: string;
        type: string;
      };
    } catch {
      throw new UnauthorizedException('Token MFA inválido o expirado');
    }

    // 2. Verificar que sea un token MFA válido
    if (payload.type !== 'mfa_pending') {
      throw new UnauthorizedException('Token MFA inválido');
    }

    const userId = payload.sub;

    // 3. Obtener el admin de la base de datos
    const admin = await this.prisma.admin.findUnique({
      where: { id: userId },
    });

    if (!admin) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!admin.mfa_enabled || !admin.mfa_secret) {
      throw new UnauthorizedException(
        'MFA no está habilitado para este usuario',
      );
    }

    // 4. Verificar el código TOTP o backup code
    let isValid = false;

    if (totpCode) {
      // Verificar código TOTP
      const authenticator = require('otplib').authenticator;
      authenticator.options = {
        window: 1,
        step: 30,
      };
      isValid = authenticator.verify({
        token: totpCode,
        secret: admin.mfa_secret,
      });
    } else if (backupCode) {
      // Verificar backup code
      const bcrypt = require('bcrypt');
      for (const [index, hashedCode] of admin.mfa_backup_codes.entries()) {
        const isMatch = await bcrypt.compare(backupCode, hashedCode);
        if (isMatch) {
          isValid = true;
          // Eliminar el código usado (single-use)
          const updatedCodes = admin.mfa_backup_codes.filter(
            (_, i) => i !== index,
          );
          await this.prisma.admin.update({
            where: { id: userId },
            data: { mfa_backup_codes: updatedCodes },
          });
          this.logger.warn(
            `⚠️ Código de backup usado para ${admin.email}. Códigos restantes: ${updatedCodes.length}`,
          );
          break;
        }
      }
    }

    if (!isValid) {
      this.logger.error(
        `❌ Código MFA inválido para usuario ${admin.email} (${userId})`,
      );
      throw new UnauthorizedException(
        'Código de verificación inválido. Por favor intenta nuevamente.',
      );
    }

    // 5. Generar token JWT final
    const userRoles = parseUserRoles(admin.roles);
    const finalRoles = userRoles.length > 0 ? userRoles : [Role.ADMIN];

    const accessToken = this.generateJwtToken(userId, admin.email, finalRoles);

    // 6. Emitir evento de login exitoso
    this.eventEmitter.emit(
      'user.logged-in',
      new UserLoggedInEvent(userId, 'admin', admin.email, false),
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
        debe_cambiar_password: admin.debe_cambiar_password,
      },
    };
  }

  /**
   * Genera un token JWT para un usuario
   * @param userId - ID del usuario
   * @param email - Email del usuario
   * @param roles - Array de roles del usuario (por ejemplo: ['admin', 'docente'])
   * @returns Token JWT firmado
   * @private
   */
  private generateJwtToken(
    userId: string,
    email: string,
    roles: Role[] | Role = [Role.TUTOR],
  ): string {
    // Normalizar roles a array si viene como un único rol (retrocompatibilidad)
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    const normalizedRoles = rolesArray.length > 0 ? rolesArray : [Role.TUTOR];

    const payload = {
      sub: userId, // Subject (ID del usuario)
      email,
      role: normalizedRoles[0], // Rol principal (primer rol del array) - para backward compatibility
      roles: normalizedRoles, // Array completo de roles - soporte multi-rol
    };

    return this.jwtService.sign(payload);
  }
}
