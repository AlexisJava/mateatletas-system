import { Transform } from 'class-transformer';

/**
 * Decorador para eliminar espacios en blanco al inicio y fin de un string
 * Se aplica automáticamente durante la transformación del DTO
 */
export function Trim() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  });
}
