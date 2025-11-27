import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * Service para estadísticas y reportes de estudiantes
 * Responsabilidad: Agregaciones y análisis de datos
 */
@Injectable()
export class EstudianteStatsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene estadísticas agregadas de los estudiantes de un tutor
   * @param tutorId - ID del tutor
   * @returns Estadísticas con totales y distribuciones
   */
  async getEstadisticas(tutorId: string) {
    const estudiantes = await this.prisma.estudiante.findMany({
      where: { tutor_id: tutorId },
      include: {
        casa: true,
      },
    });

    // Distribución por nivel escolar
    const porNivel = estudiantes.reduce(
      (acc: Record<string, number>, est) => {
        acc[est.nivelEscolar] = (acc[est.nivelEscolar] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Distribución por casa
    const porCasa = estudiantes.reduce(
      (acc: Record<string, number>, est) => {
        if (est.casa) {
          acc[est.casa.nombre] = (acc[est.casa.nombre] || 0) + 1;
        } else {
          acc['Sin casa'] = (acc['Sin casa'] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    // Suma de puntos totales
    const puntosTotales = estudiantes.reduce(
      (sum: number, est) => sum + est.puntos_totales,
      0,
    );

    return {
      total: estudiantes.length,
      por_nivel: porNivel,
      por_casa: porCasa,
      puntos_totales: puntosTotales,
    };
  }
}
