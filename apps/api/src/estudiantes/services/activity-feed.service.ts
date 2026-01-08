import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { TipoActividadFeed, Prisma } from '@prisma/client';

/**
 * DTO para crear actividad en el feed
 */
export interface CreateActividadFeedDto {
  estudianteId: string;
  tipo: TipoActividadFeed;
  mensaje: string;
  xpGanado?: number;
  metadata?: Prisma.InputJsonValue;
  casaId?: string;
}

/**
 * DTO para query del feed
 */
export interface QueryFeedDto {
  page?: number;
  limit?: number;
  casaId?: string;
  tipo?: TipoActividadFeed;
  estudianteId?: string;
}

/**
 * Service para el Activity Feed de estudiantes
 * Muestra logros, completados y actividades para motivación social
 */
@Injectable()
export class ActivityFeedService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea una nueva entrada en el feed
   */
  async create(data: CreateActividadFeedDto) {
    return this.prisma.actividadFeed.create({
      data: {
        estudiante_id: data.estudianteId,
        tipo: data.tipo,
        mensaje: data.mensaje,
        xp_ganado: data.xpGanado ?? 0,
        metadata: data.metadata ?? {},
        casa_id: data.casaId,
      },
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  /**
   * Obtiene el feed con filtros y paginación
   * Por defecto muestra los últimos 20 items
   */
  async getFeed(query: QueryFeedDto = {}) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 50); // Max 50 items
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.casaId) {
      where.casa_id = query.casaId;
    }

    if (query.tipo) {
      where.tipo = query.tipo;
    }

    if (query.estudianteId) {
      where.estudiante_id = query.estudianteId;
    }

    const [items, total] = await Promise.all([
      this.prisma.actividadFeed.findMany({
        where,
        include: {
          estudiante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              avatarUrl: true,
            },
          },
          reacciones: {
            select: {
              emoji: true,
              estudiante_id: true,
            },
          },
          _count: {
            select: {
              reacciones: true,
            },
          },
        },
        orderBy: {
          creado_en: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.actividadFeed.count({ where }),
    ]);

    // Agrupar reacciones por emoji para cada item
    const itemsConReacciones = items.map((item) => {
      const reaccionesAgrupadas = this.agruparReacciones(item.reacciones);
      return {
        id: item.id,
        tipo: item.tipo,
        mensaje: item.mensaje,
        xpGanado: item.xp_ganado,
        metadata: item.metadata,
        creadoEn: item.creado_en,
        estudiante: item.estudiante,
        reacciones: reaccionesAgrupadas,
        totalReacciones: item._count.reacciones,
      };
    });

    return {
      data: itemsConReacciones,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  /**
   * Agrega una reacción a un item del feed
   */
  async addReaction(actividadId: string, estudianteId: string, emoji: string) {
    // Verificar que el emoji es válido
    const emojisPermitidos = ['👏', '🎉', '🔥', '💪', '❤️', '⭐'];
    if (!emojisPermitidos.includes(emoji)) {
      throw new Error(`Emoji no permitido: ${emoji}`);
    }

    return this.prisma.reaccionFeed.upsert({
      where: {
        actividad_id_estudiante_id_emoji: {
          actividad_id: actividadId,
          estudiante_id: estudianteId,
          emoji,
        },
      },
      create: {
        actividad_id: actividadId,
        estudiante_id: estudianteId,
        emoji,
      },
      update: {}, // No hacer nada si ya existe
    });
  }

  /**
   * Elimina una reacción de un item del feed
   */
  async removeReaction(
    actividadId: string,
    estudianteId: string,
    emoji: string,
  ) {
    return this.prisma.reaccionFeed.deleteMany({
      where: {
        actividad_id: actividadId,
        estudiante_id: estudianteId,
        emoji,
      },
    });
  }

  /**
   * Obtiene el feed de una casa específica
   * Útil para mostrar actividad de compañeros de casa
   */
  async getFeedByCasa(casaId: string, limit = 10) {
    return this.getFeed({ casaId, limit });
  }

  /**
   * Obtiene las actividades de un estudiante específico
   */
  async getFeedByEstudiante(estudianteId: string, limit = 10) {
    return this.getFeed({ estudianteId, limit });
  }

  /**
   * Agrupa reacciones por emoji y cuenta cuántas hay de cada tipo
   */
  private agruparReacciones(
    reacciones: Array<{ emoji: string; estudiante_id: string }>,
  ): Array<{ emoji: string; count: number; estudiantesIds: string[] }> {
    const grouped = new Map<
      string,
      { count: number; estudiantesIds: string[] }
    >();

    for (const r of reacciones) {
      const current = grouped.get(r.emoji) || { count: 0, estudiantesIds: [] };
      current.count++;
      current.estudiantesIds.push(r.estudiante_id);
      grouped.set(r.emoji, current);
    }

    return Array.from(grouped.entries()).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      estudiantesIds: data.estudiantesIds,
    }));
  }
}
