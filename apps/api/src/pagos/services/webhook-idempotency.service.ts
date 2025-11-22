import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { RedisService } from '../../core/redis/redis.service';

/**
 * Datos de un webhook procesado
 */
export interface WebhookProcessedRecord {
  paymentId: string;
  webhookType: string;
  status: string;
  externalReference: string;
}

/**
 * Servicio de Idempotencia de Webhooks de MercadoPago
 *
 * PROBLEMA QUE RESUELVE:
 * MercadoPago puede enviar el mismo webhook múltiples veces por:
 * - Reintentos automáticos si no respondemos 200 OK rápido
 * - Timeouts de red
 * - Problemas en su infraestructura
 *
 * Sin idempotencia, un mismo pago puede procesarse 2+ veces causando:
 * - Doble cobro a clientes
 * - Múltiples eventos emitidos
 * - Corrupción de datos
 *
 * SOLUCIÓN:
 * - Guardar cada payment_id que procesamos en la tabla webhooks_processed
 * - Antes de procesar, verificar si ya existe
 * - Si existe, retornar 200 OK sin hacer nada
 *
 * GARANTÍA:
 * - UNIQUE constraint en payment_id previene doble procesamiento incluso en race conditions
 *
 * @injectable
 */
@Injectable()
export class WebhookIdempotencyService {
  private readonly logger = new Logger(WebhookIdempotencyService.name);
  private readonly CACHE_TTL = 300; // 5 minutos
  private readonly CACHE_PREFIX = 'webhook:processed:';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Verifica si un webhook ya fue procesado (con Redis caching - PASO 3.1.B)
   *
   * OPTIMIZACIÓN:
   * - Cache hit: <5ms (vs 50-100ms DB)
   * - Cache miss: consulta DB + guarda en cache
   * - TTL: 300s (5 minutos)
   *
   * @param paymentId - ID del pago de MercadoPago
   * @returns true si ya fue procesado, false si es nuevo
   */
  async wasProcessed(paymentId: string): Promise<boolean> {
    const cacheKey = `${this.CACHE_PREFIX}${paymentId}`;

    try {
      // 1. Verificar cache primero (rápido: <5ms)
      const cached = await this.redis.get(cacheKey);

      if (cached !== null) {
        // Cache hit
        this.logger.debug(`✅ Cache HIT: ${cacheKey}`);
        return cached === 'true';
      }

      // 2. Cache miss → consultar DB
      this.logger.debug(`❌ Cache MISS: ${cacheKey} - consultando DB`);
    } catch (error) {
      // Fallback silencioso si Redis falla
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn(`⚠️ Redis error en wasProcessed: ${errorMessage} - fallback a DB`);
    }

    // 3. Consultar DB
    const existing = await this.prisma.webhookProcessed.findUnique({
      where: { payment_id: paymentId },
    });

    // 4. Guardar resultado en cache
    try {
      await this.redis.set(
        cacheKey,
        existing ? 'true' : 'false',
        this.CACHE_TTL,
      );
      this.logger.debug(`💾 Guardado en cache: ${cacheKey} = ${existing ? 'true' : 'false'}`);
    } catch (error) {
      // Fallback silencioso
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn(`⚠️ Error guardando en cache: ${errorMessage}`);
    }

    // 5. Retornar resultado
    if (existing) {
      this.logger.warn(
        `⏭️ Webhook duplicado detectado: payment_id=${paymentId}, procesado originalmente en ${existing.processed_at}`,
      );
      return true;
    }

    return false;
  }

  /**
   * Marca un webhook como procesado (con invalidación de cache - PASO 3.1.B)
   *
   * Maneja race conditions: Si otro proceso ya guardó el registro (unique constraint violation),
   * simplemente loguea el warning sin lanzar error.
   *
   * OPTIMIZACIÓN:
   * - Actualiza cache a 'true' después de crear registro
   * - Evita cache stale (cache='false' pero DB='true')
   *
   * @param data - Datos del webhook procesado
   * @throws - Solo lanza error si falla por razones distintas a unique constraint
   */
  async markAsProcessed(data: WebhookProcessedRecord): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${data.paymentId}`;

    try {
      await this.prisma.webhookProcessed.create({
        data: {
          payment_id: data.paymentId,
          webhook_type: data.webhookType,
          status: data.status,
          external_reference: data.externalReference,
        },
      });

      this.logger.log(
        `✅ Webhook marcado como procesado: payment_id=${data.paymentId}, type=${data.webhookType}, status=${data.status}`,
      );

      // Actualizar cache a 'true' (evitar cache stale)
      try {
        await this.redis.set(cacheKey, 'true', this.CACHE_TTL);
        this.logger.debug(`💾 Cache actualizado: ${cacheKey} = true`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.warn(`⚠️ Error actualizando cache: ${errorMessage}`);
      }
    } catch (error: unknown) {
      // Si falla por unique constraint, significa que otro proceso ya lo guardó (race condition)
      // Esto es OK, simplemente logueamos
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        this.logger.warn(
          `⚠️ Race condition detectada al marcar webhook: payment_id=${data.paymentId}. Otro proceso ya lo procesó.`,
        );

        // Aún así, actualizar cache a 'true' porque sabemos que existe
        try {
          await this.redis.set(cacheKey, 'true', this.CACHE_TTL);
        } catch (cacheError) {
          // Ignorar errores de cache silenciosamente
        }
      } else {
        // Otros errores sí son problemáticos
        const message = error instanceof Error ? error.message : 'Unknown error';
        const stack = error instanceof Error ? error.stack : undefined;
        this.logger.error(
          `❌ Error al marcar webhook como procesado: ${message}`,
          stack,
        );
        throw error;
      }
    }
  }

  /**
   * Limpia webhooks procesados antiguos (mayor a 30 días)
   *
   * Útil para mantener la tabla con tamaño manejable.
   * Se debe ejecutar como cron job mensual.
   *
   * @returns Número de registros eliminados
   */
  async cleanOldRecords(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.prisma.webhookProcessed.deleteMany({
      where: {
        processed_at: {
          lt: thirtyDaysAgo,
        },
      },
    });

    this.logger.log(
      `🗑️ Limpiados ${result.count} registros de webhooks antiguos (> 30 días)`,
    );

    return result.count;
  }

  /**
   * Obtiene información de un webhook procesado (para debugging)
   *
   * @param paymentId - ID del pago de MercadoPago
   * @returns Información del webhook o null si no existe
   */
  async getProcessedInfo(paymentId: string) {
    return this.prisma.webhookProcessed.findUnique({
      where: { payment_id: paymentId },
    });
  }

  /**
   * Obtiene estadísticas de webhooks procesados
   *
   * Útil para monitoring y dashboards
   *
   * @returns Estadísticas agrupadas por tipo y estado
   */
  async getStats() {
    const [total, byType, byStatus, last24h] = await Promise.all([
      // Total de webhooks procesados
      this.prisma.webhookProcessed.count(),

      // Agrupados por tipo
      this.prisma.webhookProcessed.groupBy({
        by: ['webhook_type'],
        _count: true,
      }),

      // Agrupados por estado
      this.prisma.webhookProcessed.groupBy({
        by: ['status'],
        _count: true,
      }),

      // Procesados en las últimas 24 horas
      this.prisma.webhookProcessed.count({
        where: {
          processed_at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      total,
      byType,
      byStatus,
      last24h,
    };
  }
}
