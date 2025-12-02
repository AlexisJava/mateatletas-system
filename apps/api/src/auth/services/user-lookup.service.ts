import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import {
  Tutor,
  Docente,
  Admin as AdminModel,
  Estudiante,
  Equipo,
} from '@prisma/client';

// ============================================================================
// TIPOS DE USUARIO Y DISCRIMINADORES
// ============================================================================

/**
 * Tipos de usuario soportados por el sistema de autenticación
 */
export type UserType = 'tutor' | 'docente' | 'admin' | 'estudiante';

/**
 * Usuario autenticado (tutor, docente o admin) - NO incluye estudiante
 * Usado en login() que busca por email
 */
export type AuthenticatedUser = Tutor | Docente | AdminModel;

/**
 * Cualquier tipo de usuario en el sistema
 */
export type AnyUser = Tutor | Docente | AdminModel | Estudiante;

// ============================================================================
// TYPE GUARDS - Discriminadores seguros sin `any`
// ============================================================================

/**
 * Type guard para Tutor - usa campo único `ha_completado_onboarding`
 */
export const isTutorUser = (user: AuthenticatedUser): user is Tutor =>
  'ha_completado_onboarding' in user;

/**
 * Type guard para Docente - usa campo único `titulo`
 */
export const isDocenteUser = (user: AuthenticatedUser): user is Docente =>
  'titulo' in user;

/**
 * Type guard para Admin - detectado por eliminación
 */
export const isAdminUser = (user: AuthenticatedUser): user is AdminModel =>
  !isTutorUser(user) && !isDocenteUser(user);

/**
 * Type guard para Estudiante
 */
export const isEstudianteUser = (user: AnyUser): user is Estudiante =>
  'tutor_id' in user && 'nivelEscolar' in user;

// ============================================================================
// INTERFACES DE RESULTADO
// ============================================================================

/**
 * Resultado de búsqueda por email
 * Retorna el usuario encontrado y su tipo detectado
 */
export interface UserByEmailResult {
  user: AuthenticatedUser;
  userType: Exclude<UserType, 'estudiante'>;
  /** Si es admin, incluye referencia específica para MFA */
  adminRef: AdminModel | null;
}

/**
 * Resultado de búsqueda por ID para cualquier tipo de usuario
 */
export interface UserByIdResult<T extends AnyUser = AnyUser> {
  user: T;
  userType: UserType;
}

/**
 * Datos mínimos para verificación de password
 */
export interface UserPasswordData {
  id: string;
  password_hash: string | null;
  password_temporal: string | null;
  debe_cambiar_password: boolean;
}

/**
 * Resultado de búsqueda de usuario para cambio de password
 */
export interface UserForPasswordChange {
  user: UserPasswordData;
  userType: UserType;
}

/**
 * Estudiante con relaciones incluidas (tutor y equipo)
 */
export interface EstudianteWithRelations extends Estudiante {
  tutor: Pick<Tutor, 'id' | 'nombre' | 'apellido' | 'email'> | null;
  equipo: Pick<Equipo, 'id' | 'nombre' | 'color_primario' | 'color_secundario'> | null;
}

// ============================================================================
// SELECT PROJECTIONS - Campos específicos para cada operación
// ============================================================================

/**
 * Campos para verificación de password
 */
const PASSWORD_FIELDS_SELECT = {
  id: true,
  password_hash: true,
  password_temporal: true,
  debe_cambiar_password: true,
} as const;

/**
 * Campos de perfil para Tutor (sin password_hash)
 */
const TUTOR_PROFILE_SELECT = {
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
} as const;

/**
 * Campos de perfil para Docente (sin password_hash)
 */
const DOCENTE_PROFILE_SELECT = {
  id: true,
  email: true,
  nombre: true,
  apellido: true,
  titulo: true,
  bio: true,
  createdAt: true,
  updatedAt: true,
  debe_cambiar_password: true,
} as const;

/**
 * Campos de perfil para Admin (sin password_hash)
 */
