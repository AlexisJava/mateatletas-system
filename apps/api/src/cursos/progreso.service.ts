import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { CompletarLeccionDto } from './dto/completar-leccion.dto';
import { ModulosService } from './modulos.service';

/**
 * Service for tracking student progress in courses
 *
 * Responsibilities:
 * - Track lesson progress
 * - Mark lessons as completed
 * - Calculate course completion percentage
 * - Get student progress reports
 * - Certificate eligibility checks
 * - Gamification integration (points and achievements)
 *
 * Implements Ed-Tech best practices:
 * - Progressive Disclosure (sequential unlocking)
 * - Learning Analytics (detailed tracking)
 * - Gamification (points and achievements)
 * - Immediate Feedback
 */
@Injectable()
export class ProgresoService {
  constructor(
    private prisma: PrismaService,
    private modulosService: ModulosService,
  ) {}

  // ============================================================================
  // PROGRESO DEL ESTUDIANTE
  // ============================================================================

  /**
   * Complete a lesson (student action)
   * Implements:
   * - Immediate Feedback
   * - Gamification (award points)
   * - Learning Analytics (save time, score)
   * - Unlock achievements
   */
  async completarLeccion(
    leccionId: string,
    estudianteId: string,
    completarDto: CompletarLeccionDto,
  ) {
    // Get the lesson
    const leccion = await this.modulosService.findOneLeccion(leccionId);

    // Verify that the student is enrolled in the course
    const inscripcion = await this.prisma.inscripcionCurso.findFirst({
      where: {
        estudiante_id: estudianteId,
        producto_id: leccion.modulo.producto_id,
        estado: 'Activo',
      },
    });

    if (!inscripcion) {
      throw new ForbiddenException('No estás inscrito en este curso');
    }

    // Verify prerequisite (Progressive Disclosure)
    if (leccion.leccion_prerequisito_id) {
      const prerequisitoCompletado =
        await this.prisma.progresoLeccion.findFirst({
          where: {
            estudiante_id: estudianteId,
            leccion_id: leccion.leccion_prerequisito_id,
            completada: true,
          },
        });

      if (!prerequisitoCompletado) {
        throw new BadRequestException(
          'Debes completar la lección prerequisito primero',
        );
      }
    }

    // Create or update progress
    const progreso = await this.prisma.progresoLeccion.upsert({
      where: {
        estudiante_id_leccion_id: {
          estudiante_id: estudianteId,
          leccion_id: leccionId,
        },
      },
      update: {
        completada: true,
        progreso: 100,
        fecha_completada: new Date(),
        calificacion: completarDto.calificacion,
        tiempo_invertido_minutos: completarDto.tiempo_invertido_minutos,
        notas_estudiante: completarDto.notas_estudiante,
        ultima_respuesta: completarDto.ultima_respuesta,
        intentos: {
          increment: 1,
        },
      },
      create: {
        estudiante_id: estudianteId,
        leccion_id: leccionId,
        completada: true,
        progreso: 100,
        fecha_completada: new Date(),
        calificacion: completarDto.calificacion,
        tiempo_invertido_minutos: completarDto.tiempo_invertido_minutos,
        notas_estudiante: completarDto.notas_estudiante,
        ultima_respuesta: completarDto.ultima_respuesta,
        intentos: 1,
      },
      include: {
        leccion: true,
      },
    });

    // Award points automatically (Gamification)
    const puntosGanados = leccion.puntos_por_completar;

    // Update student's total points
    // TODO: Integrate with GamificacionService to create PuntoObtenido records
    //       Once defined how to handle system points (without teacher)
    if (puntosGanados > 0) {
      await this.prisma.estudiante.update({
        where: { id: estudianteId },
        data: {
          puntos_totales: {
            increment: puntosGanados,
          },
        },
      });
    }

    // TODO: Achievement system will be implemented with new LogroEstudiante model
    // in FASE 2 of the 2026 refactor

    return {
      progreso,
      puntos_ganados: puntosGanados,
      mensaje: `¡Excelente! Ganaste ${puntosGanados} puntos`,
    };
  }

