/**
 * @Cacheable Decorator
 *
 * Cachea automáticamente el resultado de un método.
 *
 * @example
 * @Cacheable({ key: 'user:{0}', ttl: 300 })
 * async getUser(id: string): Promise<User> { ... }
 */

import { SetMetadata } from '@nestjs/common';
import { CacheableOptions, CacheLevel } from '../interfaces';
import { CACHEABLE_METADATA_KEY } from '../cache.constants';

/**
 * Decorador para cachear resultados de métodos
 */
export function Cacheable(options: CacheableOptions): MethodDecorator {
  return SetMetadata(CACHEABLE_METADATA_KEY, options);
}

/**
 * Genera la clave de cache reemplazando placeholders con argumentos
 */
export function buildCacheKey(template: string, args: unknown[]): string {
  return template.replace(/\{(\d+)\}/g, (_, indexStr: string) => {
    const argIndex = parseInt(indexStr, 10);
    const arg = args[argIndex];

    if (arg === undefined || arg === null) {
      return 'null';
    }

    if (typeof arg === 'object' && arg !== null) {
      // Para objetos, intentar usar 'id' si existe
      const record = arg as Record<string, unknown>;
      if ('id' in record && record.id !== undefined && record.id !== null) {
        const id = record.id;
        if (typeof id === 'string' || typeof id === 'number') {
          return String(id);
        }
      }
      return JSON.stringify(arg);
    }

    return String(arg as string | number | boolean);
  });
}

// Re-export types
export type { CacheableOptions };
export { CacheLevel };
