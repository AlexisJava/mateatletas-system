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
      case 'P2000':
        status = HttpStatus.BAD_REQUEST;
        message = 'El valor proporcionado es demasiado largo para el campo';
        details = exception.meta?.column_name as string;
        break;

      case 'P2001':
        status = HttpStatus.NOT_FOUND;
        message = 'Registro no encontrado';
        details = exception.meta?.cause as string;
        break;

      case 'P2002':
        status = HttpStatus.CONFLICT;
        const target = exception.meta?.target as string[];
        const field = target?.[0] || 'campo';
        message = `Ya existe un registro con ese ${field}`;
        details = `Violación de restricción única en: ${target?.join(', ')}`;
        break;

      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        const fieldName = exception.meta?.field_name as string;
        message = 'Referencia inválida - el registro relacionado no existe';
        details = fieldName
          ? `El campo ${fieldName} hace referencia a un registro que no existe`
          : 'Error de clave foránea';
        break;

      case 'P2004':
        status = HttpStatus.BAD_REQUEST;
        message = 'Fallo en restricción de la base de datos';
        details = exception.meta?.database_error as string;
        break;

      case 'P2011':
        status = HttpStatus.BAD_REQUEST;
        const constraint = exception.meta?.constraint as string;
        message = 'Violación de restricción de nulabilidad';
        details = `El campo ${constraint} no puede ser nulo`;
        break;

      case 'P2014':
        status = HttpStatus.BAD_REQUEST;
        const relation = exception.meta?.relation_name as string;
        message = 'La operación viola una relación requerida';
        details = `Relación requerida: ${relation}`;
        break;

      case 'P2015':
        status = HttpStatus.NOT_FOUND;
        message = 'No se encontró el registro relacionado';
        details = exception.meta?.cause as string;
        break;

      case 'P2018':
        status = HttpStatus.BAD_REQUEST;
        message = 'No se encontraron los registros conectados requeridos';
        details = exception.meta?.cause as string;
        break;

      case 'P2019':
        status = HttpStatus.BAD_REQUEST;
        message = 'Error de entrada de datos';
        details = exception.meta?.cause as string;
        break;

      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Registro no encontrado para actualizar o eliminar';
        details = exception.meta?.cause as string;
        break;

      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Error inesperado en la base de datos';
        details = `Código de error: ${exception.code}`;
    }

    // Construir respuesta
    const errorResponse: any = {
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
        errorResponse.meta = exception.meta;
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
}
