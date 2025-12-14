import { SetMetadata } from '@nestjs/common';

/**
 * Clave para metadata de endpoints públicos
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorador para marcar endpoints como públicos
 * Los endpoints marcados con @Public() no requieren autenticación JWT
 *
 * Uso:
 * @Public()
 * @Get('health')
 * async healthCheck() { ... }
 *
 * O a nivel de clase:
 * @Public()
 * @Controller('tiers')
 * export class TiersController { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
