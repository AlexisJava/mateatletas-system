import { Transform } from 'class-transformer';

/**
 * Decorador para convertir un string a minúsculas
 * Útil para emails y usernames para evitar duplicados por case sensitivity
 */
export function Lowercase() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase();
    }
    return value;
  });
}
