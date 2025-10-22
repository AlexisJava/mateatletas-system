import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../logger/logger.service';
import { LoggerMetadata } from '../logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Filtro catch-all para excepciones no manejadas
 * Captura cualquier error que no sea HttpException
 * Previene que la aplicación crashee y proporciona respuestas consistentes
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('AllExceptionsFilter');
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Generar ID único para rastrear el error
    const errorId = uuidv4();

    // Determinar status code y mensaje
    const { status, message, stack } = this.extractErrorInfo(exception);

    // Construir respuesta de error
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      errorId,
      message: this.getPublicMessage(status, message),
      // En desarrollo, incluir detalles técnicos
      ...(process.env.NODE_ENV !== 'production' && {
        error: message,
        stack: stack?.split('\n').slice(0, 5), // Primeras 5 líneas del stack
      }),
    };

    // Log del error crítico
    this.logCriticalError(exception, request, status, errorId, stack);

    // Enviar respuesta
    response.status(status).json(errorResponse);
  }

  /**
   * Extraer información del error (status, mensaje, stack)
   */
  private extractErrorInfo(exception: unknown): {
    status: number;
    message: string;
    stack?: string;
  } {
    // Si es HttpException, extraer info
    if (exception instanceof HttpException) {
      return {
        status: exception.getStatus(),
        message: exception.message,
        stack: exception.stack,
      };
    }

    // Si es Error estándar de JavaScript
    if (exception instanceof Error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message,
        stack: exception.stack,
      };
    }

    // Si es un objeto con código de error
    if (typeof exception === 'object' && exception !== null) {
      const error = exception as any;
      return {
        status: error.statusCode || error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unknown error',
        stack: error.stack,
      };
    }

    // Fallback para tipos desconocidos
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: String(exception),
      stack: undefined,
    };
  }

  /**
   * Obtener mensaje público (no exponer detalles internos en producción)
   */
  private getPublicMessage(status: number, internalMessage: string): string {
    // En producción, no exponer detalles de errores 5xx
    if (process.env.NODE_ENV === 'production' && status >= 500) {
      return 'Internal server error. Please contact support with the error ID.';
    }

    return internalMessage;
  }

  /**
   * Loggear error crítico con contexto completo
   */
  private logCriticalError(
    exception: unknown,
    request: Request,
    status: number,
    errorId: string,
    stack?: string,
  ) {
    const { method, url, headers, body, query, params } = request;
    const user = (request as any).user;

    const metadata: LoggerMetadata = {
      errorId,
      statusCode: status,
      method,
      url,
      userId: user?.id,
      userRole: user?.role,
      ip: request.ip,
      userAgent: headers['user-agent'],
      body,
      query,
      params,
      exceptionType: exception?.constructor?.name,
    };

    // Errores no manejados son CRÍTICOS
    this.logger.error(
      `UNHANDLED EXCEPTION: ${this.extractErrorInfo(exception).message}`,
      stack || 'No stack trace available',
      metadata,
    );

    // Si es error 5xx, también enviar alerta
    if (status >= 500) {
      this.logger.error(
        '🚨 CRITICAL: Server error occurred',
        stack,
        {
          ...metadata,
          alert: true,
          severity: 'critical',
        },
      );
    }
  }
}
