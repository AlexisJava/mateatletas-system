import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { DLQStatus, Prisma } from '@prisma/client';
import { MercadoPagoWebhookDto } from '../dto/mercadopago-webhook.dto';

/**
 * Datos para agregar un webhook a la DLQ
 */
export interface AddToDLQData {
  paymentId: string;
  webhookType: string;
  payload: MercadoPagoWebhookDto;
  errorMessage: string;
  errorStack?: string;
  retries: number;
}

/**
 * Filtros para listar webhooks en DLQ
 */
export interface DLQFilters {
  status?: DLQStatus;
  paymentId?: string;
  webhookType?: string;
  fromDate?: Date;
  toDate?: Date;
}

/**
 * Datos para resolver un webhook de DLQ
 */
export interface ResolveDLQData {
  resolvedBy: string;
  resolutionNotes?: string;
}

/**
 * Servicio de Dead Letter Queue para webhooks de pago
 *
 * Responsabilidades:
 * - Guardar webhooks que fallaron después de todos los reintentos
 * - Listar webhooks pendientes para admin dashboard
 * - Permitir reprocesamiento manual desde admin
 * - Marcar como resuelto o abandonado
 *
 * @injectable
 */
@Injectable()
export class WebhookDLQService {
  private readonly logger = new Logger(WebhookDLQService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Agrega un webhook fallido a la Dead Letter Queue
   *
   * @param data - Datos del webhook y error
   * @returns Registro creado en DLQ
   */
  async addToDLQ(data: AddToDLQData): Promise<{ id: string }> {
    this.logger.warn(
      `🚨 Webhook agregado a DLQ: payment_id=${data.paymentId}, ` +
        `type=${data.webhookType}, retries=${data.retries}, ` +
        `error=${data.errorMessage}`,
    );

    const record = await this.prisma.webhookFailed.create({
      data: {
        payment_id: data.paymentId,
        webhook_type: data.webhookType,
        payload: data.payload as unknown as Prisma.InputJsonValue,
        error_message: data.errorMessage,
        error_stack: data.errorStack,
        retries: data.retries,
        status: DLQStatus.PENDING,
        last_retry_at: new Date(),
      },
    });

    return { id: record.id };
  }

  /**
   * Lista webhooks en DLQ con filtros opcionales
   *
   * @param filters - Filtros opcionales
   * @param limit - Cantidad máxima de resultados (default 50)
   * @param offset - Offset para paginación (default 0)
   * @returns Lista de webhooks en DLQ
   */
  async listDLQ(
    filters: DLQFilters = {},
    limit: number = 50,
    offset: number = 0,
  ) {
    const where: Prisma.WebhookFailedWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.paymentId) {
      where.payment_id = filters.paymentId;
    }

    if (filters.webhookType) {
      where.webhook_type = filters.webhookType;
    }

    if (filters.fromDate || filters.toDate) {
      where.created_at = {};
      if (filters.fromDate) {
        where.created_at.gte = filters.fromDate;
      }
      if (filters.toDate) {
        where.created_at.lte = filters.toDate;
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.webhookFailed.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.webhookFailed.count({ where }),
    ]);

    return {
      items,
      total,
      limit,
      offset,
      hasMore: offset + items.length < total,
    };
  }

  /**
   * Obtiene un webhook de DLQ por ID
   *
   * @param id - ID del registro en DLQ
   * @returns Webhook o null si no existe
   */
  async getById(id: string) {
    return this.prisma.webhookFailed.findUnique({
      where: { id },
    });
  }

