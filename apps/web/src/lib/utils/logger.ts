/**
 * Logger condicional que solo imprime en modo desarrollo
 * Reemplaza console.log/error/warn en todo el proyecto
 */

import type { LoggableValue } from '@/types/common';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Log normal (info)
   */
  log: (...args: LoggableValue[]): void => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log de errores
   */
  error: (...args: LoggableValue[]): void => {
    if (isDevelopment) {
      console.error(...args);
    }
    // En producción podrías enviar a Sentry u otro servicio
    // Ej: Sentry.captureException(args[0]);
  },

  /**
   * Log de advertencias
   */
  warn: (...args: LoggableValue[]): void => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log de información
   */
  info: (...args: LoggableValue[]): void => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Log de debug (solo en desarrollo)
   */
  debug: (...args: LoggableValue[]): void => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  /**
   * Log de tabla (útil para objetos)
   */
  table: (data: LoggableValue): void => {
    if (isDevelopment) {
      console.table(data);
    }
  },
};

// Re-export por si se necesita verificar el modo
export const IS_DEVELOPMENT = isDevelopment;
