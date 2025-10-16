import { Module } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { EventosController } from './eventos.controller';
import { DatabaseModule } from '../core/database/database.module';

/**
 * Módulo de Eventos
 *
 * Gestiona el sistema de calendario del docente
 *
 * Características:
 * - Crear, leer, actualizar y eliminar eventos
 * - Filtrado por fechas (día, semana, mes)
 * - Recordatorios configurables
 * - Tipos de eventos (Recordatorio, Reunión, Tarea, Cumpleaños, Otro)
 * - Colores personalizables
 * - Eventos de todo el día
 *
 * Integración:
 * - Frontend: react-big-calendar
 * - Notificaciones: EventosService se puede usar en NotificacionesService
 *   para enviar recordatorios automáticos
 */
@Module({
  imports: [DatabaseModule],
  controllers: [EventosController],
  providers: [EventosService],
  exports: [EventosService],
})
export class EventosModule {}
