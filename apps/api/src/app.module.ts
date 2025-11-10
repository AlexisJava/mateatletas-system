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
import { TutorModule } from './tutor/tutor.module';
import { ClasesModule } from './clases/clases.module';
import { AsistenciaModule } from './asistencia/asistencia.module';
import { AdminModule } from './admin/admin.module';
import { GamificacionModule } from './gamificacion/gamificacion.module';
import { CursosModule } from './cursos/cursos.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { EventosModule } from './eventos/eventos.module';
import { HealthModule } from './health/health.module';
import { PlanificacionesSimplesModule } from './planificaciones-simples/planificaciones-simples.module';
import { TiendaModule } from './tienda/tienda.module';
import { ColoniaModule } from './colonia/colonia.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { UserThrottlerGuard, CsrfProtectionGuard } from './common/guards';
import { TokenBlacklistGuard } from './auth/guards/token-blacklist.guard';

@Module({
  imports: [
    // Rate Limiting: Protege contra brute force, DDoS y abuso de API
    // - Configurable via variables de entorno RATE_LIMIT_TTL y RATE_LIMIT_MAX
    // - Default: 100 req/min en producción, 1000 req/min en desarrollo
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL || '60000', 10), // Default: 60 segundos
        limit: parseInt(
          process.env.RATE_LIMIT_MAX ||
            (process.env.NODE_ENV === 'production' ? '100' : '1000'),
          10,
        ),
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
    TutorModule,
    ClasesModule,
    AsistenciaModule,
    AdminModule,
    GamificacionModule,
    CursosModule, // SLICE #16: Estructura de cursos y lecciones
    NotificacionesModule, // Sistema de notificaciones para docentes
    EventosModule, // Sistema de calendario y eventos para docentes
    PlanificacionesSimplesModule, // Sistema de planificaciones auto-detectable (Convention over Configuration)
    TiendaModule, // Sistema de tienda, recursos (XP, monedas, gemas), inventario y compras
    ColoniaModule, // Sistema de inscripciones para Colonia de Verano 2026
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
    // Aplicar Token Blacklist guard globalmente
    // Verifica que tokens no estén invalidados (logout, cambio contraseña, etc.)
    // Fix #6: Token Blacklist (P3 - Security Improvement)
    {
      provide: APP_GUARD,
      useClass: TokenBlacklistGuard,
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
