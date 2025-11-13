import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

/**
 * TransformResponseInterceptor
 *
 * Interceptor global que estandariza el formato de todas las respuestas de la API.
 * Asegura que todas las respuestas sigan el formato: { data, metadata, message? }
 *
 * Comportamiento:
 * - Si la respuesta ya tiene el formato correcto (propiedad 'data'), la deja tal cual
 * - Si no, envuelve la respuesta en el formato estándar
 * - Agrega timestamp automáticamente en metadata
 * - NO procesa respuestas de error (las maneja AllExceptionsFilter)
 *
 * @example
 * // Antes del interceptor:
 * { id: '123', nombre: 'Juan' }
 *
 * // Después del interceptor:
 * {
 *   data: { id: '123', nombre: 'Juan' },
 *   metadata: {
 *     timestamp: '2025-11-12T10:30:00.000Z'
 *   }
 * }
 *
 * @see api-response.interface.ts para definiciones de tipos
 * @see docs/API-RESPONSE-FORMAT.md para documentación completa
 */
@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // Si la respuesta es null o undefined, envolverla
        if (data === null || data === undefined) {
          return {
            data: data as T,
            metadata: {
              timestamp: new Date().toISOString(),
            },
          };
        }

        // Si no es un objeto, envolverlo (primitivos, arrays, etc.)
        if (typeof data !== 'object') {
          return {
            data: data as T,
            metadata: {
              timestamp: new Date().toISOString(),
            },
          };
        }

        // Si ya tiene la propiedad 'data', asumimos que ya está en formato correcto
        // Esto evita re-envolver respuestas que ya fueron formateadas manualmente
        if ('data' in data && data.data !== undefined) {
          // Asegurar que tenga metadata con timestamp
          if (!data.metadata) {
            return {
              ...data,
              metadata: {
                timestamp: new Date().toISOString(),
              },
            } as ApiResponse<T>;
          }

          // Si tiene metadata pero no timestamp, agregarlo
          if (!data.metadata.timestamp) {
            return {
              ...data,
              metadata: {
                ...data.metadata,
                timestamp: new Date().toISOString(),
              },
            } as ApiResponse<T>;
          }

          // Ya tiene formato completo, retornar tal cual
          return data as ApiResponse<T>;
        }

        // Respuesta que no tiene formato ApiResponse, envolverla
        return {
          data: data as T,
          metadata: {
            timestamp: new Date().toISOString(),
          },
        };
      }),
    );
  }
}