const ADMIN_PROFILE_SELECT = {
  id: true,
  email: true,
  nombre: true,
  apellido: true,
  fecha_registro: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * Campos de perfil para Estudiante (sin password_hash)
 */
const ESTUDIANTE_PROFILE_SELECT = {
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
} as const;

// ============================================================================
// SERVICIO PRINCIPAL
// ============================================================================

/**
 * UserLookupService - Servicio centralizado para búsqueda de usuarios
 *
 * Responsabilidades:
 * - Búsqueda de usuarios por email (tutor → docente → admin)
 * - Búsqueda de usuarios por username (estudiante → tutor)
 * - Búsqueda de usuarios por ID (todos los tipos)
 * - Obtención de perfiles sin password_hash
 *
 * Seguridad:
 * - NUNCA retorna password_hash en perfiles
 * - Type guards estrictos sin uso de `any`
 * - Proyecciones explícitas con `select`
 */
@Injectable()
export class UserLookupService {
  private readonly logger = new Logger(UserLookupService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ==========================================================================
  // BÚSQUEDA POR EMAIL
  // ==========================================================================

  /**
   * Busca un usuario por email en orden: tutor → docente → admin
   * Usado por login() y validateUser()
   *
   * @param email - Email del usuario
   * @returns Usuario encontrado con su tipo, o null si no existe
   */
  async findByEmail(email: string): Promise<UserByEmailResult | null> {
    // 1. Buscar como tutor
    const tutor = await this.prisma.tutor.findUnique({
      where: { email },
    });

    if (tutor) {
      return {
        user: tutor,
        userType: 'tutor',
        adminRef: null,
      };
    }

    // 2. Buscar como docente
    const docente = await this.prisma.docente.findUnique({
      where: { email },
    });

    if (docente) {
      return {
        user: docente,
        userType: 'docente',
        adminRef: null,
      };
    }

    // 3. Buscar como admin
    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (admin) {
      return {
        user: admin,
        userType: 'admin',
        adminRef: admin,
      };
    }

    return null;
  }

  // ==========================================================================
  // BÚSQUEDA POR USERNAME
  // ==========================================================================

  /**
   * Busca un estudiante por username con relaciones (tutor y equipo)
   * Usado por loginEstudiante() y loginWithUsername()
   *
   * @param username - Username del estudiante
   * @returns Estudiante con relaciones o null
   */
  async findEstudianteByUsername(
    username: string,
  ): Promise<EstudianteWithRelations | null> {
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
            color_secundario: true,
          },
        },
      },
    });

    return estudiante as EstudianteWithRelations | null;
  }

  /**
   * Busca un tutor por username
   * Usado por loginWithUsername() como fallback
   *
   * @param username - Username del tutor
   * @returns Tutor o null
   */
  async findTutorByUsername(username: string): Promise<Tutor | null> {
    return this.prisma.tutor.findUnique({
      where: { username },
    });
  }

  /**
   * Busca un usuario por username (estudiante → tutor)
   * Orden de búsqueda: estudiante primero, luego tutor
   *
   * @param username - Username del usuario
   * @returns Usuario encontrado con su tipo, o null
   */
  async findByUsername(
    username: string,
  ): Promise<{ user: Estudiante | Tutor; userType: 'estudiante' | 'tutor' } | null> {
    // 1. Buscar como estudiante primero
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { username },
    });

    if (estudiante) {
      return {
        user: estudiante,
        userType: 'estudiante',
      };
    }

    // 2. Buscar como tutor
    const tutor = await this.prisma.tutor.findUnique({
      where: { username },
    });

    if (tutor) {
      return {
        user: tutor,
        userType: 'tutor',
      };
    }

    return null;
  }

  // ==========================================================================
  // BÚSQUEDA POR ID
  // ==========================================================================

  /**
   * Busca un usuario por ID en todas las tablas
   * Orden: estudiante → tutor → docente → admin
   * Usado por cambiarPassword()
   *
   * @param userId - ID del usuario
   * @returns Usuario con datos para cambio de password, o null
   */
  async findByIdForPasswordChange(
    userId: string,
  ): Promise<UserForPasswordChange | null> {
    // 1. Buscar como estudiante
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: userId },
      select: PASSWORD_FIELDS_SELECT,
    });

    if (estudiante) {
      return {
        user: estudiante,
        userType: 'estudiante',
      };
    }

    // 2. Buscar como tutor
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: userId },
      select: PASSWORD_FIELDS_SELECT,
    });

    if (tutor) {
      return {
        user: tutor,
        userType: 'tutor',
      };
    }

    // 3. Buscar como docente
    const docente = await this.prisma.docente.findUnique({
      where: { id: userId },
      select: PASSWORD_FIELDS_SELECT,
    });

    if (docente) {
      return {
        user: docente,
        userType: 'docente',
      };
    }

    // 4. Buscar como admin
    const admin = await this.prisma.admin.findUnique({
      where: { id: userId },
      select: PASSWORD_FIELDS_SELECT,
    });

    if (admin) {
      return {
        user: admin,
        userType: 'admin',
      };
    }

    return null;
  }

  /**
   * Busca un admin por ID
   * Usado por completeMfaLogin()
   *
   * @param userId - ID del admin
   * @returns Admin completo o null
   */
  async findAdminById(userId: string): Promise<AdminModel | null> {
    return this.prisma.admin.findUnique({
      where: { id: userId },
    });
  }

  /**
   * Busca un tutor por ID
   * Usado por validateUser()
   *
   * @param userId - ID del tutor
   * @returns Tutor completo o null
   */
  async findTutorById(userId: string): Promise<Tutor | null> {
    return this.prisma.tutor.findUnique({
      where: { id: userId },
    });
  }

  // ==========================================================================
  // PERFILES (SIN PASSWORD_HASH)
  // ==========================================================================

  /**
   * Obtiene el perfil de un usuario por ID y rol
   * NUNCA retorna password_hash
   *
   * @param userId - ID del usuario
   * @param role - Rol del usuario ('tutor', 'docente', 'admin', 'estudiante')
   * @returns Perfil del usuario sin password_hash
   * @throws NotFoundException si el usuario no existe
   */
  async getProfile(userId: string, role: string) {
    if (role === 'docente') {
      const docente = await this.prisma.docente.findUnique({
        where: { id: userId },
        select: DOCENTE_PROFILE_SELECT,
      });

      if (!docente) {
        throw new NotFoundException('Docente no encontrado');
      }

      return { ...docente, role: 'docente' as const };
    }

    if (role === 'admin') {
      const admin = await this.prisma.admin.findUnique({
        where: { id: userId },
        select: ADMIN_PROFILE_SELECT,
      });

      if (!admin) {
        throw new NotFoundException('Admin no encontrado');
      }

      return { ...admin, role: 'admin' as const };
    }

    if (role === 'estudiante') {
      const estudiante = await this.prisma.estudiante.findUnique({
        where: { id: userId },
        select: ESTUDIANTE_PROFILE_SELECT,
      });

      if (!estudiante) {
        throw new NotFoundException('Estudiante no encontrado');
      }

      return { ...estudiante, role: 'estudiante' as const };
    }

    // Default: tutor
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: userId },
      select: TUTOR_PROFILE_SELECT,
    });

    if (!tutor) {
      throw new NotFoundException('Tutor no encontrado');
    }

    return { ...tutor, role: 'tutor' as const };
  }

  // ==========================================================================
  // ACTUALIZACIONES
  // ==========================================================================

  /**
   * Actualiza el password_hash de un usuario
   * Usado después de verificación exitosa cuando needsRehash=true
   *
   * @param userId - ID del usuario
   * @param userType - Tipo de usuario
   * @param newHash - Nuevo hash de password
   */
  async updatePasswordHash(
    userId: string,
    userType: UserType,
    newHash: string,
  ): Promise<void> {
    const updateData = { password_hash: newHash };

    switch (userType) {
      case 'estudiante':
        await this.prisma.estudiante.update({
          where: { id: userId },
          data: updateData,
        });
        break;
      case 'tutor':
        await this.prisma.tutor.update({
          where: { id: userId },
          data: updateData,
        });
        break;
      case 'docente':
        await this.prisma.docente.update({
          where: { id: userId },
          data: updateData,
        });
        break;
      case 'admin':
        await this.prisma.admin.update({
          where: { id: userId },
          data: updateData,
        });
        break;
    }

    this.logger.log(`Password hash updated for ${userType} ${userId}`);
  }

  /**
   * Actualiza los datos de password de un usuario
   * Usado por cambiarPassword()
   *
   * @param userId - ID del usuario
   * @param userType - Tipo de usuario
   * @param data - Datos a actualizar
   */
  async updatePasswordData(
    userId: string,
    userType: UserType,
    data: {
      password_hash: string;
      password_temporal: null;
      debe_cambiar_password: false;
      fecha_ultimo_cambio: Date;
    },
  ): Promise<void> {
    switch (userType) {
      case 'estudiante':
        await this.prisma.estudiante.update({
          where: { id: userId },
          data,
        });
        break;
      case 'tutor':
        await this.prisma.tutor.update({
          where: { id: userId },
          data,
        });
        break;
      case 'docente':
        await this.prisma.docente.update({
          where: { id: userId },
          data,
        });
        break;
      case 'admin':
        await this.prisma.admin.update({
          where: { id: userId },
          data,
        });
        break;
    }

    this.logger.log(`Password data updated for ${userType} ${userId}`);
  }

  /**
   * Elimina códigos de backup MFA usados
   * Usado por completeMfaLogin()
   *
   * @param userId - ID del admin
   * @param updatedCodes - Array de códigos restantes
   */
  async updateAdminMfaBackupCodes(
    userId: string,
    updatedCodes: string[],
  ): Promise<void> {
    await this.prisma.admin.update({
      where: { id: userId },
      data: { mfa_backup_codes: updatedCodes },
    });
  }

  // ==========================================================================
  // VERIFICACIÓN DE EXISTENCIA
  // ==========================================================================

  /**
   * Verifica si un email ya está registrado (para registro)
   * Busca SOLO en tutores (register solo crea tutores)
   *
   * @param email - Email a verificar
   * @returns true si el email ya existe
   */
  async emailExistsForTutor(email: string): Promise<boolean> {
    const tutor = await this.prisma.tutor.findUnique({
      where: { email },
      select: { id: true },
    });

    return tutor !== null;
  }
}