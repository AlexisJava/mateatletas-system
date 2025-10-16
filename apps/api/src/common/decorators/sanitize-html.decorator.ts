import { Transform } from 'class-transformer';

/**
 * Decorador para sanitizar HTML y prevenir XSS
 * Elimina tags HTML peligrosos y scripts
 */
export function SanitizeHTML() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      // Eliminar tags HTML peligrosos
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
        .replace(/<embed\b[^<]*>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Eliminar event handlers inline
        .replace(/javascript:/gi, ''); // Eliminar javascript: URLs
    }
    return value;
  });
}
