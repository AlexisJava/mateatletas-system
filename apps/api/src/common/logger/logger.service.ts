import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { LoggerMetadata } from './logger.types';

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

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private isStringRecord(value: unknown): value is Record<string, string> {
    if (!this.isRecord(value)) {
      return false;
    }

    return Object.values(value).every((item) => typeof item === 'string');
  }

  private sanitizeMetadata(metadata?: unknown): LoggerMetadata | undefined {
    if (metadata === undefined || metadata === null) {
      return undefined;
    }

    if (metadata instanceof Error) {
      return {
        errorName: metadata.name,
        errorMessage: metadata.message,
        stack: metadata.stack,
      };
    }

    if (
      typeof metadata === 'string' ||
      typeof metadata === 'number' ||
      typeof metadata === 'boolean' ||
      typeof metadata === 'bigint'
    ) {
      return { detail: metadata };
    }

    if (Array.isArray(metadata)) {
      return { detail: metadata };
    }

    if (!this.isRecord(metadata)) {
      return undefined;
    }

    const stringFields = new Set([
      'eventType',
      'operation',
      'action',
      'userId',
      'userRole',
      'method',
      'url',
      'field',
      'errorId',
      'ip',
      'userAgent',
      'severity',
      'type',
      'dataId',
      'timestamp',
      'errorMessage',
      'errorName',
      'stack',
    ]);
    const numberFields = new Set(['durationMs', 'statusCode']);
    const booleanFields = new Set(['alert']);

    const sanitized: LoggerMetadata = {};

    for (const [key, value] of Object.entries(metadata)) {
      if (value === undefined) {
        continue;
      }

      if (key === 'context' || key === 'trace') {
        continue;
      }

      if (key === 'query') {
        if (typeof value === 'string' || this.isRecord(value)) {
          sanitized.query = value;
        }
        continue;
      }

      if (stringFields.has(key)) {
        if (typeof value === 'string') {
          sanitized[key] = value;
        }
        continue;
      }

      if (numberFields.has(key)) {
        if (typeof value === 'number') {
          sanitized[key] = value;
        }
        continue;
      }

      if (booleanFields.has(key)) {
        if (typeof value === 'boolean') {
          sanitized[key] = value;
        }
        continue;
      }

      if (key === 'liveMode') {
        if (typeof value === 'boolean' || typeof value === 'string') {
          sanitized[key] = value;
        }
        continue;
      }

      if (key === 'constraints') {
        if (this.isStringRecord(value)) {
          sanitized.constraints = value;
        }
        continue;
      }

      sanitized[key] = value as unknown;
    }

    return sanitized;
  }

  private mergeMetadata(metadata?: LoggerMetadata): LoggerMetadata | undefined {
    if (!metadata) {
      return undefined;
    }

    return Object.keys(metadata).length > 0 ? metadata : undefined;
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
      winston.format.printf(
        ({ timestamp, level, message, context, ...metadata }: { timestamp: string; level: string; message: string; context?: string; [key: string]: unknown }) => {
          let msg = `${timestamp} [${level}]`;

          if (context) {
            msg += ` [${context}]`;
          }

          msg += `: ${message}`;

          // Agregar metadata si existe
          const metadataString =
            Object.keys(metadata).length > 0
              ? `\n${JSON.stringify(metadata, null, 2)}`
              : '';

          return msg + metadataString;
        },
      ),
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
  debug(message: string, metadata?: unknown) {
    const sanitized = this.mergeMetadata(this.sanitizeMetadata(metadata));
    this.logger.debug(message, {
      context: this.context,
      ...(sanitized ?? {}),
    });
  }

  /**
   * Log nivel INFO (informativo)
   */
  log(message: string, metadata?: unknown) {
    const sanitized = this.mergeMetadata(this.sanitizeMetadata(metadata));
    this.logger.info(message, {
      context: this.context,
      ...(sanitized ?? {}),
    });
  }

  /**
   * Log nivel WARN (advertencia)
   */
  warn(message: string, metadata?: unknown) {
    const sanitized = this.mergeMetadata(this.sanitizeMetadata(metadata));
    this.logger.warn(message, {
      context: this.context,
      ...(sanitized ?? {}),
    });
  }

  /**
   * Log nivel ERROR (error con stack trace)
   */
  error(
    message: string,
    traceOrMetadata?: string | Error | Record<string, unknown> | LoggerMetadata,
    metadataOrUndefined?: Record<string, unknown> | LoggerMetadata,
  ) {
    let trace: string | undefined;
    let metadataCandidate: unknown;

    if (traceOrMetadata instanceof Error) {
      trace = traceOrMetadata.stack || traceOrMetadata.message;
      metadataCandidate = metadataOrUndefined;
    } else if (typeof traceOrMetadata === 'string') {
      trace = traceOrMetadata;
      metadataCandidate = metadataOrUndefined;
    } else if (this.isRecord(traceOrMetadata)) {
      metadataCandidate = traceOrMetadata;
      trace =
        typeof metadataOrUndefined === 'string'
          ? metadataOrUndefined
          : undefined;
    } else if (traceOrMetadata !== undefined) {
      trace = String(traceOrMetadata);
      metadataCandidate = metadataOrUndefined;
    } else {
      metadataCandidate = metadataOrUndefined;
    }

    const sanitized = this.mergeMetadata(
      this.sanitizeMetadata(metadataCandidate),
    );

    this.logger.error(message, {
      context: this.context,
      ...(trace ? { trace } : {}),
      ...(sanitized ?? {}),
    });
  }

  /**
   * Log nivel VERBOSE (detallado)
   */
  verbose(message: string, metadata?: unknown) {
    const sanitized = this.mergeMetadata(this.sanitizeMetadata(metadata));
    this.logger.verbose(message, {
      context: this.context,
      ...(sanitized ?? {}),
    });
  }

  /**
   * Log con metadata estructurada personalizada
   * Útil para eventos de negocio importantes
   */
  logEvent(event: string, metadata: unknown) {
    const sanitized = this.mergeMetadata(this.sanitizeMetadata(metadata));
    this.logger.info(event, {
      context: this.context,
      eventType: 'business_event',
      ...(sanitized ?? {}),
    });
  }

  /**
   * Log de performance (medir tiempos de ejecución)
   */
  logPerformance(operation: string, durationMs: number, metadata?: unknown) {
    const sanitized = this.mergeMetadata(this.sanitizeMetadata(metadata));
    this.logger.info(`Performance: ${operation}`, {
      context: this.context,
      eventType: 'performance',
      operation,
      durationMs,
      ...(sanitized ?? {}),
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
  logAuth(action: string, userId?: string, metadata?: unknown) {
    const sanitized = this.mergeMetadata(this.sanitizeMetadata(metadata));
    this.logger.info(`Auth: ${action}`, {
      context: this.context,
      eventType: 'auth',
      action,
      userId,
      ...(sanitized ?? {}),
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
    metadata?: unknown,
  ) {
    const level =
      statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    const sanitized = this.mergeMetadata(this.sanitizeMetadata(metadata));

    this.logger[level](`HTTP ${method} ${url}`, {
      context: this.context,
      eventType: 'http',
      method,
      url,
      statusCode,
      durationMs,
      ...(sanitized ?? {}),
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
