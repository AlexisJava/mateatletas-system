import { Module } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';
import { ClaseProximaNotificationService } from './services/clase-proxima-notification.service';
import { SuscripcionNotificacionesListener } from './listeners/suscripcion-notificaciones.listener';
import { DatabaseModule } from '../core/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [NotificacionesController],
  providers: [
    NotificacionesService,
    ClaseProximaNotificationService,
    SuscripcionNotificacionesListener,
  ],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}
