import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import camelcaseKeys from 'camelcase-keys';

/**
 * CamelCaseResponseInterceptor
 *
 * Interceptor global que transforma todas las keys de las respuestas de snake_case a camelCase.
 *
 * Motivación:
 * - Prisma (con PostgreSQL) retorna campos en snake_case (nivel_escolar, foto_url, etc.)
 * - El frontend (Next.js/React) espera camelCase según convención JavaScript
 * - Sin esta transformación, el frontend recibe `undefined` en campos snake_case
 *
 * IMPORTANTE: Este interceptor debe ejecutarse ANTES de TransformResponseInterceptor
 * para que los datos se transformen antes de ser envueltos en el formato estándar {data, metadata}.
 *
 * Orden de ejecución en main.ts:
 * 1. CamelCaseResponseInterceptor - Transforma snake_case → camelCase
 * 2. TransformResponseInterceptor - Envuelve en {data, metadata}
 *
 * @example
 * // Antes del interceptor (de Prisma):
 * { id: '123', nivel_escolar: 'PRIMARIA', foto_url: 'https://...' }
 *
 * // Después del interceptor:
 * { id: '123', nivelEscolar: 'PRIMARIA', fotoUrl: 'https://...' }
 */
@Injectable()
export class CamelCaseResponseInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        // Preservar null y undefined tal cual
        if (data === null || data === undefined) {
          return data;
        }

        // Preservar primitivos (string, number, boolean)
        if (typeof data !== 'object') {
          return data as string | number | boolean;
        }

        // Transformar recursivamente todas las keys a camelCase
        // camelcase-keys con deep:true maneja objetos anidados y arrays automáticamente
        return camelcaseKeys(data as Record<string, unknown>, { deep: true });
      }),
    );
  }
}
