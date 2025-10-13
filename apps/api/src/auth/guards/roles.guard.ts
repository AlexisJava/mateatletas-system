import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard para verificar que el usuario tenga los roles requeridos
 *
 * Este guard trabaja en conjunto con el decorator @Roles()
 * para controlar el acceso basado en roles
 *
 * Uso (combinado con JwtAuthGuard):
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles(Role.TUTOR)
 * @Get('admin')
 * getAdminResource() {
 *   return 'Solo para tutores';
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
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    // Verificar si el usuario tiene alguno de los roles requeridos
    // El campo 'role' viene del payload JWT y se agrega al user object
    const userRole = user.role;

    if (!userRole) {
      return false;
    }

    return requiredRoles.some((role) => role === userRole);
  }
}
