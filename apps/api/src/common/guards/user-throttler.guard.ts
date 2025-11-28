import { Injectable } from '@nestjs/common';
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
  protected override async getTracker(
    req: Record<string, unknown>,
  ): Promise<string> {
    const request = req as unknown as Request & { user?: { id: string } };

    const identifier = this.resolveIdentifier(request);

    return await Promise.resolve(identifier);
  }

  private resolveIdentifier(
    request: Request & { user?: { id: string } },
  ): string {
    if (request.user?.id) {
      return `user:${request.user.id}`;
    }

    const forwardedFor = request.headers['x-forwarded-for'];
    const forwardedParts =
      typeof forwardedFor === 'string' ? forwardedFor.split(',') : [];
    const forwardedIp = forwardedParts[0]?.trim();

    const ip =
      forwardedIp ||
      (typeof request.headers['x-real-ip'] === 'string'
        ? request.headers['x-real-ip']
        : undefined) ||
      request.ip ||
      'unknown';

    return `ip:${ip}`;
  }
}
