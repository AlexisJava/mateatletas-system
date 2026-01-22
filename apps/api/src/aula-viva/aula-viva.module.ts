import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AulaVivaGateway } from './aula-viva.gateway';
import { AulaVivaController } from './aula-viva.controller';
import { PresenciaService } from './services/presencia.service';
import { ManosService } from './services/manos.service';
import { ModeracionService } from './services/moderacion.service';
import { ReaccionesService } from './services/reacciones.service';
import { PulsoService } from './services/pulso.service';

/**
 * Módulo de Aula Virtual en Vivo
 *
 * Proporciona funcionalidad WebSocket para:
 * - Clases en tiempo real
 * - Presencia de usuarios
 * - Comunicación docente-estudiantes
 * - Chat en tiempo real
 * - Sistema de levantar la mano
 * - Moderación (mutear/expulsar)
 *
 * Depende de AuthModule para validar tokens JWT en conexiones WebSocket
 */
@Module({
  imports: [AuthModule],
  controllers: [AulaVivaController],
  providers: [
    AulaVivaGateway,
    PresenciaService,
    ManosService,
    ModeracionService,
    ReaccionesService,
    PulsoService,
  ],
  exports: [
    PresenciaService,
    ManosService,
    ModeracionService,
    ReaccionesService,
    PulsoService,
  ],
})
export class AulaVivaModule {}
