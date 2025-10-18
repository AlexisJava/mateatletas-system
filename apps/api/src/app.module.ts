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
import { HealthModule } from './health/health.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { UserThrottlerGuard, CsrfProtectionGuard } from './common/guards';

@Module({
  imports: [
    // Rate Limiting: Protege contra brute force, DDoS y abuso de API
    // - Desarrollo: 1000 requests por minuto (más permisivo)
    // - Producción: 100 requests por minuto
    // TODO: Usar variable de entorno para ajustar límites por entorno
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 segundos (1 minuto)
        limit: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 en dev, 100 en prod
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
    HealthModule, // Health checks para monitoreo del sistema
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Aplicar CSRF protection globalmente
    // Valida que requests POST/PUT/PATCH/DELETE vengan de origins permitidos
    // Previene ataques CSRF (Cross-Site Request Forgery)
    {
      provide: APP_GUARD,
      useClass: CsrfProtectionGuard,
    },
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
