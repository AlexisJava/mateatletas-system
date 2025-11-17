import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Core & Infrastructure Modules
import { CoreModule } from './core/core.module';
import { SecurityModule } from './security/security.module';
import { ObservabilityModule } from './observability/observability.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

// Feature Modules
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
import { EventosModule } from './eventos/eventos.module';
import { HealthModule } from './health/health.module';
import { PlanificacionesSimplesModule } from './planificaciones-simples/planificaciones-simples.module';
import { TiendaModule } from './tienda/tienda.module';
import { ColoniaModule } from './colonia/colonia.module';
import { Inscripciones2026Module } from './inscripciones-2026/inscripciones-2026.module';

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
    CoreModule,           // Config + Database (Global)
    SecurityModule,       // Guards + Rate Limiting
    ObservabilityModule,  // Logging + Interceptors
    InfrastructureModule, // Cache + Events + Notifications (Global)

    // ============================================================================
    // FEATURE MODULES
    // ============================================================================
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
    CursosModule,
    EventosModule,
    PlanificacionesSimplesModule,
    TiendaModule,
    ColoniaModule,
    Inscripciones2026Module,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
