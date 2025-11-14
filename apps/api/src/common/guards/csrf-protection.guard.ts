import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { REQUIRE_CSRF_KEY } from '../decorators/require-csrf.decorator';

/**
 * Guard de protección CSRF (Cross-Site Request Forgery) - OPT-IN
 *
 * ✅ SECURITY FIX: Convertido de global a opt-in
 * ------------------------------------------------
 * ANTES: Aplicado globalmente, bloqueaba webhooks y API calls legítimas
 * AHORA: Solo se aplica en endpoints marcados con @RequireCsrf()
 *
 * ¿QUÉ ES CSRF?
 * --------------
 * Imagina que un usuario está logueado en Mateatletas.
 * Luego visita un sitio malicioso que tiene este código:
 *
 *   fetch('https://mateatletas.com/api/estudiantes/123/avatar', {
 *     method: 'PATCH',
 *     body: JSON.stringify({ avatarUrl: 'imagen-mala.jpg' }),
 *     credentials: 'include' // ⚠️ Envía cookies automáticamente
 *   })
 *
 * El navegador envía las cookies del usuario automáticamente.
 * La API ve un token válido y ejecuta la acción.
 * ¡El atacante modificó datos sin permiso del usuario!
 *
 * ¿CÓMO LO PREVENIMOS?
 * --------------------
 * Este guard verifica el header "Origin" o "Referer":
 * - Si el request viene de nuestro frontend → ✅ Permitir
 * - Si viene de otro sitio → ❌ Rechazar
 *
 * MÉTODOS SEGUROS vs INSEGUROS:
 * -----------------------------
 * - GET, HEAD, OPTIONS → No modifican datos, no necesitan protección
 * - POST, PUT, PATCH, DELETE → Modifican datos, NECESITAN protección
 *
 * USO (OPT-IN):
 * -------------
 * Solo aplicar en endpoints que:
 * 1. Son llamados desde el navegador/frontend web
 * 2. Modifican estado sensible
 * 3. NO son webhooks ni API pura
 *
 * @example
 * ```typescript
 * @Post('login')
 * @RequireCsrf() // ✅ Proteger login de CSRF
 * async login(@Body() dto: LoginDto) {
 *   // ...
 * }
 * ```
 */
@Injectable()
export class CsrfProtectionGuard implements CanActivate {
  private readonly logger = new Logger(CsrfProtectionGuard.name);

  // Lista de orígenes permitidos (tu frontend)
  private readonly allowedOrigins = [
    'http://localhost:3000', // Frontend dev
    'http://localhost:3002', // Frontend alternativo
    // Soportar múltiples URLs separadas por coma en FRONTEND_URL
    ...(process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
      : ['https://mateatletas.com']),
  ].filter(Boolean) as string[];

  constructor(private reflector: Reflector) {
    // CRÍTICO: Validar que FRONTEND_URL esté configurado en producción
    if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
      this.logger.error(
        '⚠️  FRONTEND_URL no configurado en producción - CSRF usará fallback a https://mateatletas.com',
      );
      this.logger.error(
        '⚠️  Configurar FRONTEND_URL en .env.production para evitar bloqueos',
      );
    } else if (process.env.FRONTEND_URL) {
      this.logger.log(
        `CSRF Protection habilitado para origins: ${this.allowedOrigins.join(', ')}`,
      );
    }
  }

  canActivate(context: ExecutionContext): boolean {
    // ✅ SECURITY FIX: Solo aplicar CSRF si el endpoint tiene @RequireCsrf()
    const requireCsrf = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_CSRF_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requireCsrf) {
      // ✅ Endpoint NO requiere CSRF, permitir request
      // Esto permite webhooks, API calls, Postman, etc.
      return true;
    }

    // ✅ Endpoint requiere CSRF, validar Origin/Referer
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method.toUpperCase();

    // 1. Métodos seguros (solo lectura) no necesitan protección CSRF
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    // 2. Verificar si la ruta está marcada como @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // Rutas públicas no necesitan CSRF (aunque deberían usar CAPTCHA)
      return true;
    }

    // 3. Obtener el Origin o Referer del request
    const origin = request.headers.origin || request.headers.referer;

    if (!origin) {
      // Si no hay Origin ni Referer, es sospechoso
      // Requests legítimos de navegadores modernos SIEMPRE lo incluyen
      this.logger.warn(
        `CSRF: Request sin Origin/Referer - ${method} ${request.url} - IP: ${request.ip}`,
      );
      throw new ForbiddenException(
        'Request rechazado: falta header Origin/Referer',
      );
    }

    // 4. Normalizar el origin (quitar trailing slash y path)
    const normalizedOrigin = this.normalizeOrigin(origin);

    // 5. Verificar que el origin esté en la lista permitida
    const isAllowed = this.allowedOrigins.some((allowed) => {
      const normalizedAllowed = this.normalizeOrigin(allowed);
      return normalizedOrigin === normalizedAllowed;
    });

    if (!isAllowed) {
      // Request viene de un sitio NO autorizado
      this.logger.warn(
        `CSRF BLOCKED: Origin no permitido - ${normalizedOrigin} - ${method} ${request.url} - IP: ${request.ip}`,
      );
      throw new ForbiddenException(
        `Request rechazado: origin '${normalizedOrigin}' no permitido`,
      );
    }

    // ✅ Request legítimo de nuestro frontend
    this.logger.debug(
      `CSRF OK: ${method} ${request.url} from ${normalizedOrigin}`,
    );
    return true;
  }

  /**
   * Normaliza un origin para comparación
   *
   * Ejemplos:
   * - "http://localhost:3000/" → "http://localhost:3000"
   * - "http://localhost:3000/estudiantes" → "http://localhost:3000"
   * - "https://mateatletas.com/" → "https://mateatletas.com"
   */
  private normalizeOrigin(url: string): string {
    try {
      const parsed = new URL(url);
      // Retornar solo protocolo + host + puerto (sin path ni trailing slash)
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      // Si no es una URL válida, retornar tal cual
      return url.replace(/\/$/, ''); // Quitar trailing slash
    }
  }
}
