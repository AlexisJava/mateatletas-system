import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../core/database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginEstudianteDto } from './dto/login-estudiante.dto';
import * as bcrypt from 'bcrypt';
import { Role } from './decorators/roles.decorator';
import { parseUserRoles } from '../common/utils/role.utils';
import { Tutor, Docente, Admin as AdminModel } from '@prisma/client';
import { LogrosService } from '../gamificacion/services/logros.service';

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
  private readonly BCRYPT_ROUNDS = 10;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => LogrosService))
    private logrosService: LogrosService,
  ) {}

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
      throw new ConflictException('El email ya está registrado');
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

    return {
      message: 'Tutor registrado exitosamente',
      user: {
        ...tutor,
        role: Role.Tutor,
      },
    };
  }

  /**
   * Autentica un estudiante con sus credenciales propias (username + password)
   * @param loginEstudianteDto - Credenciales del estudiante (username, password)
   * @returns Token JWT y datos del estudiante
   * @throws UnauthorizedException si las credenciales son inválidas
   */
  async loginEstudiante(loginEstudianteDto: LoginEstudianteDto) {
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
        equipo: {
          select: {
            id: true,
            nombre: true,
            color_primario: true,
          },
        },
      },
    });

    // 2. Verificar que el estudiante exista y tenga credenciales configuradas
    if (!estudiante || !estudiante.password_hash || !estudiante.username) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Comparar contraseña con bcrypt
    const isPasswordValid = await bcrypt.compare(
      password,
      estudiante.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 4. Obtener roles del estudiante desde la BD - usando utility segura
    const estudianteRoles = parseUserRoles(estudiante.roles);
    const finalRoles =
      estudianteRoles.length > 0 ? estudianteRoles : [Role.Estudiante];

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
        nivel_escolar: estudiante.nivel_escolar,
        foto_url: estudiante.foto_url,
        avatar_url: estudiante.avatar_url, // Avatar 3D de Ready Player Me
        animacion_idle_url: estudiante.animacion_idle_url, // Animación idle seleccionada
        puntos_totales: estudiante.puntos_totales,
        nivel_actual: estudiante.nivel_actual,
        equipo: estudiante.equipo,
        tutor: estudiante.tutor,
        role: 'estudiante',
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
  async login(loginDto: LoginDto) {
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

    if (!user) {
      user = await this.prisma.admin.findUnique({
        where: { email },
      });
    }

    // 4. Verificar que el usuario exista
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 5. Comparar contraseña con bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 6. Obtener roles del usuario desde la BD (puede tener múltiples roles) - usando utility segura
    const userRoles = parseUserRoles(user.roles);
    const detectedRole = isTutorUser(user)
      ? Role.Tutor
      : isDocenteUser(user)
        ? Role.Docente
        : Role.Admin;
    const finalUserRoles = userRoles.length > 0 ? userRoles : [detectedRole];

    if (!user.email) {
      throw new UnauthorizedException('El usuario no tiene email configurado');
    }

    // 7. Generar token JWT con todos los roles del usuario
    const accessToken = this.generateJwtToken(
      user.id,
      user.email,
      finalUserRoles,
    );

    // 7. Retornar token y datos del usuario (estructura diferente según rol)
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
          role: 'tutor',
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
          role: 'docente',
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
        role: 'admin',
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

      // Retornar tutor sin password_hash
      const { password_hash, ...result } = tutor;
      void password_hash;
      return result;
    } catch (error) {
      // Log del error sin exponer detalles al cliente
      this.logger.error('Error en validateUser', error instanceof Error ? error.stack : error);
      return null;
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
    if (role === 'docente') {
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
        role: Role.Docente,
      };
    }

    if (role === 'admin') {
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
        role: Role.Admin,
      };
    }

    if (role === 'estudiante') {
      const estudiante = await this.prisma.estudiante.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          edad: true,
          nivel_escolar: true,
          foto_url: true,
          puntos_totales: true,
          nivel_actual: true,
          equipo_id: true,
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
        role: 'estudiante',
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
      role: 'tutor',
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
        equipo: {
          select: {
            id: true,
            nombre: true,
            color_primario: true,
            color_secundario: true,
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

      // Otorgar logro de primer ingreso
      if (esPrimerLogin) {
        try {
          await this.logrosService.desbloquearLogro(
            estudiante.id,
            'PRIMER_INGRESO',
          );
          this.logger.log(
            `Logro PRIMER_INGRESO otorgado a estudiante ${estudiante.id}`,
          );
        } catch (error) {
          this.logger.error(
            `Error al otorgar logro PRIMER_INGRESO: ${error}`,
          );
        }
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
          nivel_escolar: estudiante.nivel_escolar,
          avatar_gradient: estudiante.avatar_gradient,
          puntos_totales: estudiante.puntos_totales,
          equipo: estudiante.equipo,
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
    roles: Role[] | Role = [Role.Tutor],
  ): string {
    // Normalizar roles a array si viene como un único rol (retrocompatibilidad)
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    const normalizedRoles = rolesArray.length > 0 ? rolesArray : [Role.Tutor];

    const payload = {
      sub: userId, // Subject (ID del usuario)
      email,
      role: normalizedRoles[0], // Rol principal (primer rol del array) - para backward compatibility
      roles: normalizedRoles, // Array completo de roles - soporte multi-rol
    };

    return this.jwtService.sign(payload);
  }
}
