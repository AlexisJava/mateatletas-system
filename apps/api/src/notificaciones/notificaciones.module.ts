import { Module } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';
import { ClaseProximaNotificationService } from './services/clase-proxima-notification.service';
import { DatabaseModule } from '../core/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [NotificacionesController],
  providers: [NotificacionesService, ClaseProximaNotificationService],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}
