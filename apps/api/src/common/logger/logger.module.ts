import { Module, Global, Scope } from '@nestjs/common';
import { LoggerService } from './logger.service';

/**
 * Módulo global de logging
 * Proporciona LoggerService en toda la aplicación sin necesidad de importar
 * Usa factory para crear instancia con contexto por defecto
 */
@Global()
@Module({
  providers: [
    {
      provide: LoggerService,
      useFactory: () => new LoggerService('App'),
      scope: Scope.DEFAULT,
    },
  ],
  exports: [LoggerService],
})
export class LoggerModule {}
