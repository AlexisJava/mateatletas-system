import { SetMetadata } from '@nestjs/common';

/**
 * Enum de roles disponibles en la plataforma
 * Por ahora solo tenemos TUTOR, pero puede expandirse en el futuro
 * (ej: ADMIN, ESTUDIANTE, etc.)
 */
export enum Role {
  TUTOR = 'TUTOR',
  // TODO: Agregar más roles según sea necesario
  // ADMIN = 'ADMIN',
  // ESTUDIANTE = 'ESTUDIANTE',
}

/**
 * Clave para almacenar los roles requeridos en los metadatos
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator para especificar qué roles tienen acceso a un endpoint
 *
 * Uso:
 * @Roles(Role.TUTOR)
 * @Get('dashboard')
 * getDashboard() {
 *   return 'Dashboard del tutor';
 * }
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
