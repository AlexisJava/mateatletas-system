/**
 * RequestContextMiddleware
 *
 * Middleware que establece el contexto de request usando AsyncLocalStorage.
 * Extrae o genera un request ID único para correlación de logs.
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { RequestContext } from './request-context';

const REQUEST_ID_HEADER = 'x-request-id';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  /**
   * Procesa cada request HTTP estableciendo el contexto
   * - Extrae x-request-id del header si existe, o genera uno nuevo
   * - Establece el header de respuesta x-request-id
   * - Ejecuta el resto del pipeline dentro del contexto
   */
  use(req: Request, res: Response, next: NextFunction): void {
    // Extraer request ID del header o generar uno nuevo
    const requestId = req.get(REQUEST_ID_HEADER) ?? randomUUID();

    // Establecer header de respuesta para trazabilidad
    res.setHeader(REQUEST_ID_HEADER, requestId);

    // Ejecutar el resto del pipeline dentro del contexto
    RequestContext.run(
      () => {
        next();
      },
      { requestId },
    ).catch((error) => {
      // Propagar errores al middleware de errores de NestJS
      next(error);
    });
  }
}
