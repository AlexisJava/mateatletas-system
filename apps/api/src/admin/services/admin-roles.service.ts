import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { Role } from '../../auth/decorators/roles.decorator';
import { parseUserRoles } from '../../common/utils/role.utils';

/**
 * Servicio especializado para gestión de roles de usuario
 * Responsabilidad única: Cambiar y actualizar roles
 */
@Injectable()
export class AdminRolesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Cambiar el rol de un usuario
   * @param id - ID del usuario
   * @param newRole - Nuevo rol a asignar
   */
  async changeUserRole(id: string, newRole: Role) {
    // 1. Buscar el usuario en todas las tablas
    const [tutor, docente, admin] = await Promise.all([
      this.prisma.tutor.findUnique({ where: { id } }),
      this.prisma.docente.findUnique({ where: { id } }),
      this.prisma.admin.findUnique({ where: { id } }),
    ]);

    const userEntity = tutor || docente || admin;
    if (!userEntity) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // 2. Obtener roles actuales
    const currentRoles = parseUserRoles(userEntity.roles);

    // 3. Agregar el nuevo rol si no lo tiene
    if (!currentRoles.includes(newRole)) {
      const updatedRoles = [...currentRoles, newRole];
      await this.updateUserRolesInDatabase(id, updatedRoles);
    }

    return {
      success: true,
      message: `Rol ${newRole} asignado correctamente`,
      roles: currentRoles.includes(newRole)
        ? currentRoles
        : [...currentRoles, newRole],
    };
  }

  /**
   * Actualizar los roles de un usuario
   * @param id - ID del usuario
   * @param roles - Array de roles a asignar
   */
  async updateUserRoles(id: string, roles: Role[]) {
    if (!roles || roles.length === 0) {
      throw new BadRequestException('Debe proporcionar al menos un rol');
    }

    // Validar que los roles sean válidos
    const validRoles = Object.values(Role);
    const invalidRoles = roles.filter((role) => !validRoles.includes(role));
    if (invalidRoles.length > 0) {
      throw new BadRequestException(
        `Roles inválidos: ${invalidRoles.join(', ')}`,
      );
    }

    // Buscar el usuario en todas las tablas
    const [tutor, docente, admin] = await Promise.all([
      this.prisma.tutor.findUnique({ where: { id } }),
      this.prisma.docente.findUnique({ where: { id } }),
      this.prisma.admin.findUnique({ where: { id } }),
    ]);

    const userEntity = tutor || docente || admin;
    if (!userEntity) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Actualizar roles en la base de datos
    await this.updateUserRolesInDatabase(id, roles);

    return {
      success: true,
      message: 'Roles actualizados correctamente',
      roles,
    };
  }

  /**
   * Método privado para actualizar roles en la BD
   * Actualiza en la tabla correspondiente según el usuario
   */
  private async updateUserRolesInDatabase(id: string, roles: Role[]) {
    // Intentar actualizar en cada tabla (solo una tendrá efecto)
    await Promise.allSettled([
      this.prisma.tutor.update({
        where: { id },
        data: { roles: JSON.stringify(roles) },
      }),
      this.prisma.docente.update({
        where: { id },
        data: { roles: JSON.stringify(roles) },
      }),
      this.prisma.admin.update({
        where: { id },
        data: { roles: JSON.stringify(roles) },
      }),
    ]);
  }

  /**
   * Obtener roles de un usuario
   * @param id - ID del usuario
   * @returns Array de roles del usuario
   */
  async getUserRoles(id: string): Promise<Role[]> {
    const [tutor, docente, admin] = await Promise.all([
      this.prisma.tutor.findUnique({ where: { id } }),
      this.prisma.docente.findUnique({ where: { id } }),
      this.prisma.admin.findUnique({ where: { id } }),
    ]);

    const userEntity = tutor || docente || admin;
    if (!userEntity) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const roles = parseUserRoles(userEntity.roles);
    return roles.length > 0 ? roles : [this.getDefaultRole(userEntity)];
  }

  /**
   * Obtener el rol por defecto según el tipo de usuario
   */
  private getDefaultRole(user: { estudiantes?: string[]; clases?: string[] }): Role {
    // Determinar rol por defecto según la estructura del objeto
    if ('estudiantes' in user) return Role.Tutor;
    if ('clases' in user) return Role.Docente;
    return Role.Admin;
  }
}
