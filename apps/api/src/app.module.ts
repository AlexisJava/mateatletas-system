import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';

// Core & Infrastructure Modules
import { CoreModule } from './core/core.module';
import { SecurityModule } from './security/security.module';
import { ObservabilityModule } from './observability/observability.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { PricingCalculatorModule } from './domain/services/pricing-calculator.module';
import { SharedModule } from './shared/shared.module';

// Feature Modules
import { AuthModule } from './auth/auth.module';
import { EstudiantesModule } from './estudiantes/estudiantes.module';
import { CasasModule } from './casas/casas.module';
import { MundosModule } from './mundos/mundos.module';
import { DocentesModule } from './docentes/docentes.module';
import { CatalogoModule } from './catalogo/catalogo.module';
import { PagosModule } from './pagos/pagos.module';
import { TutorModule } from './tutor/tutor.module';
import { ClasesModule } from './clases/clases.module';
import { AsistenciaModule } from './asistencia/asistencia.module';
import { AdminModule } from './admin/admin.module';
import { GamificacionModule } from './gamificacion/gamificacion.module';
import { EventosModule } from './eventos/eventos.module';
import { HealthModule } from './health/health.module';
import { ColoniaModule } from './colonia/colonia.module';
import { TiersModule } from './tiers/tiers.module';
import { AuditModule } from './audit/audit.module';
import { EmailModule } from './email/email.module';
// [ELIMINADO] CursosModule, StudioModule - sistema de contenido legacy
import { SuscripcionesModule } from './suscripciones/suscripciones.module';
import { ContenidosModule } from './contenidos/contenidos.module';
import { LivekitModule } from './livekit/livekit.module';

/**
 * AppModule
 *
 * Módulo raíz de la aplicación - Refactorizado para eliminar Big Ball of Mud.
 *
 * Arquitectura modular:
 * - CoreModule: Configuración base (Config, Database)
 * - SecurityModule: Seguridad global (Guards, Rate Limiting)
 * - ObservabilityModule: Logging e instrumentación
 * - InfrastructureModule: Servicios transversales (Cache, Events, Notifications)
 * - Feature Modules: Módulos de dominio
 *
 * Patrón: Modular Architecture
 * Beneficio: Separación de responsabilidades, bajo acoplamiento, alta cohesión
 *
 * Fixes: #2 de ANTI-PATTERNS-AUDIT.md (Big Ball of Mud)
 */
@Module({
  imports: [
    // ============================================================================
    // CORE & INFRASTRUCTURE
    // ============================================================================
    CoreModule, // Config + Database (Global)
    SecurityModule, // Guards + Rate Limiting
    ObservabilityModule, // Logging + Interceptors
    InfrastructureModule, // Cache + Events + Notifications (Global)
    PricingCalculatorModule, // Pricing & Discounts (Global)
    SharedModule, // Shared Services: PIN Generation, Tutor Creation (Global)
    AuditModule, // Audit Logs para seguridad y compliance (Global)
    EmailModule, // Email transaccional (Password Reset, Notificaciones)

    // ============================================================================
    // FEATURE MODULES
    // ============================================================================
    AuthModule,
    EstudiantesModule,
    CasasModule,
    MundosModule,
    DocentesModule,
    CatalogoModule,
    PagosModule,
    TutorModule,
    ClasesModule,
    AsistenciaModule,
    AdminModule,
    GamificacionModule,
    EventosModule,
    ColoniaModule,
    TiersModule,
    HealthModule,
    SuscripcionesModule, // Suscripciones MercadoPago PreApproval
    ContenidosModule, // Sistema de contenido educativo (Sandbox)
    LivekitModule, // Clases en vivo (video/audio)
    // [ELIMINADO] CursosModule, StudioModule - sistema legacy de contenido
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // APP_GUARD global: Todos los endpoints requieren JWT por defecto
    // Usar @Public() para marcar endpoints que no requieren autenticación
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Correlation ID middleware para trazabilidad de requests
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
