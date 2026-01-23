import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Interceptor para WebSocket que convierte excepciones en responses de error.
 *
 * Problema: ValidationPipe en WebSocket lanza BadRequestException, pero
 * el cliente espera un callback con response. Sin este interceptor:
 * - El callback NUNCA se ejecuta
 * - El cliente hace timeout esperando respuesta
 *
 * Solución: Este interceptor captura BadRequestException y retorna
 * un objeto de error que SE PASA AL CALLBACK del cliente.
 *
 * Referencia: https://github.com/nestjs/nest/issues/5267
 *
 * Diferencia con Exception Filter:
 * - Filter emite evento 'exception' (callback no se ejecuta)
 * - Interceptor retorna response (callback SÍ se ejecuta)
 */
@Injectable()
export class WsErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error: unknown) => {
        // Capturar BadRequestException (de ValidationPipe)
        if (error instanceof BadRequestException) {
          const response = error.getResponse();
          let message: string;

          if (typeof response === 'object' && response !== null) {
            const responseObj = response as Record<string, unknown>;
            if (Array.isArray(responseObj.message)) {
              message = responseObj.message.join(', ');
            } else if (typeof responseObj.message === 'string') {
              message = responseObj.message;
            } else {
              message = 'Error de validación';
            }
          } else {
            message = String(response);
          }

          // Retornar objeto de error (esto SÍ ejecuta el callback)
          return of({
            exito: false,
            error: message,
          });
        }

        // Capturar otros errores genéricos
        if (error instanceof Error) {
          return of({
            exito: false,
            error: error.message,
          });
        }

        // Error desconocido
        return of({
          exito: false,
          error: 'Error interno del servidor',
        });
      }),
    );
  }
}
