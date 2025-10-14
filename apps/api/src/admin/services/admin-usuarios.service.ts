import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { Role } from '../../auth/decorators/roles.decorator';

/**
 * Servicio especializado para gestión de usuarios administrativos
 * Extraído de AdminService para separar responsabilidades
 * Maneja listado, cambio de roles y eliminación de usuarios
 */
@Injectable()
export class AdminUsuariosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Listar todos los usuarios del sistema agrupados por rol
   * Incluye contadores de relaciones (estudiantes, clases, etc.)
   */
  async listarUsuarios() {
    const [tutores, docentes, admins] = await Promise.all([
      this.prisma.tutor.findMany({
        include: {
          _count: {
            select: {
              estudiantes: true,
            },
          },
        },
      }),
      this.prisma.docente.findMany({
        include: {
          _count: {
            select: {
              clases: true,
            },
          },
        },
      }),
      this.prisma.admin.findMany(),
    ]);

    const tutorUsers = tutores.map((tutor) => ({
      id: tutor.id,
      email: tutor.email,
      nombre: tutor.nombre,
      apellido: tutor.apellido,
      role: Role.Tutor,
      activo: true,
      createdAt: tutor.createdAt,
      updatedAt: tutor.updatedAt,
      _count: {
        estudiantes: tutor._count.estudiantes,
        equipos: 0,
        clases: 0,
      },
    }));

    const docenteUsers = docentes.map((docente) => ({
      id: docente.id,
      email: docente.email,
      nombre: docente.nombre,
      apellido: docente.apellido,
      role: Role.Docente,
      activo: true,
      createdAt: docente.createdAt,
      updatedAt: docente.updatedAt,
      _count: {
        estudiantes: 0,
        equipos: 0,
        clases: docente._count.clases,
      },
    }));

    const adminUsers = admins.map((admin) => ({
      id: admin.id,
      email: admin.email,
      nombre: admin.nombre,
      apellido: admin.apellido,
      role: Role.Admin,
      activo: true,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
      _count: {
        estudiantes: 0,
        equipos: 0,
        clases: 0,
      },
    }));

    return [...tutorUsers, ...docenteUsers, ...adminUsers];
  }

  /**
   * Cambiar el rol de un usuario
   * NOTA: Esta es una versión simplificada para MVP
   * Una implementación completa requeriría validaciones adicionales
   * y migración de datos relacionados
   */
  async changeUserRole(id: string, newRole: Role) {
    // Buscar el usuario en todas las tablas
    const tutor = await this.prisma.tutor.findUnique({ where: { id } });
    const docente = await this.prisma.docente.findUnique({ where: { id } });
    const admin = await this.prisma.admin.findUnique({ where: { id } });

    if (!tutor && !docente && !admin) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Por ahora, solo retornar mensaje informativo
    // Una implementación real requeriría transacciones complejas
    return {
      message: 'Cambio de rol pendiente de implementación completa',
      userId: id,
      requestedRole: newRole,
      note: 'Por seguridad, el cambio de rol requiere validaciones adicionales y migración de datos',
    };
  }

  /**
   * Eliminar un usuario del sistema
   * Intenta eliminar de cada tabla hasta encontrarlo
   */
  async deleteUser(id: string) {
    // Intentar eliminar como tutor
    try {
      const deletedTutor = await this.prisma.tutor.delete({
        where: { id },
      });

      return {
        message: 'Tutor eliminado correctamente',
        id: deletedTutor.id,
        role: Role.Tutor,
      };
    } catch (error: any) {
      if (error?.code === 'P2003') {
        throw new ConflictException(
          'El tutor tiene estudiantes o membresías asociadas y no puede eliminarse'
        );
      }
      if (error?.code !== 'P2025') {
        throw error;
      }
    }

    // Intentar eliminar como docente
    try {
      const deletedDocente = await this.prisma.docente.delete({
        where: { id },
      });

      return {
        message: 'Docente eliminado correctamente',
        id: deletedDocente.id,
        role: Role.Docente,
      };
    } catch (error: any) {
      if (error?.code === 'P2003') {
        throw new ConflictException(
          'El docente tiene clases asociadas y no puede eliminarse'
        );
      }

      if (error?.code !== 'P2025') {
        throw error;
      }
    }

    // Intentar eliminar como admin
    try {
      const deletedAdmin = await this.prisma.admin.delete({
        where: { id },
      });

      return {
        message: 'Admin eliminado correctamente',
        id: deletedAdmin.id,
        role: Role.Admin,
      };
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException('Usuario no encontrado');
      }

      throw error;
    }
  }
}
