import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';

/**
 * Servicio de Ranking
 * Gestiona el sistema de ranking y leaderboards: global, por casa, por estudiante
 *
 * Refactorizado para usar RecursosEstudiante.xp_total en lugar de Estudiante.puntos_totales
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
      include: {
        casa: true,
        recursos: true,
      },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const xpEstudiante = estudiante.recursos?.xp_total ?? 0;

    // Ranking de la casa (solo si tiene casa)
    const rankingCasa = estudiante.casaId
      ? await this.getCasaRanking(estudiante.casaId)
      : [];

    // Ranking global (top 20)
    const rankingGlobal = await this.getRankingGlobal(1, 20);

    // Calcular posición global del estudiante (cuántos tienen más XP)
    const posicionGlobal =
      (await this.prisma.recursosEstudiante.count({
        where: {
          xp_total: {
            gt: xpEstudiante,
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
      rankingGlobal: rankingGlobal.data,
    };
  }

  /**
   * Obtener ranking de la casa
   * Retorna todos los estudiantes de la casa ordenados por XP
   */
  async getCasaRanking(casaId: string) {
    const estudiantes = await this.prisma.estudiante.findMany({
      where: { casaId: casaId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        fotoUrl: true,
        recursos: {
          select: { xp_total: true },
        },
      },
    });

    // Ordenar por XP en memoria (Prisma no soporta orderBy en relación opcional)
    const sorted = estudiantes
      .map((e) => ({
        id: e.id,
        nombre: e.nombre,
        apellido: e.apellido,
        avatar: e.fotoUrl,
        puntos: e.recursos?.xp_total ?? 0,
      }))
      .sort((a, b) => b.puntos - a.puntos);

    return sorted;
  }

  /**
   * Obtener ranking global con paginación
   *
   * PAGINACIÓN:
   * - page: Número de página (default: 1)
   * - limit: Elementos por página (default: 20, max: 100)
   * - Retorna metadata con total, totalPages, currentPage
   *
   * ESTRATEGIA:
   * Query RecursosEstudiante ordenado por xp_total, luego join con Estudiante
   */
  async getRankingGlobal(page: number = 1, limit: number = 20) {
    const normalizedPage = Math.max(1, page);
    const normalizedLimit = Math.min(Math.max(1, limit), 100);
    const skip = (normalizedPage - 1) * normalizedLimit;

    // Query ordenado por xp_total desde RecursosEstudiante
    const [recursos, total] = await Promise.all([
      this.prisma.recursosEstudiante.findMany({
        skip,
        take: normalizedLimit,
        orderBy: { xp_total: 'desc' },
        include: {
          estudiante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              fotoUrl: true,
              casa: true,
            },
          },
        },
      }),
      this.prisma.recursosEstudiante.count(),
    ]);

    const mappedEstudiantes = recursos.map((r, index) => ({
      id: r.estudiante.id,
      nombre: r.estudiante.nombre,
      apellido: r.estudiante.apellido,
      avatar: r.estudiante.fotoUrl,
      casa: r.estudiante.casa,
      puntos: r.xp_total,
      posicion: skip + index + 1,
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
