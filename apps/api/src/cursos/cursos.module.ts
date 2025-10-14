import { Module } from '@nestjs/common';
import { CursosService } from './cursos.service';
import { CursosController } from './cursos.controller';
import { DatabaseModule } from '../core/database/database.module';

/**
 * Módulo de Cursos - SLICE #16
 * Gestión de contenido educativo asincrónico (E-Learning)
 *
 * Funcionalidades:
 * - CRUD de módulos y lecciones
 * - Tracking de progreso del estudiante
 * - Gamificación integrada (puntos y logros)
 * - Progressive Disclosure (desbloqueo secuencial)
 * - Learning Analytics
 *
 * Mejores prácticas implementadas:
 * - Chunking (módulos → lecciones)
 * - Microlearning (lecciones 5-15 min)
 * - Multi-modal (video, texto, quiz, tarea)
 * - Immediate Feedback
 */
@Module({
  imports: [DatabaseModule],
  controllers: [CursosController],
  providers: [CursosService],
  exports: [CursosService], // Para usar en otros módulos
})
export class CursosModule {}
