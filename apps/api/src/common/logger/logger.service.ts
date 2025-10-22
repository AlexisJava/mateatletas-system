import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

/**
 * Servicio de logging estructurado con Winston
 * Proporciona logs con contexto, metadata y rotación automática
 * Implementa la interfaz NestLoggerService para integración completa
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor(context?: string) {
    this.context = context;
    this.logger = this.createLogger();
  }

  /**
   * Crear instancia de Winston Logger con transports configurados
   */
  private createLogger(): winston.Logger {
    const isDevelopment = process.env.NODE_ENV !== 'production';

    // Formato común para todos los logs
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json(),
    );

    // Formato para consola (más legible en desarrollo)
    const consoleFormat = winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, context, ...metadata }) => {
        let msg = `${timestamp} [${level}]`;

        if (context) {
          msg += ` [${context}]`;
        }

        msg += `: ${message}`;

        // Agregar metadata si existe
        const metadataString = Object.keys(metadata).length > 0
          ? `\n${JSON.stringify(metadata, null, 2)}`
          : '';

        return msg + metadataString;
      }),
    );

    // Transports
    const transports: winston.transport[] = [];

    // 1. Console transport (siempre activo)
    transports.push(
      new winston.transports.Console({
        format: isDevelopment ? consoleFormat : logFormat,
        level: isDevelopment ? 'debug' : 'info',
      }),
    );

    // 2. File transport con rotación para errores
    transports.push(
      new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        format: logFormat,
        maxSize: '20m',
        maxFiles: '14d', // Mantener logs de errores por 14 días
        zippedArchive: true,
      }),
    );

    // 3. File transport con rotación para todos los logs
    transports.push(
      new DailyRotateFile({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        format: logFormat,
        maxSize: '20m',
        maxFiles: '7d', // Mantener logs combinados por 7 días
        zippedArchive: true,
      }),
    );

    return winston.createLogger({
      level: isDevelopment ? 'debug' : 'info',
      format: logFormat,
      transports,
      // Evitar logs duplicados
      exitOnError: false,
    });
  }

  /**
   * Establecer contexto para todos los logs subsiguientes
   */
  setContext(context: string) {
    this.context = context;
  }

  /**
   * Log nivel DEBUG (desarrollo)
   */
  debug(message: string, metadata?: Record<string, any>) {
    this.logger.debug(message, { context: this.context, ...metadata });
  }

  /**
   * Log nivel INFO (informativo)
   */
  log(message: string, metadata?: Record<string, any>) {
    this.logger.info(message, { context: this.context, ...metadata });
  }

  /**
   * Log nivel WARN (advertencia)
   */
  warn(message: string, metadata?: Record<string, any>) {
    this.logger.warn(message, { context: this.context, ...metadata });
  }

  /**
   * Log nivel ERROR (error con stack trace)
   */
  error(message: string, trace?: string, metadata?: Record<string, any>) {
    this.logger.error(message, {
      context: this.context,
      trace,
      ...metadata,
    });
  }

  /**
   * Log nivel VERBOSE (detallado)
   */
  verbose(message: string, metadata?: Record<string, any>) {
    this.logger.verbose(message, { context: this.context, ...metadata });
  }

  /**
   * Log con metadata estructurada personalizada
   * Útil para eventos de negocio importantes
   */
  logEvent(event: string, metadata: Record<string, any>) {
    this.logger.info(event, {
      context: this.context,
      eventType: 'business_event',
      ...metadata,
    });
  }

  /**
   * Log de performance (medir tiempos de ejecución)
   */
  logPerformance(operation: string, durationMs: number, metadata?: Record<string, any>) {
    this.logger.info(`Performance: ${operation}`, {
      context: this.context,
      eventType: 'performance',
      operation,
      durationMs,
      ...metadata,
    });
  }

  /**
   * Log de operaciones de base de datos
   */
  logDatabase(operation: string, query?: string, durationMs?: number) {
    this.logger.debug(`Database: ${operation}`, {
      context: this.context,
      eventType: 'database',
      operation,
      query,
      durationMs,
    });
  }

  /**
   * Log de autenticación y autorización
   */
  logAuth(action: string, userId?: string, metadata?: Record<string, any>) {
    this.logger.info(`Auth: ${action}`, {
      context: this.context,
      eventType: 'auth',
      action,
      userId,
      ...metadata,
    });
  }

  /**
   * Log de requests HTTP
   */
  logHttp(
    method: string,
    url: string,
    statusCode: number,
    durationMs: number,
    metadata?: Record<string, any>,
  ) {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    this.logger[level](`HTTP ${method} ${url}`, {
      context: this.context,
      eventType: 'http',
      method,
      url,
      statusCode,
      durationMs,
      ...metadata,
    });
  }

  /**
   * Log de errores de validación
   */
  logValidationError(
    field: string,
    value: unknown,
    constraints: Record<string, string>,
  ) {
    this.logger.warn('Validation Error', {
      context: this.context,
      eventType: 'validation',
      field,
      value,
      constraints,
    });
  }
}
