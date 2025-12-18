import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import {
  Tutor,
  Docente,
  Admin as AdminModel,
  Estudiante,
  Casa,
} from '@prisma/client';
import { UserProfileService } from './user-profile.service';
import { UserUpdateService } from './user-update.service';

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
 */
export interface UserByEmailResult {
  user: AuthenticatedUser;
  userType: Exclude<UserType, 'estudiante'>;
  adminRef: AdminModel | null;
}

/**
 * Resultado de búsqueda por ID
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
}

/**
 * Resultado de búsqueda para cambio de password
 */
export interface UserForPasswordChange {
  user: UserPasswordData;
  userType: UserType;
}

/**
 * Estudiante con relaciones incluidas
 */
export interface EstudianteWithRelations extends Estudiante {
  tutor: Pick<Tutor, 'id' | 'nombre' | 'apellido' | 'email'> | null;
  casa: Pick<Casa, 'id' | 'nombre' | 'colorPrimary' | 'colorSecondary'> | null;
}

// ============================================================================
// SELECT PROJECTIONS
// ============================================================================

const PASSWORD_FIELDS_SELECT = {
  id: true,
  password_hash: true,
} as const;

// ============================================================================
// SERVICIO PRINCIPAL
// ============================================================================

/**
 * UserLookupService - Búsqueda de usuarios
 *
 * Responsabilidades:
 * - Búsqueda de usuarios por email
 * - Búsqueda de usuarios por username
 * - Búsqueda de usuarios por ID
 *
 * Delega a:
 * - UserProfileService para perfiles
 * - UserUpdateService para actualizaciones
 */
@Injectable()
export class UserLookupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profileService: UserProfileService,
    private readonly updateService: UserUpdateService,
  ) {}

  // ==========================================================================
  // BÚSQUEDA POR EMAIL
  // ==========================================================================

  async findByEmail(email: string): Promise<UserByEmailResult | null> {
    const tutor = await this.prisma.tutor.findUnique({ where: { email } });
    if (tutor) {
      return { user: tutor, userType: 'tutor', adminRef: null };
    }

    const docente = await this.prisma.docente.findUnique({ where: { email } });
    if (docente) {
      return { user: docente, userType: 'docente', adminRef: null };
    }

    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (admin) {
      return { user: admin, userType: 'admin', adminRef: admin };
    }

    return null;
  }

  // ==========================================================================
  // BÚSQUEDA POR USERNAME
  // ==========================================================================

  async findEstudianteByUsername(
    username: string,
  ): Promise<EstudianteWithRelations | null> {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { username },
      include: {
        tutor: {
          select: { id: true, nombre: true, apellido: true, email: true },
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

    return estudiante as EstudianteWithRelations | null;
  }

  async findTutorByUsername(username: string): Promise<Tutor | null> {
    return this.prisma.tutor.findUnique({ where: { username } });
  }

  async findByUsername(username: string): Promise<{
    user: Estudiante | Tutor;
    userType: 'estudiante' | 'tutor';
  } | null> {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { username },
    });
    if (estudiante) {
      return { user: estudiante, userType: 'estudiante' };
    }

    const tutor = await this.prisma.tutor.findUnique({ where: { username } });
    if (tutor) {
      return { user: tutor, userType: 'tutor' };
    }

    return null;
  }

  // ==========================================================================
  // BÚSQUEDA POR ID
  // ==========================================================================

  async findByIdForPasswordChange(
    userId: string,
  ): Promise<UserForPasswordChange | null> {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: userId },
      select: PASSWORD_FIELDS_SELECT,
    });
    if (estudiante) {
      return { user: estudiante, userType: 'estudiante' };
    }

    const tutor = await this.prisma.tutor.findUnique({
      where: { id: userId },
      select: PASSWORD_FIELDS_SELECT,
    });
    if (tutor) {
      return { user: tutor, userType: 'tutor' };
    }

    const docente = await this.prisma.docente.findUnique({
      where: { id: userId },
      select: PASSWORD_FIELDS_SELECT,
    });
    if (docente) {
      return { user: docente, userType: 'docente' };
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id: userId },
      select: PASSWORD_FIELDS_SELECT,
    });
    if (admin) {
      return { user: admin, userType: 'admin' };
    }

    return null;
  }

  async findAdminById(userId: string): Promise<AdminModel | null> {
    return this.prisma.admin.findUnique({ where: { id: userId } });
  }

  async findUserById(userId: string): Promise<{
    id: string;
    email: string;
    roles: string[];
    userType: UserType;
  } | null> {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: userId },
      select: { id: true, email: true, roles: true },
    });
    if (estudiante) {
      return {
        id: estudiante.id,
        email: estudiante.email ?? '',
        roles: this.parseRoles(estudiante.roles, 'estudiante'),
        userType: 'estudiante',
      };
    }

    const tutor = await this.prisma.tutor.findUnique({
      where: { id: userId },
      select: { id: true, email: true, roles: true },
    });
    if (tutor) {
      return {
        id: tutor.id,
        email: tutor.email ?? '',
        roles: this.parseRoles(tutor.roles, 'tutor'),
        userType: 'tutor',
      };
    }

    const docente = await this.prisma.docente.findUnique({
      where: { id: userId },
      select: { id: true, email: true, roles: true },
    });
    if (docente) {
      return {
        id: docente.id,
        email: docente.email ?? '',
        roles: this.parseRoles(docente.roles, 'docente'),
        userType: 'docente',
      };
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id: userId },
      select: { id: true, email: true, roles: true },
    });
    if (admin) {
      return {
        id: admin.id,
        email: admin.email,
        roles: this.parseRoles(admin.roles, 'admin'),
        userType: 'admin',
      };
    }

    return null;
  }

  async findTutorById(userId: string): Promise<Tutor | null> {
    return this.prisma.tutor.findUnique({ where: { id: userId } });
  }

  private parseRoles(roles: unknown, defaultRole: string): string[] {
    if (!roles) return [defaultRole];
    if (Array.isArray(roles)) return roles.map((r) => String(r));
    if (typeof roles === 'string') return [roles];
    return [defaultRole];
  }

  // ==========================================================================
  // DELEGADOS A UserProfileService
  // ==========================================================================

  async getProfile(userId: string, role: string) {
    return this.profileService.getProfile(userId, role);
  }

  // ==========================================================================
  // DELEGADOS A UserUpdateService
  // ==========================================================================

  async updatePasswordHash(
    userId: string,
    userType: UserType,
    newHash: string,
  ): Promise<void> {
    return this.updateService.updatePasswordHash(userId, userType, newHash);
  }

  async updatePasswordData(
    userId: string,
    userType: UserType,
    data: { password_hash: string; fecha_ultimo_cambio: Date },
  ): Promise<void> {
    return this.updateService.updatePasswordData(userId, userType, data);
  }

  async updateAdminMfaBackupCodes(
    userId: string,
    updatedCodes: string[],
  ): Promise<void> {
    return this.updateService.updateAdminMfaBackupCodes(userId, updatedCodes);
  }

  // ==========================================================================
  // VERIFICACIÓN DE EXISTENCIA
  // ==========================================================================

  async emailExistsForTutor(email: string): Promise<boolean> {
    const tutor = await this.prisma.tutor.findUnique({
      where: { email },
      select: { id: true },
    });
    return tutor !== null;
  }
}
