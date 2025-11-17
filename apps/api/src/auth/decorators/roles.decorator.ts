import { SetMetadata } from '@nestjs/common';
import { Role } from '../../domain/constants';

/**
 * Re-export Role para compatibilidad con imports existentes
 */
export { Role };

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
