import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AulaVivaGateway } from './aula-viva.gateway';
import { AulaVivaController } from './aula-viva.controller';
import { PresenciaService } from './services/presencia.service';

/**
 * Módulo de Aula Virtual en Vivo
 *
 * Proporciona funcionalidad WebSocket para:
 * - Clases en tiempo real
 * - Presencia de usuarios
 * - Comunicación docente-estudiantes
 * - Chat en tiempo real
 *
 * Depende de AuthModule para validar tokens JWT en conexiones WebSocket
 */
@Module({
  imports: [AuthModule],
  controllers: [AulaVivaController],
  providers: [AulaVivaGateway, PresenciaService],
  exports: [PresenciaService],
})
export class AulaVivaModule {}
