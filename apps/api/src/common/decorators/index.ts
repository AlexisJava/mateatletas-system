/**
 * Custom decorators para transformación y sanitización de datos
 * Se aplican automáticamente durante la validación de DTOs
 */

export * from './trim.decorator';
export * from './capitalize.decorator';
export * from './lowercase.decorator';
export * from './sanitize-html.decorator';

/**
 * Security decorator para protección CSRF opt-in
 */
export * from './require-csrf.decorator';
