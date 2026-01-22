import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Detecta si un valor es un objeto Decimal de Prisma
 * Los Decimals tienen estructura: { s: number, e: number, d: number[] }
 */
function isDecimal(value: unknown): value is Decimal {
  if (value === null || value === undefined) return false;
  if (typeof value !== 'object') return false;

  // Verificar si es instancia de Decimal de Prisma
  if (value instanceof Decimal) return true;

  // Fallback: verificar estructura de Decimal.js serializado
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.s === 'number' &&
    typeof obj.e === 'number' &&
    Array.isArray(obj.d)
  );
}

/**
 * Convierte recursivamente todos los Decimals de Prisma a números JavaScript
 * Esto es necesario porque Prisma serializa Decimal como objeto {s, e, d}
 * en lugar de un número o string
 */
function convertDecimals(data: unknown): unknown {
  // Null/undefined pasan tal cual
  if (data === null || data === undefined) {
    return data;
  }

  // Detectar y convertir Decimals
  if (isDecimal(data)) {
    // Decimal de Prisma tiene método toNumber()
    if (typeof data.toNumber === 'function') {
      return data.toNumber();
    }
    // Fallback para objetos Decimal serializados: reconstruir el número
    const mantissa = data.d.join('');
    const value =
      parseFloat(mantissa) * Math.pow(10, data.e - mantissa.length + 1);
    return data.s === 1 ? value : -value;
  }

  // Arrays: procesar cada elemento
  if (Array.isArray(data)) {
    return data.map(convertDecimals);
  }

  // Fechas: preservar tal cual
  if (data instanceof Date) {
    return data;
  }

  // Objetos: procesar cada propiedad recursivamente
  if (typeof data === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(
      data as Record<string, unknown>,
    )) {
      result[key] = convertDecimals(value);
    }
    return result;
  }

  // Primitivos: retornar tal cual
  return data;
}

/**
 * DecimalResponseInterceptor
 *
 * Interceptor global que convierte todos los Decimals de Prisma a números JavaScript.
 *
 * Motivación:
 * - Prisma serializa campos Decimal como objeto {s, e, d} que no es parseable en frontend
 * - El frontend espera números JavaScript nativos
 *
 * NOTA: Ya no transforma snake_case → camelCase porque:
 * - Prisma Schema usa @map para mapear campos camelCase a columnas snake_case
 * - Prisma Client genera propiedades en camelCase automáticamente
 * - Los services ya retornan camelCase nativo
 *
 * IMPORTANTE: Este interceptor debe ejecutarse ANTES de TransformResponseInterceptor
 * para que los datos se transformen antes de ser envueltos en el formato estándar {data, metadata}.
 *
 * @example
 * // Antes del interceptor (de Prisma):
 * { id: '123', precio: { s: 1, e: 4, d: [15000] } }
 *
 * // Después del interceptor:
 * { id: '123', precio: 15000 }
 */
@Injectable()
export class DecimalResponseInterceptor implements NestInterceptor {
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

        // Convertir Decimals de Prisma a números
        return convertDecimals(data);
      }),
    );
  }
}

/**
 * @deprecated Use DecimalResponseInterceptor instead
 * Alias mantenido para compatibilidad durante migración
 */
export const CamelCaseResponseInterceptor = DecimalResponseInterceptor;
