import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import snakecaseKeys from 'snakecase-keys';

/**
 * SnakeCaseRequestInterceptor
 *
 * Interceptor global que transforma los datos de entrada (request) de camelCase a snake_case.
 *
 * Motivación:
 * - El frontend (Next.js/React) usa camelCase según convención JavaScript
 * - Los DTOs del backend usan snake_case para coincidir con Prisma/PostgreSQL
 * - Este interceptor permite que el frontend envíe camelCase y el backend lo reciba como snake_case
 *
 * Transforma:
 * - Query parameters (GET requests)
 * - Request body (POST/PUT/PATCH requests)
 *
 * Trabaja en conjunto con CamelCaseResponseInterceptor:
 * - REQUEST:  Frontend (camelCase) → SnakeCaseRequestInterceptor → Backend DTOs (snake_case)
 * - RESPONSE: Backend (snake_case) → CamelCaseResponseInterceptor → Frontend (camelCase)
 *
 * @example
 * // Frontend envía:
 * GET /admin/clase-grupos?productoId=xxx&anioLectivo=2025
 *
 * // Backend recibe (después del interceptor):
 * GET /admin/clase-grupos?productoId=xxx&anio_lectivo=2025
 *
 * @example
 * // Frontend envía body:
 * { "fechaInicio": "2025-01-01", "cupoMaximo": 20 }
 *
 * // Backend recibe (después del interceptor):
 * { "fechaInicio": "2025-01-01", "cupoMaximo": 20 }
 */
@Injectable()
export class SnakeCaseRequestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();

    // Transformar query parameters
    // Clonar a plain object porque Express query no es plain object puro
    if (
      request.query &&
      typeof request.query === 'object' &&
      Object.keys(request.query).length > 0
    ) {
      const plainQuery = { ...request.query } as Record<string, unknown>;
      request.query = snakecaseKeys(plainQuery, {
        deep: true,
      }) as typeof request.query;
    }

    // Transformar body (para POST, PUT, PATCH)
    // Solo transformar si es un objeto plano (no arrays, no null, no primitivos)
    if (
      request.body &&
      typeof request.body === 'object' &&
      !Array.isArray(request.body) &&
      Object.keys(request.body as Record<string, unknown>).length > 0
    ) {
      const plainBody = { ...request.body } as Record<string, unknown>;
      request.body = snakecaseKeys(plainBody, {
        deep: true,
      });
    }

    return next.handle();
  }
}
