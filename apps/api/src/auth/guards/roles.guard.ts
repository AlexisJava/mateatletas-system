import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, EXACT_ROLES_KEY } from '../decorators/roles.decorator';
import { AuthUser } from '../interfaces';
import { Role, cumpleJerarquia, esRoleValido } from '../../domain/constants';

/**
 * Guard para verificar que el usuario tenga los roles requeridos
 *
 * Este guard trabaja en conjunto con los decorators @Roles() y @ExactRoles()
 * para controlar el acceso basado en roles.
 *
 * MODOS DE OPERACIÓN:
 *
 * 1. @Roles() - CON JERARQUÍA (comportamiento por defecto)
 *    Jerarquía: ESTUDIANTE (1) < TUTOR (2) < DOCENTE (3) < ADMIN (4) < SUPER_ADMIN (5)
 *    Si se requiere Role.DOCENTE, también tienen acceso ADMIN y SUPER_ADMIN.
 *
 * 2. @ExactRoles() - SIN JERARQUÍA
 *    Solo los roles especificados pueden acceder.
 *    Útil para endpoints "personales" como /mi-aula, /mi-perfil.
 *
 * Uso (combinado con JwtAuthGuard):
 *
 * // Con jerarquía - DOCENTE, ADMIN y SUPER_ADMIN pueden acceder
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles(Role.DOCENTE)
 * @Get('clases')
 *
 * // Sin jerarquía - SOLO ESTUDIANTE puede acceder
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @ExactRoles(Role.ESTUDIANTE)
 * @Get('mi-aula')
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener roles exactos (prioridad sobre roles jerárquicos)
    const exactRoles = this.reflector.getAllAndOverride<Role[]>(
      EXACT_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Obtener roles jerárquicos
    const hierarchicalRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no hay ningún tipo de roles requeridos, permitir acceso
    if (
      (!exactRoles || exactRoles.length === 0) &&
      (!hierarchicalRoles || hierarchicalRoles.length === 0)
    ) {
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
      .map((r) => (typeof r === 'string' ? r.toUpperCase() : r))
      .filter(esRoleValido);

    if (normalizedUserRoles.length === 0) {
      return false;
    }

    // PRIORIDAD 1: Verificar ExactRoles (sin jerarquía)
    // Si hay ExactRoles definidos, SOLO se usa esta verificación
    if (exactRoles && exactRoles.length > 0) {
      return exactRoles.some((requiredRole: Role) =>
        normalizedUserRoles.includes(requiredRole),
      );
    }

    // PRIORIDAD 2: Verificar Roles (con jerarquía)
    // Un usuario con rol superior puede acceder a endpoints de roles inferiores
    if (hierarchicalRoles && hierarchicalRoles.length > 0) {
      return hierarchicalRoles.some((requiredRole: Role) =>
        normalizedUserRoles.some((userRole: Role) =>
          cumpleJerarquia(userRole, requiredRole),
        ),
      );
    }

    return false;
  }
}
