import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CatalogoModule } from './catalogo/catalogo.module';

// Controllers
import { CursosController } from './controllers/cursos.controller';
import { SemanasController } from './controllers/semanas.controller';
import { RecursosController } from './controllers/recursos.controller';

// Services - Cursos
import { CrearCursoService } from './services/cursos/crear-curso.service';
import { ObtenerCursoService } from './services/cursos/obtener-curso.service';
import { ListarCursosService } from './services/cursos/listar-cursos.service';
import { ActualizarCursoService } from './services/cursos/actualizar-curso.service';
import { EliminarCursoService } from './services/cursos/eliminar-curso.service';

// Services - Semanas
import { ObtenerSemanaService } from './services/semanas/obtener-semana.service';
import { GuardarSemanaService } from './services/semanas/guardar-semana.service';
import { ValidarSemanaService } from './services/semanas/validar-semana.service';

// Services - Recursos
import { SubirRecursoService } from './services/recursos/subir-recurso.service';
import { EliminarRecursoService } from './services/recursos/eliminar-recurso.service';

/**
 * Módulo Studio - Planificador de Cursos
 *
 * Gestiona la creación, edición y publicación de cursos en Mateatletas.
 *
 * ARQUITECTURA:
 * - Un servicio por operación (Single Responsibility)
 * - Controllers delgados, lógica en servicios
 * - Validación en DTOs con class-validator
 * - Validación de negocio en ValidarSemanaService
 *
 * SERVICIOS:
 * - Cursos: CRUD de cursos (plantilla madre)
 * - Semanas: Gestión de contenido de semanas
 * - Recursos: Upload y eliminación de multimedia
 *
 * DOCUMENTACIÓN:
 * - docs/MATEATLETAS_STUDIO.md - Especificación completa
 * - docs/PLAN_CONSTRUCCION_STUDIO.md - Plan de implementación
 */
@Module({
  imports: [AuthModule, CatalogoModule],
  controllers: [CursosController, SemanasController, RecursosController],
  providers: [
    // Cursos
    CrearCursoService,
    ObtenerCursoService,
    ListarCursosService,
    ActualizarCursoService,
    EliminarCursoService,

    // Semanas
    ObtenerSemanaService,
    GuardarSemanaService,
    ValidarSemanaService,

    // Recursos
    SubirRecursoService,
    EliminarRecursoService,
  ],
  exports: [
    // Exportar servicios que puedan ser usados por otros módulos
    ObtenerCursoService,
    ValidarSemanaService,
  ],
})
export class StudioModule {}
