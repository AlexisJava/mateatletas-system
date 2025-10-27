import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';

/**
 * Interceptor para logging automático de HTTP requests
 * Registra: método, URL, status code, duración, usuario
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<RequestWithUser>();
    const response = httpContext.getResponse<Response>();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const { statusCode } = response;
          const duration = Date.now() - startTime;

          this.logger.logHttp(method, url, statusCode, duration, {
            userId: request.user?.id,
            userRole: request.user?.role,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const errorDetails = this.extractErrorDetails(error);

          this.logger.logHttp(method, url, errorDetails.statusCode, duration, {
            userId: request.user?.id,
            userRole: request.user?.role,
            errorMessage: errorDetails.message,
          });
        },
      }),
    );
  }

  private extractErrorDetails(error: unknown): {
    statusCode: number;
    message?: string;
  } {
    if (error instanceof HttpException) {
      return {
        statusCode: error.getStatus(),
        message: error.message,
      };
    }

    if (typeof error === 'object' && error !== null) {
      const status = this.getErrorProperty<number>(error, 'status');
      const message = this.getErrorProperty<string>(error, 'message');
      return {
        statusCode: status ?? 500,
        message,
      };
    }

    return {
      statusCode: 500,
      message: typeof error === 'string' ? error : undefined,
    };
  }

  private getErrorProperty<T>(error: object, property: string): T | undefined {
    if (property in error) {
      const record = error as Record<string, unknown>;
      return record[property] as T;
    }
    return undefined;
  }
}

type RequestWithUser = Request & {
  user?: {
    id?: string;
    role?: string;
  };
};
