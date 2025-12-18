import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

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
  casaId: true,
  tutor_id: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * UserProfileService - Obtención de perfiles de usuario
 *
 * Responsabilidades:
 * - Obtener perfiles de usuario por ID y rol
 * - NUNCA retornar password_hash
 *
 * Extraído de UserLookupService para respetar SRP
 */
@Injectable()
export class UserProfileService {
  private readonly logger = new Logger(UserProfileService.name);

  constructor(private readonly prisma: PrismaService) {}

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
    this.logger.debug(`Getting profile for ${role} ${userId}`);

    if (role === 'docente') {
      return this.getDocenteProfile(userId);
    }

    if (role === 'admin') {
      return this.getAdminProfile(userId);
    }

    if (role === 'estudiante') {
      return this.getEstudianteProfile(userId);
    }

    // Default: tutor
    return this.getTutorProfile(userId);
  }

  private async getTutorProfile(userId: string) {
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: userId },
      select: TUTOR_PROFILE_SELECT,
    });

    if (!tutor) {
      throw new NotFoundException('Tutor no encontrado');
    }

    return { ...tutor, role: 'tutor' as const };
  }

  private async getDocenteProfile(userId: string) {
    const docente = await this.prisma.docente.findUnique({
      where: { id: userId },
      select: DOCENTE_PROFILE_SELECT,
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    return { ...docente, role: 'docente' as const };
  }

  private async getAdminProfile(userId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: userId },
      select: ADMIN_PROFILE_SELECT,
    });

    if (!admin) {
      throw new NotFoundException('Admin no encontrado');
    }

    return { ...admin, role: 'admin' as const };
  }

  private async getEstudianteProfile(userId: string) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: userId },
      select: ESTUDIANTE_PROFILE_SELECT,
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return { ...estudiante, role: 'estudiante' as const };
  }
}
