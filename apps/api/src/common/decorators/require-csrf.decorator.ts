import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key para identificar endpoints que requieren protección CSRF
 */
export const REQUIRE_CSRF_KEY = 'require_csrf';

/**
 * Decorator @RequireCsrf()
 *
 * Marca un endpoint para que requiera validación CSRF.
 * Solo debe usarse en endpoints que:
 * 1. Modifican estado (POST, PUT, PATCH, DELETE)
 * 2. Son llamados desde el navegador/frontend web
 * 3. NO son webhooks ni API pura
 *
 * @example
 * ```typescript
 * @Controller('auth')
 * export class AuthController {
 *   @Post('login')
 *   @RequireCsrf() // ✅ Proteger login de CSRF
 *   async login(@Body() dto: LoginDto) {
 *     // ...
 *   }
 *
 *   @Post('logout')
 *   @RequireCsrf() // ✅ Proteger logout de CSRF
 *   async logout() {
 *     // ...
 *   }
 * }
 * ```
 *
 * ¿CUÁNDO USAR @RequireCsrf()?
 * -----------------------------
 * ✅ SÍ usar en:
 * - Endpoints de autenticación llamados desde formularios web
 * - Endpoints de cambio de estado sensibles (cambiar password, actualizar perfil)
 * - Endpoints de formularios HTML tradicionales
 *
 * ❌ NO usar en:
 * - Webhooks (MercadoPago, otros servicios)
 * - API pura consumida por apps móviles
 * - Endpoints de lectura (GET, HEAD, OPTIONS)
 * - Endpoints públicos sin autenticación
 * - Integraciones server-to-server
 *
 * ALTERNATIVAS A CSRF:
 * --------------------
 * - Rate limiting (ya implementado globalmente)
 * - API keys para integraciones
 * - Signatures/HMAC para webhooks
 * - CAPTCHA para formularios públicos
 */
export const RequireCsrf = () => SetMetadata(REQUIRE_CSRF_KEY, true);
