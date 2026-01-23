import { Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

/**
 * Exception Filter para WebSocket que transforma BadRequestException en WsException
 *
 * Problema: ValidationPipe en WebSocket handlers lanza BadRequestException,
 * pero el exception handler de Socket.IO solo reconoce WsException.
 * Resultado: rechazo silencioso, el cliente nunca recibe callback.
 *
 * Solución: Este filter intercepta BadRequestException y lo transforma
 * en WsException para que el cliente reciba el error correctamente.
 *
 * Referencia: https://github.com/nestjs/nest/issues/5267
 */
@Catch(BadRequestException)
export class WsBadRequestExceptionFilter extends BaseWsExceptionFilter {
  override catch(exception: BadRequestException, host: ArgumentsHost): void {
    const response = exception.getResponse();

    // Extraer mensaje(s) de validación
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

    // Transformar a WsException para que Socket.IO lo maneje correctamente
    const wsException = new WsException({
      status: 'error',
      message,
      code: 'VALIDATION_ERROR',
    });

    // Delegar al handler base de WebSocket exceptions
    super.catch(wsException, host);
  }
}
