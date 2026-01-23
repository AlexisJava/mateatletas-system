import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AulaVivaGateway } from './aula-viva.gateway';
import { AulaVivaController } from './aula-viva.controller';
import { PresenciaService } from './services/presencia.service';
import { ManosService } from './services/manos.service';
import { ModeracionService } from './services/moderacion.service';
import { ReaccionesService } from './services/reacciones.service';
import { PulsoService } from './services/pulso.service';
import { SelectorService } from './services/selector.service';
import { QuizService } from './services/quiz.service';
import { ContadorService } from './services/contador.service';
import { GamificacionRealtimeService } from './services/gamificacion-realtime.service';
import { GamificacionRealtimeListener } from './listeners/gamificacion-realtime.listener';
import { TeoriaSyncService } from './services/teoria-sync.service';
import { PracticaLiveService } from './services/practica-live.service';
import { NodoService } from '../contenidos/services/nodo.service';

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
 * - Notificaciones de gamificación en tiempo real (Sprint 3.3-3.5)
 * - Teoría sincronizada (Sprint 4.1)
 * - Práctica en vivo con dashboard (Sprint 4.2)
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
    SelectorService,
    QuizService,
    ContadorService,
    GamificacionRealtimeService,
    GamificacionRealtimeListener,
    TeoriaSyncService,
    PracticaLiveService,
    NodoService,
  ],
  exports: [
    PresenciaService,
    ManosService,
    ModeracionService,
    ReaccionesService,
    PulsoService,
    SelectorService,
    QuizService,
    ContadorService,
    GamificacionRealtimeService,
    TeoriaSyncService,
    PracticaLiveService,
  ],
})
export class AulaVivaModule {}
