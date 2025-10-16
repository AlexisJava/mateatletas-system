import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './core/config/config.module';
import { DatabaseModule } from './core/database/database.module';
import { LoggerModule } from './common/logger/logger.module';
import { CacheConfigModule } from './common/cache/cache.module';
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
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { UserThrottlerGuard } from './common/guards';

@Module({
  imports: [
    // Rate Limiting: Protege contra brute force, DDoS y abuso de API
    // - 100 requests por minuto para usuarios autenticados (por user.id)
    // - 100 requests por minuto para usuarios anónimos (por IP)
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 segundos (1 minuto)
        limit: 100, // 100 requests máximo
      },
    ]),
    AppConfigModule,
    DatabaseModule,
    LoggerModule, // Logging estructurado global
    CacheConfigModule, // Cache global con Redis (fallback a memoria)
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
    // Aplicar rate limiting globalmente con UserThrottlerGuard
    // Limita por user.id (autenticados) o IP (anónimos)
    {
      provide: APP_GUARD,
      useClass: UserThrottlerGuard,
    },
    // Aplicar logging interceptor globalmente
    // Registra todas las peticiones HTTP con duración y metadata
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
