/**
 * Middleware para Correlation ID
 *
 * Genera o propaga un ID único por request para trazabilidad.
 * Útil para:
 * - Debugging de requests distribuidos
 * - Correlacionar logs entre servicios
 * - Tracking de webhooks
 */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/** Header estándar para correlation ID (lowercase por convención HTTP/2) */
export const CORRELATION_ID_HEADER = 'x-correlation-id';

/**
 * Middleware que inyecta correlation ID en cada request
 *
 * Si el request ya tiene X-Correlation-ID, lo usa.
 * Si no, genera un nuevo UUID v4.
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // Obtener correlation ID existente o generar uno nuevo
    const existingId = req.headers[CORRELATION_ID_HEADER];
    const correlationId =
      typeof existingId === 'string' ? existingId : randomUUID();

    // Inyectar en headers del request (para uso interno)
    req.headers[CORRELATION_ID_HEADER] = correlationId;

    // Propagar en response headers (para debugging del cliente)
    res.setHeader(CORRELATION_ID_HEADER, correlationId);

    next();
  }
}

/**
 * Helper para obtener correlation ID desde un request
 *
 * @param req - Express Request
 * @returns El correlation ID o undefined
 */
export function getCorrelationId(req: Request): string | undefined {
  const header = req.headers[CORRELATION_ID_HEADER];
  return typeof header === 'string' ? header : undefined;
}
