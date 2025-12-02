import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { authenticator } from 'otplib';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../core/database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { Role } from './decorators/roles.decorator';
import { parseUserRoles } from '../common/utils/role.utils';
import { UserLoggedInEvent, UserRegisteredEvent } from '../common/events';
import { TokenService } from './services/token.service';
import { PasswordService } from './services/password.service';

/**
 * AuthService - Servicio de autenticación reducido
 *
 * Responsabilidades:
 * - Registro de tutores
 * - Obtener perfil de usuario
 * - Cambio de contraseña
 * - Completar login MFA
 *
 * NOTA: Los métodos login() y loginEstudiante() fueron migrados a:
 * - TutorAuthService
 * - DocenteAuthService
 * - AdminAuthService
 * - EstudianteAuthService
 * - AuthOrchestratorService (orquestador)
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
    private tokenService: TokenService,
    private passwordService: PasswordService,
  ) {}

  /**
   * Registra un nuevo tutor en la plataforma
   * @param registerDto - Datos del tutor a registrar
   * @returns Datos del tutor registrado (sin password_hash)
   * @throws BadRequestException si el email ya existe
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

    // 2. Hashear la contraseña con PasswordService
    const passwordHash = await this.passwordService.hash(password);

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
   * Obtiene el perfil de un usuario por su ID y rol
   * @param userId - ID del usuario
   * @param role - Rol del usuario
   * @returns Datos del usuario (sin password_hash)
   * @throws NotFoundException si el usuario no existe
   */
  async getProfile(userId: string, role: string) {
    if (role === 'docente' || role === (Role.DOCENTE as string)) {
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

    if (role === 'admin' || role === (Role.ADMIN as string)) {
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

    if (role === 'estudiante' || role === (Role.ESTUDIANTE as string)) {
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
          equipoId: true,
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
   * Cambia la contraseña de un usuario (estudiante, tutor, docente o admin)
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
    // 1. Buscar el usuario (puede ser estudiante, tutor, docente o admin)
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
    const passwordValida = await this.passwordService.verify(
      passwordActual,
      usuario!.password_hash!,
    );

    if (!passwordValida) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    // 3. Hashear la nueva contraseña
    const nuevoHash = await this.passwordService.hash(nuevaPassword);

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
      payload = this.jwtService.verify(mfaToken);
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
            `Código de backup usado para ${admin.email}. Códigos restantes: ${updatedCodes.length}`,
          );
          break;
        }
      }
    }

    if (!isValid) {
      this.logger.warn(
        `Código MFA inválido para usuario ${admin.email} (${userId})`,
      );
      throw new UnauthorizedException(
        'Código de verificación inválido. Por favor intenta nuevamente.',
      );
    }

    // 5. Generar token JWT final
    const userRoles = parseUserRoles(admin.roles);
    const finalRoles = userRoles.length > 0 ? userRoles : [Role.ADMIN];

    const accessToken = this.tokenService.generateAccessToken(
      userId,
      admin.email,
      finalRoles,
    );

    // 6. Emitir evento de login exitoso
    this.eventEmitter.emit(
      'user.logged-in',
      new UserLoggedInEvent(userId, 'admin', admin.email, false),
    );

    this.logger.log(`Login MFA completado exitosamente para ${admin.email}`);

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
}
