/**
 * Logger condicional que solo imprime en modo desarrollo
 * Reemplaza console.log/error/warn en todo el proyecto
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Log normal (info)
   */
  log: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log de errores
   */
  error: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.error(...args);
    }
    // En producción podrías enviar a Sentry u otro servicio
    // Ej: Sentry.captureException(args[0]);
  },

  /**
   * Log de advertencias
   */
  warn: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log de información
   */
  info: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Log de debug (solo en desarrollo)
   */
  debug: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  /**
   * Log de tabla (útil para objetos)
   */
  table: (data: unknown): void => {
    if (isDevelopment) {
      console.table(data);
    }
  },
};

// Re-export por si se necesita verificar el modo
export const IS_DEVELOPMENT = isDevelopment;
