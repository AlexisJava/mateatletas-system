import { Module, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';

/**
 * Módulo global de logging
 * Proporciona LoggerService en toda la aplicación sin necesidad de importar
 */
@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
