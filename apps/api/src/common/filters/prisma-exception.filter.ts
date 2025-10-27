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

/**
 * Global exception filter para manejar errores de Prisma
 * Convierte errores de BD en respuestas HTTP apropiadas con logging estructurado
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('PrismaExceptionFilter');
  }

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Generar ID único para rastrear el error
    const errorId = uuidv4();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error en la base de datos';
    let details: string | undefined;

    // Log del error con contexto completo
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

    // Mapear códigos de error de Prisma a respuestas HTTP
    switch (exception.code) {
      case 'P2000': {
        status = HttpStatus.BAD_REQUEST;
        message = 'El valor proporcionado es demasiado largo para el campo';
        details = this.getMetaValue<string>(exception.meta, 'column_name');
        break;
      }

      case 'P2001': {
        status = HttpStatus.NOT_FOUND;
        message = 'Registro no encontrado';
        details = this.getMetaValue<string>(exception.meta, 'cause');
        break;
      }

      case 'P2002': {
        status = HttpStatus.CONFLICT;
        const target = this.getMetaValue<string[]>(exception.meta, 'target');
        const field = target?.[0] ?? 'campo';
        message = `Ya existe un registro con ese ${field}`;
        details = target
          ? `Violación de restricción única en: ${target.join(', ')}`
          : undefined;
        break;
      }

      case 'P2003': {
        status = HttpStatus.BAD_REQUEST;
        const fieldName = this.getMetaValue<string>(
          exception.meta,
          'field_name',
        );
        message = 'Referencia inválida - el registro relacionado no existe';
        details = fieldName
          ? `El campo ${fieldName} hace referencia a un registro que no existe`
          : 'Error de clave foránea';
        break;
      }

      case 'P2004': {
        status = HttpStatus.BAD_REQUEST;
        message = 'Fallo en restricción de la base de datos';
        details = this.getMetaValue<string>(exception.meta, 'database_error');
        break;
      }

      case 'P2011': {
        status = HttpStatus.BAD_REQUEST;
        const constraint = this.getMetaValue<string>(
          exception.meta,
          'constraint',
        );
        message = 'Violación de restricción de nulabilidad';
        details = constraint
          ? `El campo ${constraint} no puede ser nulo`
          : undefined;
        break;
      }

      case 'P2014': {
        status = HttpStatus.BAD_REQUEST;
        const relation = this.getMetaValue<string>(
          exception.meta,
          'relation_name',
        );
        message = 'La operación viola una relación requerida';
        details = relation ? `Relación requerida: ${relation}` : undefined;
        break;
      }

      case 'P2015': {
        status = HttpStatus.NOT_FOUND;
        message = 'No se encontró el registro relacionado';
        details = this.getMetaValue<string>(exception.meta, 'cause');
        break;
      }

      case 'P2018': {
        status = HttpStatus.BAD_REQUEST;
        message = 'No se encontraron los registros conectados requeridos';
        details = this.getMetaValue<string>(exception.meta, 'cause');
        break;
      }

      case 'P2019': {
        status = HttpStatus.BAD_REQUEST;
        message = 'Error de entrada de datos';
        details = this.getMetaValue<string>(exception.meta, 'cause');
        break;
      }

      case 'P2025': {
        status = HttpStatus.NOT_FOUND;
        message = 'Registro no encontrado para actualizar o eliminar';
        details = this.getMetaValue<string>(exception.meta, 'cause');
        break;
      }

      default: {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Error inesperado en la base de datos';
        details = `Código de error: ${exception.code}`;
      }
    }

    // Construir respuesta
    const errorResponse: PrismaErrorResponse = {
      statusCode: status,
      message,
      error: this.getErrorName(status),
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      errorId, // ID único para rastreo
    };

    // Agregar detalles solo si existen
    if (details) {
      errorResponse.details = details;
    }

    // En desarrollo, agregar información adicional
    if (process.env.NODE_ENV !== 'production') {
      errorResponse.prismaCode = exception.code;
      errorResponse.prismaMessage = exception.message;
      if (exception.meta) {
        errorResponse.meta = this.normalizeMeta(exception.meta);
      }
    }

    response.status(status).json(errorResponse);
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
