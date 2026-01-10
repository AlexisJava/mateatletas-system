import { SetMetadata } from '@nestjs/common';
import { Role } from '../../domain/constants';

/**
 * Re-export Role para compatibilidad con imports existentes
 */
export { Role };

/**
 * Clave para almacenar los roles requeridos en los metadatos (con jerarquía)
 */
export const ROLES_KEY = 'roles';

/**
 * Clave para almacenar los roles exactos requeridos (sin jerarquía)
 */
export const EXACT_ROLES_KEY = 'exact_roles';

/**
 * Decorator para especificar qué roles tienen acceso a un endpoint (CON JERARQUÍA)
 *
 * Un usuario con rol superior puede acceder a endpoints de roles inferiores.
 * Jerarquía: ESTUDIANTE < TUTOR < DOCENTE < ADMIN < SUPER_ADMIN
 *
 * Ejemplo: @Roles(Role.DOCENTE) permite acceso a DOCENTE, ADMIN y SUPER_ADMIN
 *
 * Uso:
 * @Roles(Role.TUTOR)
 * @Get('dashboard')
 * getDashboard() {
 *   return 'Dashboard del tutor';
 * }
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Decorator para especificar qué roles EXACTOS tienen acceso a un endpoint (SIN JERARQUÍA)
 *
 * Solo los roles especificados pueden acceder. No se aplica jerarquía.
 * Útil para endpoints "personales" que solo deben ser accedidos por un rol específico.
 *
 * Ejemplo: @ExactRoles(Role.ESTUDIANTE) SOLO permite acceso a ESTUDIANTE
 *          Un DOCENTE o ADMIN será rechazado con 403
 *
 * Uso:
 * @ExactRoles(Role.ESTUDIANTE)
 * @Get('mi-aula')
 * getMiAula() {
 *   return 'Aula del estudiante';
 * }
 */
export const ExactRoles = (...roles: Role[]) =>
  SetMetadata(EXACT_ROLES_KEY, roles);
