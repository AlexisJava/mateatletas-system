import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { LoggerService } from '../logger/logger.service';
import { v4 as uuidv4 } from 'uuid';

interface ErrorMapping {
  status: HttpStatus;
  message: string;
  detailsKey?: string;
  detailsFormatter?: (
    meta: Prisma.PrismaClientKnownRequestError['meta'],
  ) => string | undefined;
}

/**
 * Global exception filter para manejar errores de Prisma
 * Convierte errores de BD en respuestas HTTP apropiadas con logging estructurado
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private static readonly ERROR_MAPPINGS: Record<string, ErrorMapping> = {
    P2000: {
      status: HttpStatus.BAD_REQUEST,
      message: 'El valor proporcionado es demasiado largo para el campo',
      detailsKey: 'column_name',
    },
    P2001: {
      status: HttpStatus.NOT_FOUND,
      message: 'Registro no encontrado',
      detailsKey: 'cause',
    },
    P2004: {
      status: HttpStatus.BAD_REQUEST,
      message: 'Fallo en restricción de la base de datos',
      detailsKey: 'database_error',
    },
    P2015: {
      status: HttpStatus.NOT_FOUND,
      message: 'No se encontró el registro relacionado',
      detailsKey: 'cause',
    },
    P2018: {
      status: HttpStatus.BAD_REQUEST,
      message: 'No se encontraron los registros conectados requeridos',
      detailsKey: 'cause',
    },
    P2019: {
      status: HttpStatus.BAD_REQUEST,
      message: 'Error de entrada de datos',
      detailsKey: 'cause',
    },
    P2025: {
      status: HttpStatus.NOT_FOUND,
      message: 'Registro no encontrado para actualizar o eliminar',
      detailsKey: 'cause',
    },
  };

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('PrismaExceptionFilter');
  }

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const errorId = uuidv4();

    this.logError(exception, request, errorId);

    const { status, message, details } = this.mapErrorCode(exception);
    const errorResponse = this.buildErrorResponse(
      status,
      message,
      details,
      errorId,
      request,
      exception,
    );

    response.status(status).json(errorResponse);
  }

  private logError(
    exception: Prisma.PrismaClientKnownRequestError,
    request: Request,
    errorId: string,
  ): void {
    this.logger.logDatabase(
      `Prisma Error: ${exception.code}`,
      exception.message,
    );

    this.logger.error(`Database error: ${exception.code}`, exception.stack, {
      errorId,
      code: exception.code,
      meta: exception.meta,
      path: request.url,
      method: request.method,
      userId: (request as Request & { user?: { id: string } }).user?.id,
    });
  }

  private mapErrorCode(exception: Prisma.PrismaClientKnownRequestError): {
    status: HttpStatus;
    message: string;
    details?: string;
  } {
    // Casos especiales que requieren lógica adicional
    const specialCase = this.handleSpecialCases(exception);
    if (specialCase) {
      return specialCase;
    }

    // Usar mapeo estático para casos simples
    const mapping = PrismaExceptionFilter.ERROR_MAPPINGS[exception.code];
    if (mapping) {
      const details = mapping.detailsKey
        ? this.getMetaValue<string>(exception.meta, mapping.detailsKey)
        : undefined;
      return { status: mapping.status, message: mapping.message, details };
    }

    // Default
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error inesperado en la base de datos',
      details: `Código de error: ${exception.code}`,
    };
  }

  private handleSpecialCases(
    exception: Prisma.PrismaClientKnownRequestError,
  ): { status: HttpStatus; message: string; details?: string } | null {
    switch (exception.code) {
      case 'P2002': {
        const target = this.getMetaValue<string[]>(exception.meta, 'target');
        const field = target?.[0] ?? 'campo';
        return {
          status: HttpStatus.CONFLICT,
          message: `Ya existe un registro con ese ${field}`,
          details: target
            ? `Violación de restricción única en: ${target.join(', ')}`
            : undefined,
        };
      }
      case 'P2003': {
        const fieldName = this.getMetaValue<string>(
          exception.meta,
          'field_name',
        );
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Referencia inválida - el registro relacionado no existe',
          details: fieldName
            ? `El campo ${fieldName} hace referencia a un registro que no existe`
            : 'Error de clave foránea',
        };
      }
      case 'P2011': {
        const constraint = this.getMetaValue<string>(
          exception.meta,
          'constraint',
        );
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Violación de restricción de nulabilidad',
          details: constraint
            ? `El campo ${constraint} no puede ser nulo`
            : undefined,
        };
      }
      case 'P2014': {
        const relation = this.getMetaValue<string>(
          exception.meta,
          'relation_name',
        );
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'La operación viola una relación requerida',
          details: relation ? `Relación requerida: ${relation}` : undefined,
        };
      }
      default:
        return null;
    }
  }

  private buildErrorResponse(
    status: HttpStatus,
    message: string,
    details: string | undefined,
    errorId: string,
    request: Request,
    exception: Prisma.PrismaClientKnownRequestError,
  ): PrismaErrorResponse {
    const errorResponse: PrismaErrorResponse = {
      statusCode: status,
      message,
      error: this.getErrorName(status),
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      errorId,
    };

    if (details) {
      errorResponse.details = details;
    }

    if (process.env.NODE_ENV !== 'production') {
      errorResponse.prismaCode = exception.code;
      errorResponse.prismaMessage = exception.message;
      if (exception.meta) {
        errorResponse.meta = this.normalizeMeta(exception.meta);
      }
    }

    return errorResponse;
  }

  private getErrorName(status: HttpStatus): string {
    const errorNames: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Bad Request',
      [HttpStatus.NOT_FOUND]: 'Not Found',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    };

    return errorNames[status] || 'Unknown Error';
  }

  private getMetaValue<T>(
    meta: Prisma.PrismaClientKnownRequestError['meta'],
    key: string,
  ): T | undefined {
    if (this.isMetaRecord(meta) && key in meta) {
      return meta[key] as T;
    }
    return undefined;
  }

  private normalizeMeta(
    meta: Prisma.PrismaClientKnownRequestError['meta'],
  ): Record<string, unknown> | undefined {
    if (!this.isMetaRecord(meta)) {
      return undefined;
    }
    return { ...meta };
  }

  private isMetaRecord(
    meta: Prisma.PrismaClientKnownRequestError['meta'],
  ): meta is Record<string, unknown> {
    return Boolean(meta && typeof meta === 'object' && !Array.isArray(meta));
  }
}

interface PrismaErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  method: string;
  errorId: string;
  details?: string;
  prismaCode?: string;
  prismaMessage?: string;
  meta?: Record<string, unknown>;
}
