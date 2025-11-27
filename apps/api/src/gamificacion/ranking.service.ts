import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';

/**
 * Servicio de Ranking
 * Gestiona el sistema de ranking y leaderboards: global, por casa, por estudiante
 */
@Injectable()
export class RankingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtener ranking del estudiante
   */
  async getRankingEstudiante(estudianteId: string) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      include: { casa: true },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Ranking de la casa (solo si tiene casa)
    const rankingCasa = estudiante.casaId
      ? await this.getCasaRanking(estudiante.casaId)
      : [];

    // Ranking global (top 20)
    const rankingGlobal = await this.getRankingGlobal(1, 20);

    // Calcular posición global del estudiante
    const posicionGlobal =
      (await this.prisma.estudiante.count({
        where: {
          puntos_totales: {
            gt: estudiante.puntos_totales,
          },
        },
      })) + 1;

    const posicionCasa =
      rankingCasa.findIndex((e) => e.id === estudianteId) + 1;

    return {
      casaActual: estudiante.casa,
      posicionCasa,
      posicionGlobal,
      rankingCasa: rankingCasa.slice(0, 10),
      rankingGlobal: rankingGlobal.data, // Ya viene limitado a 20
    };
  }

  /**
   * Obtener ranking de la casa
   * Retorna todos los estudiantes de la casa ordenados por puntos
   */
  async getCasaRanking(casaId: string) {
    const estudiantes = await this.prisma.estudiante.findMany({
      where: { casaId: casaId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        fotoUrl: true,
        puntos_totales: true,
      },
      orderBy: {
        puntos_totales: 'desc',
      },
    });

    return estudiantes.map((e) => ({
      id: e.id,
      nombre: e.nombre,
      apellido: e.apellido,
      avatar: e.fotoUrl,
      puntos: e.puntos_totales,
    }));
  }

  /**
   * Obtener ranking global con paginación
   *
   * PAGINACIÓN:
   * - page: Número de página (default: 1)
   * - limit: Elementos por página (default: 20, max: 100)
   * - Retorna metadata con total, totalPages, currentPage
   *
   * PERFORMANCE:
   * - ANTES: Retornaba TODOS los estudiantes (potencialmente miles)
   * - AHORA: Retorna solo 20-100 estudiantes por request
   */
  async getRankingGlobal(page: number = 1, limit: number = 20) {
    // Validar y normalizar parámetros
    const normalizedPage = Math.max(1, page);
    const normalizedLimit = Math.min(Math.max(1, limit), 100); // Max 100 por página
    const skip = (normalizedPage - 1) * normalizedLimit;

    // Query con paginación
    const [estudiantes, total] = await Promise.all([
      this.prisma.estudiante.findMany({
        skip,
        take: normalizedLimit,
        include: {
          casa: true,
        },
        orderBy: {
          puntos_totales: 'desc',
        },
      }),
      this.prisma.estudiante.count(),
    ]);

    const mappedEstudiantes = estudiantes.map((e, index) => ({
      id: e.id,
      nombre: e.nombre,
      apellido: e.apellido,
      avatar: e.fotoUrl,
      casa: e.casa,
      puntos: e.puntos_totales,
      posicion: skip + index + 1, // Posición absoluta en el ranking
    }));

    return {
      data: mappedEstudiantes,
      metadata: {
        total,
        page: normalizedPage,
        limit: normalizedLimit,
        totalPages: Math.ceil(total / normalizedLimit),
        hasNextPage: normalizedPage < Math.ceil(total / normalizedLimit),
        hasPreviousPage: normalizedPage > 1,
      },
    };
  }
}
