import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { Role } from '../decorators/roles.decorator';

/**
 * Perfil de Tutor
 */
interface TutorProfile {
  id: string;
  email: string | null;
  nombre: string;
  apellido: string;
  dni?: string | null;
  telefono?: string | null;
  fecha_registro?: Date;
  haCompletadoOnboarding?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  role: string;
}

/**
 * Perfil de Docente
 */
interface DocenteProfile {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  titulo?: string | null;
  bio?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  role: string;
}

/**
 * Perfil de Admin
 */
interface AdminProfile {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  fecha_registro?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  role: string;
}

/**
 * Perfil de Estudiante
 */
interface EstudianteProfile {
  id: string;
  email?: string | null;
  nombre: string;
  apellido: string;
  edad?: number | null;
  nivelEscolar?: string | null;
  fotoUrl?: string | null;
  xpTotal?: number;
  nivel_actual?: number;
  casaId?: string | null;
  tutorId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  role: string;
}

/**
 * Tipo unión de todos los perfiles posibles
 */
export type UserProfile =
  | TutorProfile
  | DocenteProfile
  | AdminProfile
  | EstudianteProfile;

/**
 * Use Case: Obtener Perfil de Usuario
 *
 * RESPONSABILIDAD ÚNICA:
 * - Obtener perfil según el rol del usuario
 * - Excluir datos sensibles (passwordHash)
 * - Incluir el rol en la respuesta
 *
 * SEGURIDAD:
 * - Nunca devuelve passwordHash
 * - Solo selecciona campos necesarios
 */
@Injectable()
export class GetProfileUseCase {
  private readonly logger = new Logger(GetProfileUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene el perfil de un usuario según su rol
   *
   * @param userId - ID del usuario
   * @param role - Rol del usuario (TUTOR, DOCENTE, ADMIN, ESTUDIANTE)
   * @returns Perfil del usuario sin datos sensibles
   * @throws NotFoundException si el usuario no existe
   */
  async execute(userId: string, role: string): Promise<UserProfile> {
    // Normalizar rol para comparación
    const normalizedRole = role.toLowerCase();

    // Docente
    if (
      normalizedRole === 'docente' ||
      normalizedRole === Role.DOCENTE.toLowerCase()
    ) {
      return this.getDocenteProfile(userId);
    }

    // Admin
    if (
      normalizedRole === 'admin' ||
      normalizedRole === Role.ADMIN.toLowerCase()
    ) {
      return this.getAdminProfile(userId);
    }

    // Estudiante
    if (
      normalizedRole === 'estudiante' ||
      normalizedRole === Role.ESTUDIANTE.toLowerCase()
    ) {
      return this.getEstudianteProfile(userId);
    }

    // Por defecto: Tutor (incluye rol desconocido)
    return this.getTutorProfile(userId);
  }

  /**
   * Obtiene perfil de tutor
   */
  private async getTutorProfile(userId: string): Promise<TutorProfile> {
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        dni: true,
        telefono: true,
        fechaRegistro: true,
        haCompletadoOnboarding: true,
        createdAt: true,
        updatedAt: true,
        // IMPORTANTE: NO incluir passwordHash
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
   * Obtiene perfil de docente
   */
  private async getDocenteProfile(userId: string): Promise<DocenteProfile> {
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
        // IMPORTANTE: NO incluir passwordHash
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

  /**
   * Obtiene perfil de admin
   */
  private async getAdminProfile(userId: string): Promise<AdminProfile> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        fechaRegistro: true,
        createdAt: true,
        updatedAt: true,
        // IMPORTANTE: NO incluir passwordHash
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

  /**
   * Obtiene perfil de estudiante
   */
  private async getEstudianteProfile(
    userId: string,
  ): Promise<EstudianteProfile> {
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
        nivelActual: true,
        recursos: {
          select: {
            xpTotal: true,
          },
        },
        casaId: true,
        tutorId: true,
        createdAt: true,
        updatedAt: true,
        // IMPORTANTE: NO incluir passwordHash
      },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const { recursos, ...rest } = estudiante;
    return {
      ...rest,
      xpTotal: recursos?.xpTotal ?? 0,
      role: Role.ESTUDIANTE,
    };
  }
}
