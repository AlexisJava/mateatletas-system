import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { Role } from '../../auth/decorators/roles.decorator';
import { parseUserRoles } from '../../common/utils/role.utils';

/**
 * Servicio simplificado para gestión de usuarios
 * Responsabilidad única: Listar y eliminar usuarios del sistema
 *
 * NOTA: Para gestión de roles usar AdminRolesService
 * NOTA: Para gestión de estudiantes usar AdminEstudiantesService
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
        orderBy: {
          apellido: 'asc',
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
        orderBy: {
          apellido: 'asc',
        },
      }),
      this.prisma.admin.findMany({
        orderBy: {
          apellido: 'asc',
        },
      }),
    ]);

    // Mapear tutores
    const tutorUsers = tutores.map((tutor) => this.mapTutorToUser(tutor));

    // Mapear docentes
    const docenteUsers = docentes.map((docente) => this.mapDocenteToUser(docente));

    // Mapear admins
    const adminUsers = admins.map((admin) => this.mapAdminToUser(admin));

    // Combinar y retornar
    return [...tutorUsers, ...docenteUsers, ...adminUsers];
  }

  /**
   * Mapear tutor a formato de usuario
   */
  private mapTutorToUser(tutor: any) {
    const userRoles = parseUserRoles(tutor.roles);
    const finalRoles = userRoles.length > 0 ? userRoles : [Role.Tutor];

    return {
      id: tutor.id,
      email: tutor.email,
      nombre: tutor.nombre,
      apellido: tutor.apellido,
      role: finalRoles[0] as any, // First role for backward compatibility
      roles: finalRoles,
      activo: true,
      createdAt: tutor.createdAt,
      updatedAt: tutor.updatedAt,
      _count: {
        estudiantes: tutor._count.estudiantes,
        equipos: 0,
        clases: 0,
      },
    };
  }

  /**
   * Mapear docente a formato de usuario
   */
  private mapDocenteToUser(docente: any) {
    const userRoles = parseUserRoles(docente.roles);
    const finalRoles = userRoles.length > 0 ? userRoles : [Role.Docente];

    return {
      id: docente.id,
      email: docente.email,
      nombre: docente.nombre,
      apellido: docente.apellido,
      role: finalRoles[0] as any,
      roles: finalRoles,
      activo: true,
      createdAt: docente.createdAt,
      updatedAt: docente.updatedAt,
      _count: {
        estudiantes: 0,
        equipos: 0,
        clases: docente._count.clases,
      },
    };
  }

  /**
   * Mapear admin a formato de usuario
   */
  private mapAdminToUser(admin: any) {
    const userRoles = parseUserRoles(admin.roles);
    const finalRoles = userRoles.length > 0 ? userRoles : [Role.Admin];

    return {
      id: admin.id,
      email: admin.email,
      nombre: admin.nombre,
      apellido: admin.apellido,
      role: finalRoles[0] as any,
      roles: finalRoles,
      activo: true,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
      _count: {
        estudiantes: 0,
        equipos: 0,
        clases: 0,
      },
    };
  }

  /**
   * Eliminar un usuario del sistema
   * @param id - ID del usuario a eliminar
   *
   * VALIDACIONES:
   * - Si es docente con clases asignadas → Error (debe reasignar primero)
   * - Si es tutor con estudiantes → Eliminación en cascada (elimina tutor + estudiantes)
   */
  async deleteUser(id: string) {
    // 1. Verificar si es docente con clases
    const docente = await this.prisma.docente.findUnique({
      where: { id },
      include: {
        clases: {
          where: {
            estado: {
              not: 'Cancelada' // Solo contar clases activas
            }
          }
        }
      }
    });

    if (docente && docente.clases.length > 0) {
      throw new ConflictException(
        `No se puede eliminar el docente porque tiene ${docente.clases.length} clase(s) asignada(s). ` +
        `Debe reasignar las clases a otro docente antes de eliminar.`
      );
    }

    // 2. Si es tutor, eliminar en cascada (tutor + estudiantes)
    const tutor = await this.prisma.tutor.findUnique({
      where: { id },
      include: {
        estudiantes: true
      }
    });

    if (tutor) {
      // Eliminar todos los estudiantes del tutor primero
      if (tutor.estudiantes.length > 0) {
        await this.prisma.estudiante.deleteMany({
          where: { tutor_id: id }
        });
      }

      // Luego eliminar el tutor
      await this.prisma.tutor.delete({ where: { id } });

      return {
        success: true,
        message: `Tutor y ${tutor.estudiantes.length} estudiante(s) eliminados exitosamente`,
      };
    }

    // 3. Intentar eliminar docente o admin (sin dependencias)
    const [docenteResult, adminResult] = await Promise.allSettled([
      this.prisma.docente.delete({ where: { id } }),
      this.prisma.admin.delete({ where: { id } }),
    ]);

    // Verificar si alguna eliminación fue exitosa
    const successfulDeletion =
      docenteResult.status === 'fulfilled' ||
      adminResult.status === 'fulfilled';

    if (!successfulDeletion) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return {
      success: true,
      message: 'Usuario eliminado exitosamente',
    };
  }

  /**
   * Obtener detalles de un usuario específico
   * @param id - ID del usuario
   */
  async obtenerUsuario(id: string) {
    const [tutor, docente, admin] = await Promise.all([
      this.prisma.tutor.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              estudiantes: true,
            },
          },
        },
      }),
      this.prisma.docente.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              clases: true,
            },
          },
        },
      }),
      this.prisma.admin.findUnique({ where: { id } }),
    ]);

    const usuario = tutor || docente || admin;
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Mapear según el tipo
    if (tutor) return this.mapTutorToUser(tutor);
    if (docente) return this.mapDocenteToUser(docente);
    return this.mapAdminToUser(admin);
  }

  /**
   * Obtener estadísticas generales de usuarios
   */
  async obtenerEstadisticas() {
    const [totalTutores, totalDocentes, totalAdmins, totalEstudiantes] =
      await Promise.all([
        this.prisma.tutor.count(),
        this.prisma.docente.count(),
        this.prisma.admin.count(),
        this.prisma.estudiante.count(),
      ]);

    return {
      total_usuarios: totalTutores + totalDocentes + totalAdmins,
      por_rol: {
        tutores: totalTutores,
        docentes: totalDocentes,
        admins: totalAdmins,
      },
      estudiantes: totalEstudiantes,
    };
  }
}
