import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { LoggerMetadata } from './logger.types';
import { RequestContext } from '../../observability/context/request-context';

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

  // Campos conocidos para validación de tipos en sanitizeMetadata
  private static readonly STRING_FIELDS = new Set([
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
  private static readonly NUMBER_FIELDS = new Set(['durationMs', 'statusCode']);
  private static readonly BOOLEAN_FIELDS = new Set(['alert']);
  private static readonly SKIP_FIELDS = new Set(['context', 'trace']);

  private sanitizeMetadata(metadata?: unknown): LoggerMetadata | undefined {
    if (metadata === undefined || metadata === null) {
      return undefined;
    }

    const primitiveResult = this.handlePrimitiveMetadata(metadata);
    if (primitiveResult !== null) {
      return primitiveResult;
    }

    if (!this.isRecord(metadata)) {
      return undefined;
    }

    return this.sanitizeRecordMetadata(metadata);
  }

  private handlePrimitiveMetadata(
    metadata: unknown,
  ): LoggerMetadata | undefined | null {
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

    // null indica que no es primitivo, seguir procesando
    return null;
  }

  private sanitizeRecordMetadata(
    metadata: Record<string, unknown>,
  ): LoggerMetadata {
    const sanitized: LoggerMetadata = {};

    for (const [key, value] of Object.entries(metadata)) {
      if (value === undefined || LoggerService.SKIP_FIELDS.has(key)) {
        continue;
      }

      const sanitizedValue = this.sanitizeFieldValue(key, value);
      if (sanitizedValue !== undefined) {
        sanitized[key] = sanitizedValue;
      }
    }

    return sanitized;
  }

  private sanitizeFieldValue(key: string, value: unknown): unknown {
    if (key === 'query') {
      return typeof value === 'string' || this.isRecord(value)
        ? value
        : undefined;
    }

    if (LoggerService.STRING_FIELDS.has(key)) {
      return typeof value === 'string' ? value : undefined;
    }

    if (LoggerService.NUMBER_FIELDS.has(key)) {
      return typeof value === 'number' ? value : undefined;
    }

    if (LoggerService.BOOLEAN_FIELDS.has(key)) {
      return typeof value === 'boolean' ? value : undefined;
    }

    if (key === 'liveMode') {
      return typeof value === 'boolean' || typeof value === 'string'
        ? value
        : undefined;
    }

    if (key === 'constraints') {
      return this.isStringRecord(value) ? value : undefined;
    }

    return value;
  }

  private mergeMetadata(metadata?: LoggerMetadata): LoggerMetadata | undefined {
    if (!metadata) {
      return undefined;
    }

    return Object.keys(metadata).length > 0 ? metadata : undefined;
  }

  /**
   * Obtiene el requestId del contexto actual (AsyncLocalStorage)
   * Retorna undefined si no hay contexto activo
   */
  private getRequestIdFromContext(): string | undefined {
    return RequestContext.getRequestId();
  }

  /**
   * Construye el objeto de metadata base incluyendo contexto y requestId
   */
  private buildBaseMetadata(
    additionalMetadata?: LoggerMetadata,
  ): Record<string, unknown> {
    const requestId = this.getRequestIdFromContext();
    return {
      context: this.context,
      ...(requestId ? { requestId } : {}),
      ...(additionalMetadata ?? {}),
    };
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
      winston.format.printf((info: winston.Logform.TransformableInfo) => {
        const { timestamp, level, message, context, ...rest } = info;
        const metadata = rest as Record<string, unknown>;
        const safeTimestamp =
          typeof timestamp === 'string' ? timestamp : new Date().toISOString();
        const levelLabel = String(level);
        let msg = `${safeTimestamp} [${levelLabel}]`;

        if (typeof context === 'string') {
          msg += ` [${context}]`;
        }

        const messageText =
          typeof message === 'string' ? message : JSON.stringify(message);

        msg += `: ${messageText}`;

        // Agregar metadata si existe
        const metadataString =
          Object.keys(metadata).length > 0
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
  debug(message: string, metadata?: unknown) {
    const sanitized = this.mergeMetadata(this.sanitizeMetadata(metadata));
    this.logger.debug(message, this.buildBaseMetadata(sanitized));
  }

  /**
   * Log nivel INFO (informativo)
   */
  log(message: string, metadata?: unknown) {
    const sanitized = this.mergeMetadata(this.sanitizeMetadata(metadata));
    this.logger.info(message, this.buildBaseMetadata(sanitized));
  }

  /**
   * Log nivel WARN (advertencia)
   */
  warn(message: string, metadata?: unknown) {
    const sanitized = this.mergeMetadata(this.sanitizeMetadata(metadata));
    this.logger.warn(message, this.buildBaseMetadata(sanitized));
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
      ...this.buildBaseMetadata(sanitized),
      ...(trace ? { trace } : {}),
    });
  }

  /**
   * Log nivel VERBOSE (detallado)
   */
  verbose(message: string, metadata?: unknown) {
    const sanitized = this.mergeMetadata(this.sanitizeMetadata(metadata));
    this.logger.verbose(message, this.buildBaseMetadata(sanitized));
  }

  /**
   * Log con metadata estructurada personalizada
   * Útil para eventos de negocio importantes
   */
  logEvent(event: string, metadata: unknown) {
    const sanitized = this.mergeMetadata(this.sanitizeMetadata(metadata));
    this.logger.info(event, {
      ...this.buildBaseMetadata(sanitized),
      eventType: 'business_event',
    });
  }

  /**
   * Log de performance (medir tiempos de ejecución)
   */
  logPerformance(operation: string, durationMs: number, metadata?: unknown) {
    const sanitized = this.mergeMetadata(this.sanitizeMetadata(metadata));
    this.logger.info(`Performance: ${operation}`, {
      ...this.buildBaseMetadata(sanitized),
      eventType: 'performance',
      operation,
      durationMs,
    });
  }

  /**
   * Log de operaciones de base de datos
   */
  logDatabase(operation: string, query?: string, durationMs?: number) {
    this.logger.debug(`Database: ${operation}`, {
      ...this.buildBaseMetadata(),
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
      ...this.buildBaseMetadata(sanitized),
      eventType: 'auth',
      action,
      userId,
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
      ...this.buildBaseMetadata(sanitized),
      eventType: 'http',
      method,
      url,
      statusCode,
      durationMs,
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
      ...this.buildBaseMetadata(),
      eventType: 'validation',
      field,
      value,
      constraints,
    });
  }
}
