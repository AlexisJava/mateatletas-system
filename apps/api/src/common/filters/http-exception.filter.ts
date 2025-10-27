import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../logger/logger.service';
import { LoggerMetadata } from '../logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Filtro global para excepciones HTTP
 * Proporciona respuestas de error consistentes y logging estructurado
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('HttpExceptionFilter');
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Generar ID único para rastrear el error
    const errorId = uuidv4();

    // Extraer mensaje y detalles del error
    const errorResponse = this.buildErrorResponse(
      status,
      exceptionResponse,
      request,
      errorId,
    );

    // Log del error con contexto completo
    this.logError(exception, request, status, errorId);

    // Enviar respuesta al cliente
    response.status(status).json(errorResponse);
  }

  /**
   * Construir respuesta de error estructurada
   */
  private buildErrorResponse(
    status: number,
    exceptionResponse: string | object,
    request: Request,
    errorId: string,
  ): Record<string, unknown> & {
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    errorId: string;
  } {
    // Si la respuesta ya es un objeto, usarla como base
    const baseResponse: Record<string, unknown> =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as Record<string, unknown>)
        : { message: exceptionResponse };

    return {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      errorId, // ID único para rastreo
      ...baseResponse,
    };
  }

  /**
   * Loggear el error con contexto completo
   */
  private logError(
    exception: HttpException,
    request: Request,
    status: number,
    errorId: string,
  ) {
    const method = request.method;
    const url = request.url;
    const headers = request.headers;
    const body: unknown = request.body;
    const query = request.query as Record<string, unknown>;
    const params = request.params as Record<string, unknown>;
    const { user } = request as Request & {
      user?: { id?: string; role?: string };
    };

    // Determinar nivel de log según el status code
    const logLevel = this.getLogLevel(status);

    const baseMetadata: LoggerMetadata = {
      errorId,
      statusCode: status,
      method,
      url,
      userId: user?.id,
      userRole: user?.role,
      ip: request.ip,
      userAgent: headers['user-agent'],
    };
    const metadata: LoggerMetadata =
      status >= 500
        ? {
            ...baseMetadata,
            body,
            query,
            params,
          }
        : baseMetadata;

    // Log según nivel
    if (logLevel === 'error') {
      this.logger.error(
        `HTTP Exception: ${exception.message}`,
        exception.stack,
        metadata,
      );
    } else if (logLevel === 'warn') {
      this.logger.warn(`HTTP Exception: ${exception.message}`, metadata);
    } else {
      this.logger.log(`HTTP Exception: ${exception.message}`, metadata);
    }
  }

  /**
   * Determinar nivel de log según status code
   */
  private getLogLevel(status: number): 'error' | 'warn' | 'info' {
    if (status >= 500) return 'error'; // Errores del servidor
    if (status >= 400) return 'warn'; // Errores del cliente
    return 'info';
  }
}