  /**
   * Get student progress in a complete course
   */
  async getProgresoCurso(productoId: string, estudianteId: string) {
    // Get all modules and lessons of the course
    const modulos = await this.modulosService.findModulosByProducto(productoId);

    // Get student progress
    const leccionIds = modulos.flatMap((m) => m.lecciones.map((l) => l.id));

    const progresos = await this.prisma.progresoLeccion.findMany({
      where: {
        estudiante_id: estudianteId,
        leccion_id: { in: leccionIds },
      },
    });

    // Calculate statistics
    const totalLecciones = leccionIds.length;
    const leccionesCompletadas = progresos.filter((p) => p.completada).length;
    const porcentajeCompletado = Math.round(
      (leccionesCompletadas / totalLecciones) * 100,
    );

    // Progress by module
    const progresoModulos = modulos.map((modulo) => {
      const leccionesModulo = modulo.lecciones.length;
      const completadasModulo = modulo.lecciones.filter((leccion) =>
        progresos.some((p) => p.leccion_id === leccion.id && p.completada),
      ).length;

      return {
        modulo_id: modulo.id,
        modulo_titulo: modulo.titulo,
        total_lecciones: leccionesModulo,
        lecciones_completadas: completadasModulo,
        porcentaje: Math.round((completadasModulo / leccionesModulo) * 100),
      };
    });

    return {
      producto_id: productoId,
      estudiante_id: estudianteId,
      total_modulos: modulos.length,
      total_lecciones: totalLecciones,
      lecciones_completadas: leccionesCompletadas,
      porcentaje_completado: porcentajeCompletado,
      progreso_modulos: progresoModulos,
    };
  }

  /**
   * Get the next available lesson for a student
   * Implements Progressive Disclosure (one lesson at a time)
   *
   * OPTIMIZED: Eliminates N+1 queries by loading all progress in a single query.
   * Before: N queries (one per lesson)
   * Now: 2 queries (modules + complete progress)
   */
  async getSiguienteLeccion(productoId: string, estudianteId: string) {
    // 1. Get modules with lessons from the product
    const modulos = await this.modulosService.findModulosByProducto(productoId);

    // 2. Extract all lesson IDs from the course
    const leccionIds = modulos.flatMap((modulo) =>
      modulo.lecciones.map((leccion) => leccion.id),
    );

    if (leccionIds.length === 0) {
      return null; // Course without lessons
    }

    // 3. OPTIMIZATION: Load ALL student progress in ONE SINGLE query
    const progresos = await this.prisma.progresoLeccion.findMany({
      where: {
        estudiante_id: estudianteId,
        leccion_id: { in: leccionIds },
      },
      select: {
        leccion_id: true,
        completada: true,
      },
    });

    // 4. Create a Map for O(1) access instead of repeated queries
    const progresoMap = new Map<string, boolean>();
    progresos.forEach((p) => {
      progresoMap.set(p.leccion_id, p.completada);
    });

    // 5. Iterate over modules and lessons with progress already loaded in memory
    for (const modulo of modulos) {
      for (const leccion of modulo.lecciones) {
        // Check if already completed (O(1) lookup)
        const completada = progresoMap.get(leccion.id) ?? false;
        if (completada) continue;

        // Check prerequisite (O(1) lookup if exists)
        if (leccion.leccion_prerequisito_id) {
          const prerequisitoCompletado =
            progresoMap.get(leccion.leccion_prerequisito_id) ?? false;
          if (!prerequisitoCompletado) continue;
        }

        // This is the next available lesson
        return {
          leccion_id: leccion.id,
          leccion,
          modulo: {
            id: modulo.id,
            titulo: modulo.titulo,
          },
        };
      }
    }

    return null; // Course completed
  }
}
