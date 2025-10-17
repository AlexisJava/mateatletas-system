import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';

/**
 * Servicio de Ranking
 * Gestiona el sistema de ranking y leaderboards: global, por equipo, por estudiante
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
      include: { equipo: true },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Ranking del equipo (solo si tiene equipo)
    const rankingEquipo = estudiante.equipo_id
      ? await this.getEquipoRanking(estudiante.equipo_id)
      : [];

    // Ranking global
    const rankingGlobal = await this.getRankingGlobal();

    const posicionEquipo =
      rankingEquipo.findIndex((e) => e.id === estudianteId) + 1;
    const posicionGlobal =
      rankingGlobal.findIndex((e) => e.id === estudianteId) + 1;

    return {
      equipoActual: estudiante.equipo,
      posicionEquipo,
      posicionGlobal,
      rankingEquipo: rankingEquipo.slice(0, 10),
      rankingGlobal: rankingGlobal.slice(0, 20),
    };
  }

  /**
   * Obtener ranking del equipo
   * Retorna todos los estudiantes del equipo ordenados por puntos
   */
  async getEquipoRanking(equipoId: string) {
    const estudiantes = await this.prisma.estudiante.findMany({
      where: { equipo_id: equipoId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        foto_url: true,
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
      avatar: e.foto_url,
      puntos: e.puntos_totales,
    }));
  }

  /**
   * Obtener ranking global
   * Retorna todos los estudiantes ordenados por puntos
   */
  async getRankingGlobal() {
    const estudiantes = await this.prisma.estudiante.findMany({
      include: {
        equipo: true,
      },
      orderBy: {
        puntos_totales: 'desc',
      },
    });

    return estudiantes.map((e) => ({
      id: e.id,
      nombre: e.nombre,
      apellido: e.apellido,
      avatar: e.foto_url,
      equipo: e.equipo,
      puntos: e.puntos_totales,
    }));
  }
}
