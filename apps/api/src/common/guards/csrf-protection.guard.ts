import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

/**
 * Guard de protección CSRF (Cross-Site Request Forgery)
 *
 * ¿QUÉ ES CSRF?
 * --------------
 * Imagina que un usuario está logueado en Mateatletas.
 * Luego visita un sitio malicioso que tiene este código:
 *
 *   fetch('https://mateatletas.com/api/estudiantes/123/avatar', {
 *     method: 'PATCH',
 *     body: JSON.stringify({ avatar_url: 'imagen-mala.jpg' }),
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
 * USO:
 * ----
 * 1. Aplicar globalmente en main.ts (todos los endpoints)
 * 2. O aplicar en controllers específicos con @UseGuards(CsrfProtectionGuard)
 * 3. Marcar excepciones con @Public() decorator
 */
@Injectable()
export class CsrfProtectionGuard implements CanActivate {
  private readonly logger = new Logger(CsrfProtectionGuard.name);

  // Lista de orígenes permitidos (tu frontend)
  private readonly allowedOrigins = [
    'http://localhost:3000',      // Frontend dev
    'http://localhost:3002',      // Frontend alternativo
    process.env.FRONTEND_URL,     // Frontend producción
  ].filter(Boolean) as string[];

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method.toUpperCase();

    // 1. Métodos seguros (solo lectura) no necesitan protección CSRF
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    // 2. Verificar si la ruta está marcada como @Public() o similar
    // (puedes agregar un decorator @SkipCsrf() si lo necesitas)
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // Rutas públicas como /auth/login no necesitan CSRF
      // (aunque deberían usar CAPTCHA u otra protección)
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
