import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthUser } from '../interfaces';
import { Role, cumpleJerarquia, esRoleValido } from '../../domain/constants';

/**
 * Guard para verificar que el usuario tenga los roles requeridos
 *
 * Este guard trabaja en conjunto con el decorator @Roles()
 * para controlar el acceso basado en roles con jerarquía.
 *
 * Jerarquía de roles (menor a mayor privilegio):
 * ESTUDIANTE (1) < TUTOR (2) < DOCENTE (3) < ADMIN (4) < SUPER_ADMIN (5)
 *
 * Si se requiere Role.DOCENTE, también tienen acceso ADMIN y SUPER_ADMIN.
 *
 * Uso (combinado con JwtAuthGuard):
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles(Role.TUTOR)
 * @Get('dashboard')
 * getDashboard() {
 *   return 'Dashboard del tutor';
 * }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener los roles requeridos desde los metadatos
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Obtener el usuario del request (ya validado por JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest<{ user?: AuthUser }>();

    if (!user) {
      return false;
    }

    // Obtener roles del usuario (puede ser array o string)
    const userRoles = user.roles || (user.role ? [user.role] : []);

    if (!userRoles || userRoles.length === 0) {
      return false;
    }

    // Normalizar roles del usuario a strings uppercase
    const normalizedUserRoles = userRoles
      .map(r => typeof r === 'string' ? r.toUpperCase() : r)
      .filter(esRoleValido);

    if (normalizedUserRoles.length === 0) {
      return false;
    }

    // Verificar si el usuario cumple con la jerarquía de AL MENOS UNO de los roles requeridos
    // Un usuario con rol superior (ej: ADMIN) puede acceder a endpoints que requieren roles inferiores (ej: DOCENTE)
    return requiredRoles.some((requiredRole: Role) =>
      normalizedUserRoles.some((userRole: Role) =>
        cumpleJerarquia(userRole, requiredRole)
      ),
    );
  }
}
