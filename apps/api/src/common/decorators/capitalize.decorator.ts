import { Transform } from 'class-transformer';

/**
 * Decorador para capitalizar la primera letra de cada palabra
 * Ejemplo: "juan pérez" → "Juan Pérez"
 */
export function Capitalize() {
  return Transform(({ value }: { value: string }) => {
    if (typeof value === 'string') {
      return value
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return value;
  });
}
