import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './core/config/config.module';
import { DatabaseModule } from './core/database/database.module';
import { AuthModule } from './auth/auth.module';
import { EstudiantesModule } from './estudiantes/estudiantes.module';
import { EquiposModule } from './equipos/equipos.module';
import { DocentesModule } from './docentes/docentes.module';
import { CatalogoModule } from './catalogo/catalogo.module';
import { PagosModule } from './pagos/pagos.module';
import { ClasesModule } from './clases/clases.module';
import { AsistenciaModule } from './asistencia/asistencia.module';
import { AdminModule } from './admin/admin.module';
import { GamificacionModule } from './gamificacion/gamificacion.module';
import { CursosModule } from './cursos/cursos.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { EventosModule } from './eventos/eventos.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // Rate Limiting: 100 requests por 1 minuto por IP
    // Protege contra brute force y DDoS
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 segundos
        limit: 100, // 100 requests
      },
    ]),
    AppConfigModule,
    DatabaseModule,
    AuthModule,
    EstudiantesModule,
    EquiposModule,
    DocentesModule,
    CatalogoModule,
    PagosModule,
    ClasesModule,
    AsistenciaModule,
    AdminModule,
    GamificacionModule,
    CursosModule, // SLICE #16: Estructura de cursos y lecciones
    NotificacionesModule, // Sistema de notificaciones para docentes
    EventosModule, // Sistema de calendario y eventos para docentes
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Aplicar rate limiting globalmente
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
