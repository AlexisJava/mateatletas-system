import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../core/database/prisma.service';
import { EstadoPago } from '@prisma/client';
import {
  FECHA_VENCIMIENTO_CON_RECARGO,
  calcularEstadoPago,
} from './helpers/calcular-fecha-vencimiento.helper';

/**
 * Servicio de Anulación Automática de Pagos
 *
 * REGLA DE NEGOCIO (Club):
 * - Día 1-9: Pago normal
 * - Día 10-12: Pago con 15% de recargo
 * - Día 13+: Se ANULA la inscripción (sin acceso)
 *
 * EJECUCIÓN:
 * - Cron job diario a las 00:05 del día 13 de cada mes
 * - También se ejecuta diariamente para capturar periodos atrasados
 */
@Injectable()
export class PaymentExpirationService {
  private readonly logger = new Logger(PaymentExpirationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cron job que se ejecuta diariamente a las 00:05
   * Busca inscripciones pendientes que pasaron el día 12 y las anula
   */
  @Cron('5 0 * * *') // Todos los días a las 00:05
  async anularInscripcionesVencidas(): Promise<void> {
    this.logger.log(
      '🕐 Iniciando proceso de anulación de inscripciones vencidas...',
    );

    const startTime = Date.now();

    try {
      const resultado = await this.procesarAnulaciones();

      const duration = Date.now() - startTime;

      this.logger.log(
        `✅ Proceso completado en ${duration}ms. Anuladas: ${resultado.anuladas}`,
      );

      if (resultado.anuladas > 0) {
        this.logger.warn(
          `⚠️ Se anularon ${resultado.anuladas} inscripciones por falta de pago`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Error en proceso de anulación: ${message}`);
      throw error;
    }
  }

  /**
   * Procesa las anulaciones de inscripciones que pasaron el día 12
   */
  private async procesarAnulaciones(): Promise<{ anuladas: number }> {
    const hoy = new Date();
    const diaActual = hoy.getDate();

    // Solo procesar si estamos después del día 12
    if (diaActual <= FECHA_VENCIMIENTO_CON_RECARGO) {
      this.logger.log(
        `📅 Día ${diaActual}: aún no es fecha de anulación (día 13+)`,
      );
      return { anuladas: 0 };
    }

    // Buscar inscripciones pendientes del periodo actual y anteriores
    const periodoActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;

    const inscripcionesPendientes =
      await this.prisma.inscripcionMensual.findMany({
        where: {
          estadoPago: {
            in: [EstadoPago.Pendiente, EstadoPago.Parcial],
          },
          periodo: {
            lte: periodoActual,
          },
        },
        select: {
          id: true,
          periodo: true,
          precioFinal: true,
        },
      });

    // Filtrar las que ya pasaron el día 12
    const inscripcionesAAnular = inscripcionesPendientes.filter(
      (inscripcion) => {
        const estadoPago = calcularEstadoPago(
          inscripcion.periodo,
          Number(inscripcion.precioFinal),
          hoy,
        );
        return estadoPago.estado === 'ANULABLE';
      },
    );

    if (inscripcionesAAnular.length === 0) {
      return { anuladas: 0 };
    }

    // Anular las inscripciones
    const idsAAnular = inscripcionesAAnular.map((i) => i.id);

    const result = await this.prisma.inscripcionMensual.updateMany({
      where: {
        id: { in: idsAAnular },
      },
      data: {
        estadoPago: EstadoPago.Anulado,
      },
    });

    this.logger.log(
      `📋 Inscripciones anuladas: ${result.count} (periodos: ${inscripcionesAAnular.map((i) => i.periodo).join(', ')})`,
    );

    return { anuladas: result.count };
  }

  /**
   * Método para ejecución manual (útil para testing y admin)
   * Procesa TODOS los periodos (actual y anteriores) que tengan vencimientos
   */
  async runManually(): Promise<{
    anuladas: number;
    conRecargo: number;
    vigentes: number;
  }> {
    this.logger.log('🔧 Ejecutando anulación manual...');

    const hoy = new Date();
    const periodoActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;

    // Obtener TODAS las pendientes del periodo actual Y anteriores
    const inscripcionesPendientes =
      await this.prisma.inscripcionMensual.findMany({
        where: {
          estadoPago: {
            in: [EstadoPago.Pendiente, EstadoPago.Parcial],
          },
          periodo: {
            lte: periodoActual, // Incluye periodos anteriores
          },
        },
        select: {
          id: true,
          periodo: true,
          precioFinal: true,
        },
      });

    let vigentes = 0;
    let conRecargo = 0;
    const idsAAnular: string[] = [];

    for (const inscripcion of inscripcionesPendientes) {
      const estadoPago = calcularEstadoPago(
        inscripcion.periodo,
        Number(inscripcion.precioFinal),
        hoy,
      );

      switch (estadoPago.estado) {
        case 'VIGENTE':
          vigentes++;
          break;
        case 'CON_RECARGO':
          conRecargo++;
          break;
        case 'ANULABLE':
          idsAAnular.push(inscripcion.id);
          break;
      }
    }

    // Anular las que correspondan
    if (idsAAnular.length > 0) {
      await this.prisma.inscripcionMensual.updateMany({
        where: { id: { in: idsAAnular } },
        data: { estadoPago: EstadoPago.Anulado },
      });
    }

    return {
      anuladas: idsAAnular.length,
      conRecargo,
      vigentes,
    };
  }

  /**
   * Obtiene estadísticas de inscripciones pendientes del periodo actual
   */
  async getPendingStats(): Promise<{
    vigentes: number;
    conRecargo: number;
    anulables: number;
    total: number;
  }> {
    const hoy = new Date();
    const periodoActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;

    const inscripcionesPendientes =
      await this.prisma.inscripcionMensual.findMany({
        where: {
          estadoPago: {
            in: [EstadoPago.Pendiente, EstadoPago.Parcial],
          },
          periodo: periodoActual,
        },
        select: {
          id: true,
          periodo: true,
          precioFinal: true,
        },
      });

    let vigentes = 0;
    let conRecargo = 0;
    let anulables = 0;

    for (const inscripcion of inscripcionesPendientes) {
      const estadoPago = calcularEstadoPago(
        inscripcion.periodo,
        Number(inscripcion.precioFinal),
        hoy,
      );

      switch (estadoPago.estado) {
        case 'VIGENTE':
          vigentes++;
          break;
        case 'CON_RECARGO':
          conRecargo++;
          break;
        case 'ANULABLE':
          anulables++;
          break;
      }
    }

    return {
      vigentes,
      conRecargo,
      anulables,
      total: inscripcionesPendientes.length,
    };
  }
}
