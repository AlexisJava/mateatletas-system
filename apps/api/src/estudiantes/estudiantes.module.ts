import { Module } from '@nestjs/common';
import { EstudiantesFacadeService } from './estudiantes-facade.service';
import { EstudiantesController } from './estudiantes.controller';
import { AuthModule } from '../auth/auth.module';
import { EstudianteBusinessValidator } from './validators/estudiante-business.validator';
import { EstudianteQueryService } from './services/estudiante-query.service';
import { EstudianteCommandService } from './services/estudiante-command.service';
import { EstudianteCopyService } from './services/estudiante-copy.service';
import { EstudianteStatsService } from './services/estudiante-stats.service';
import { AccesoEstudianteService } from './services/acceso-estudiante.service';
import { EstudianteAulaService } from './services/estudiante-aula.service';
import { ActivityFeedService } from './services/activity-feed.service';
import { MiProgresoService } from './services/mi-progreso.service';
import { InscripcionesListener } from './listeners/inscripciones.listener';

/**
 * Módulo de Estudiantes - Refactorizado con CQRS + Facade Pattern
 * Gestiona la funcionalidad CRUD de estudiantes
 *
 * ARQUITECTURA:
 * - EstudiantesFacadeService: API pública (183 líneas)
 * - EstudianteQueryService: Operaciones de lectura (590 líneas)
 * - EstudianteCommandService: Operaciones de escritura (518 líneas)
 * - EstudianteCopyService: Operaciones de copia (148 líneas)
 * - EstudianteStatsService: Estadísticas (60 líneas)
 * - EstudianteBusinessValidator: Validaciones de negocio (130 líneas)
 *
 * NOTA: Se eliminó forwardRef(() => GamificacionModule)
 * Ahora se usa EventEmitter2 para evitar dependencia circular
 *
 * NOTA 2026: Equipos/Casas ahora se gestionan desde CasasModule
 */
@Module({
  imports: [AuthModule],
  controllers: [EstudiantesController],
  providers: [
    // Servicios especializados
    EstudianteBusinessValidator,
    EstudianteQueryService,
    EstudianteCommandService,
    EstudianteCopyService,
    EstudianteStatsService,
    AccesoEstudianteService,
    EstudianteAulaService,
    ActivityFeedService,
    MiProgresoService,
    // Event Listeners
    InscripcionesListener,
    // Facade (API pública) - Usado por EstudiantesController
    EstudiantesFacadeService,
  ],
  exports: [
    EstudiantesFacadeService, // API pública del módulo
  ],
})
export class EstudiantesModule {}
