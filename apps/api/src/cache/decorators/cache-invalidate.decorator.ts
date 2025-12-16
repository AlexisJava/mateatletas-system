/**
 * @CacheInvalidate Decorator
 *
 * Invalida claves de cache cuando un método se ejecuta.
 *
 * @example
 * @CacheInvalidate({ keys: ['user:{0}', 'users:list'] })
 * async updateUser(id: string, data: UpdateUserDto): Promise<User> { ... }
 */

import { SetMetadata } from '@nestjs/common';
import { CacheInvalidateOptions } from '../interfaces';
import { CACHE_INVALIDATE_METADATA_KEY } from '../cache.constants';

/**
 * Decorador para invalidar cache
 */
export function CacheInvalidate(
  options: CacheInvalidateOptions,
): MethodDecorator {
  return SetMetadata(CACHE_INVALIDATE_METADATA_KEY, options);
}

/**
 * Normaliza las claves a invalidar a un array
 */
export function normalizeKeys(keys: string | string[]): string[] {
  return Array.isArray(keys) ? keys : [keys];
}

/**
 * Procesa las claves reemplazando placeholders con argumentos
 */
export function processInvalidationKeys(
  keys: string[],
  args: unknown[],
): string[] {
  return keys.map((key) =>
    key.replace(/\{(\d+)\}/g, (_, indexStr: string) => {
      const argIndex = parseInt(indexStr, 10);
      const arg = args[argIndex];

      if (arg === undefined || arg === null) {
        return 'null';
      }

      if (typeof arg === 'object' && arg !== null) {
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
    }),
  );
}

// Re-export types
export type { CacheInvalidateOptions };
