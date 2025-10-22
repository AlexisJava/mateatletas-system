import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../core/database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Role } from './decorators/roles.decorator';
import { parseUserRoles } from '../common/utils/role.utils';

type AuthenticatedUser = Tutor | Docente | AdminModel;

const isTutorUser = (user: AuthenticatedUser): user is Tutor =>
  'ha_completado_onboarding' in user;

const isDocenteUser = (user: AuthenticatedUser): user is Docente =>
  'debe_cambiar_password' in user;

const isAdminUser = (user: AuthenticatedUser): user is AdminModel =>
  !isTutorUser(user) && !isDocenteUser(user);

/**
 * Servicio de autenticación para tutores
 * Maneja registro, login, validación y generación de tokens JWT
 */
@Injectable()
export class AuthService {
  private readonly BCRYPT_ROUNDS = 10;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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
   * Autentica un estudiante con sus credenciales propias
   * @param loginDto - Credenciales del estudiante
   * @returns Token JWT y datos del estudiante
   * @throws UnauthorizedException si las credenciales son inválidas
   */
  async loginEstudiante(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Buscar estudiante por email
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { email },
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
    if (!estudiante || !estudiante.password_hash || !estudiante.email) {
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

    // 5. Generar token JWT
    const accessToken = this.generateJwtToken(
      estudiante.id,
      estudiante.email,
      finalRoles,
    );

    // 5. Retornar token y datos del estudiante
    return {
      access_token: accessToken,
      user: {
        id: estudiante.id,
        email: estudiante.email,
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        edad: estudiante.edad,
        nivel_escolar: estudiante.nivel_escolar,
        foto_url: estudiante.foto_url,
        puntos_totales: estudiante.puntos_totales,
        nivel_actual: estudiante.nivel_actual,
        equipo: estudiante.equipo,
        tutor: estudiante.tutor,
        role: 'estudiante',
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
        },
      };
    }

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        fecha_registro: user.fecha_registro,
        dni: isAdminUser(user) ? user.dni ?? null : null,
        telefono: isAdminUser(user) ? user.telefono ?? null : null,
        role: 'admin',
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
      return result;
    } catch (error) {
      // Log del error sin exponer detalles al cliente
      console.error('Error en validateUser:', error);
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
    const normalizedRoles =
      rolesArray.length > 0 ? rolesArray : [Role.Tutor];

    const payload = {
      sub: userId, // Subject (ID del usuario)
      email,
      role: normalizedRoles[0], // Rol principal (primer rol del array) - para backward compatibility
      roles: normalizedRoles, // Array completo de roles - soporte multi-rol
    };

    return this.jwtService.sign(payload);
  }
}
