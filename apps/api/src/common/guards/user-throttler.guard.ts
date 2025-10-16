import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

/**
 * Custom Throttler Guard que limita requests por usuario autenticado
 *
 * Comportamiento:
 * - Si el usuario está autenticado: Limita por user.id (más restrictivo por usuario)
 * - Si NO está autenticado: Limita por IP (permite más requests para endpoints públicos)
 *
 * Esto previene:
 * - Abuso de API por usuarios autenticados
 * - Ataques de fuerza bruta en login
 * - Spam de requests
 */
@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  /**
   * Determina el identificador único para rate limiting
   *
   * @param context - Contexto de ejecución de NestJS
   * @returns Identificador único (user.id o IP)
   */
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const request = req as Request & { user?: { id: string } };

    // Si el usuario está autenticado, limitar por user.id
    if (request.user?.id) {
      return `user:${request.user.id}`;
    }

    // Si NO está autenticado, limitar por IP
    // Obtener IP real considerando proxies (X-Forwarded-For, X-Real-IP)
    const ip =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      (request.headers['x-real-ip'] as string) ||
      request.ip ||
      'unknown';

    return `ip:${ip}`;
  }
}
