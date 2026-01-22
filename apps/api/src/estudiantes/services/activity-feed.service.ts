import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { TipoActividadFeed, Prisma } from '@prisma/client';

/** Límite de reacciones por día por estudiante */
const LIMITE_REACCIONES_DIARIAS = 5;

/** Emojis permitidos para reacciones */
const EMOJIS_PERMITIDOS = ['👏', '🔥', '💪', '🚀'];

/** Número máximo de reintentos para transacciones serializables */
const MAX_RETRIES = 3;

/** Delay base para backoff exponencial (ms) */
const BASE_RETRY_DELAY = 50;

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
        estudianteId: data.estudianteId,
        tipo: data.tipo,
        mensaje: data.mensaje,
        xpGanado: data.xpGanado ?? 0,
        metadata: data.metadata ?? {},
        casaId: data.casaId,
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
      where.casaId = query.casaId;
    }

    if (query.tipo) {
      where.tipo = query.tipo;
    }

    if (query.estudianteId) {
      where.estudianteId = query.estudianteId;
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
              estudianteId: true,
            },
          },
          _count: {
            select: {
              reacciones: true,
            },
          },
        },
        orderBy: {
          creadoEn: 'desc',
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
        xpGanado: item.xpGanado,
        metadata: item.metadata,
        creadoEn: item.creadoEn,
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
   * Valida:
   * - Emoji permitido
   * - Límite de 5 reacciones diarias por estudiante
   * - No puede reaccionar a sus propias actividades
   *
   * NOTA: Usa transacción serializable con retry para evitar race conditions
   * que permitirían exceder el límite diario bajo concurrencia
   */
  async addReaction(actividadId: string, estudianteId: string, emoji: string) {
    // Verificar que el emoji es válido (fuera de transacción, es validación estática)
    if (!EMOJIS_PERMITIDOS.includes(emoji)) {
      throw new BadRequestException(
        `Emoji no permitido: ${emoji}. Usa: ${EMOJIS_PERMITIDOS.join(', ')}`,
      );
    }

    // Verificar que no está reaccionando a su propia actividad (fuera de transacción)
    const actividad = await this.prisma.actividadFeed.findUnique({
      where: { id: actividadId },
      select: { estudianteId: true },
    });

    if (!actividad) {
      throw new BadRequestException('Actividad no encontrada');
    }

    if (actividad.estudianteId === estudianteId) {
      throw new BadRequestException(
        'No puedes reaccionar a tus propias actividades',
      );
    }

    // Retry loop para transacciones serializables (pueden fallar por conflictos)
    let lastError: Error = new Error('Max retries exceeded');
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await this.executeReactionTransaction(
          actividadId,
          estudianteId,
          emoji,
        );
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        // Solo reintentar errores de serialización/deadlock
        const isSerializationError =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          (error.code === 'P2034' || // Transaction conflict
            error.message.includes('deadlock') ||
            error.message.includes('write conflict'));

        if (!isSerializationError || attempt === MAX_RETRIES) {
          throw lastError;
        }

        // Backoff exponencial: 50ms, 100ms, 200ms...
        const delay = BASE_RETRY_DELAY * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw lastError;
  }

  /**
   * Ejecuta la transacción de reacción (separado para retry)
   */
  private async executeReactionTransaction(
    actividadId: string,
    estudianteId: string,
    emoji: string,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        // Verificar si ya existe esta reacción específica
        const existente = await tx.reaccionFeed.findUnique({
          where: {
            actividadId_estudianteId_emoji: {
              actividadId: actividadId,
              estudianteId: estudianteId,
              emoji,
            },
          },
        });

        // Si ya existe, retornarla (idempotente)
        if (existente) {
          return existente;
        }

        // Contar reacciones de hoy DENTRO de la transacción
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const reaccionesHoy = await tx.reaccionFeed.count({
          where: {
            estudianteId: estudianteId,
            creadoEn: { gte: hoy },
          },
        });

        if (reaccionesHoy >= LIMITE_REACCIONES_DIARIAS) {
          throw new HttpException(
            {
              message: 'Límite de felicitaciones diarias alcanzado',
              usadas: reaccionesHoy,
              limite: LIMITE_REACCIONES_DIARIAS,
            },
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }

        // Crear la reacción
        return tx.reaccionFeed.create({
          data: {
            actividadId: actividadId,
            estudianteId: estudianteId,
            emoji,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  /**
   * Cuenta cuántas reacciones ha dado el estudiante HOY
   * (desde las 00:00:00 del día actual)
   */
  private async contarReaccionesHoy(estudianteId: string): Promise<number> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return this.prisma.reaccionFeed.count({
      where: {
        estudianteId: estudianteId,
        creadoEn: {
          gte: hoy,
        },
      },
    });
  }

  /**
   * Obtiene información de reacciones del día del estudiante
   * @returns { usadas: number, limite: number, restantes: number }
   */
  async getReaccionesHoy(estudianteId: string) {
    const usadas = await this.contarReaccionesHoy(estudianteId);
    return {
      usadas,
      limite: LIMITE_REACCIONES_DIARIAS,
      restantes: Math.max(0, LIMITE_REACCIONES_DIARIAS - usadas),
    };
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
        actividadId: actividadId,
        estudianteId: estudianteId,
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
   * Obtiene el feed de múltiples estudiantes (para comisión/ClaseGrupo)
   * Filtra actividades donde estudianteId está en la lista
   * @param estudianteIds - Lista de IDs de estudiantes
   * @param limit - Cantidad máxima de items (default: 10, max: 50)
   * @param page - Página para paginación (default: 1)
   * @returns Feed con actividades de los estudiantes especificados
   */
  async getFeedByEstudiantes(estudianteIds: string[], limit = 10, page = 1) {
    if (estudianteIds.length === 0) {
      return {
        data: [],
        meta: { total: 0, page: 1, limit, totalPages: 0, hasMore: false },
      };
    }

    const safeLimit = Math.min(limit, 50);
    const skip = (page - 1) * safeLimit;

    const where = {
      estudianteId: { in: estudianteIds },
    };

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
              estudianteId: true,
            },
          },
          _count: {
            select: {
              reacciones: true,
            },
          },
        },
        orderBy: {
          creadoEn: 'desc',
        },
        skip,
        take: safeLimit,
      }),
      this.prisma.actividadFeed.count({ where }),
    ]);

    const itemsConReacciones = items.map((item) => {
      const reaccionesAgrupadas = this.agruparReacciones(item.reacciones);
      return {
        id: item.id,
        tipo: item.tipo,
        mensaje: item.mensaje,
        xpGanado: item.xpGanado,
        metadata: item.metadata,
        creadoEn: item.creadoEn,
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
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
        hasMore: page * safeLimit < total,
      },
    };
  }

  /**
   * Agrupa reacciones por emoji y cuenta cuántas hay de cada tipo
   */
  private agruparReacciones(
    reacciones: Array<{ emoji: string; estudianteId: string }>,
  ): Array<{ emoji: string; count: number; estudiantesIds: string[] }> {
    const grouped = new Map<
      string,
      { count: number; estudiantesIds: string[] }
    >();

    for (const r of reacciones) {
      const current = grouped.get(r.emoji) || { count: 0, estudiantesIds: [] };
      current.count++;
      current.estudiantesIds.push(r.estudianteId);
      grouped.set(r.emoji, current);
    }

    return Array.from(grouped.entries()).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      estudiantesIds: data.estudiantesIds,
    }));
  }
}