  /**
   * Marca un webhook como "en proceso de reprocesamiento"
   *
   * @param id - ID del registro en DLQ
   * @returns Registro actualizado
   * @throws NotFoundException si no existe
   */
  async markAsProcessing(id: string) {
    const existing = await this.prisma.webhookFailed.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Webhook DLQ ${id} no encontrado`);
    }

    if (existing.status !== DLQStatus.PENDING) {
      this.logger.warn(
        `Intentando procesar webhook DLQ ${id} con status ${existing.status}`,
      );
    }

    return this.prisma.webhookFailed.update({
      where: { id },
      data: {
        status: DLQStatus.PROCESSING,
        last_retry_at: new Date(),
      },
    });
  }

  /**
   * Marca un webhook como resuelto exitosamente
   *
   * @param id - ID del registro en DLQ
   * @param data - Datos de resolución (quién y notas)
   * @returns Registro actualizado
   * @throws NotFoundException si no existe
   */
  async markAsResolved(id: string, data: ResolveDLQData) {
    const existing = await this.prisma.webhookFailed.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Webhook DLQ ${id} no encontrado`);
    }

    this.logger.log(
      `✅ Webhook DLQ ${id} resuelto por ${data.resolvedBy}: ${data.resolutionNotes || 'Sin notas'}`,
    );

    return this.prisma.webhookFailed.update({
      where: { id },
      data: {
        status: DLQStatus.RESOLVED,
        resolved_at: new Date(),
        resolved_by: data.resolvedBy,
        resolution_notes: data.resolutionNotes,
      },
    });
  }

  /**
   * Marca un webhook como abandonado (no se puede procesar)
   *
   * @param id - ID del registro en DLQ
   * @param data - Datos de resolución (quién y motivo)
   * @returns Registro actualizado
   * @throws NotFoundException si no existe
   */
  async markAsAbandoned(id: string, data: ResolveDLQData) {
    const existing = await this.prisma.webhookFailed.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Webhook DLQ ${id} no encontrado`);
    }

    this.logger.warn(
      `⚠️ Webhook DLQ ${id} abandonado por ${data.resolvedBy}: ${data.resolutionNotes || 'Sin motivo'}`,
    );

    return this.prisma.webhookFailed.update({
      where: { id },
      data: {
        status: DLQStatus.ABANDONED,
        resolved_at: new Date(),
        resolved_by: data.resolvedBy,
        resolution_notes: data.resolutionNotes,
      },
    });
  }

  /**
   * Vuelve un webhook a estado PENDING (si estaba PROCESSING y falló)
   *
   * @param id - ID del registro en DLQ
   * @param errorMessage - Nuevo mensaje de error
   * @returns Registro actualizado
   */
  async revertToPending(id: string, errorMessage: string) {
    return this.prisma.webhookFailed.update({
      where: { id },
      data: {
        status: DLQStatus.PENDING,
        error_message: errorMessage,
        last_retry_at: new Date(),
        retries: { increment: 1 },
      },
    });
  }

  /**
   * Obtiene estadísticas de la DLQ
   *
   * @returns Conteo por estado y webhooks recientes
   */
  async getStats() {
    const [byStatus, totalPending, oldestPending] = await Promise.all([
      // Conteo por estado
      this.prisma.webhookFailed.groupBy({
        by: ['status'],
        _count: true,
      }),

      // Total pendientes
      this.prisma.webhookFailed.count({
        where: { status: DLQStatus.PENDING },
      }),

      // Webhook pendiente más antiguo
      this.prisma.webhookFailed.findFirst({
        where: { status: DLQStatus.PENDING },
        orderBy: { created_at: 'asc' },
        select: { id: true, created_at: true, payment_id: true },
      }),
    ]);

    return {
      byStatus: byStatus.reduce(
        (acc, item) => {
          acc[item.status] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      totalPending,
      oldestPending,
    };
  }

  /**
   * Limpia webhooks resueltos/abandonados antiguos (> 30 días)
   *
   * @returns Cantidad de registros eliminados
   */
  async cleanOldRecords(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.prisma.webhookFailed.deleteMany({
      where: {
        status: {
          in: [DLQStatus.RESOLVED, DLQStatus.ABANDONED],
        },
        resolved_at: {
          lt: thirtyDaysAgo,
        },
      },
    });

    this.logger.log(
      `🗑️ Limpiados ${result.count} registros de DLQ antiguos (> 30 días)`,
    );

    return result.count;
  }
}
