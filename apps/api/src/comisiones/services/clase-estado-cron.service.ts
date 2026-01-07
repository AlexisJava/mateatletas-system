import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * Servicio de cron para gestionar estados de clases automáticamente
 *
 * Responsabilidades:
 * - Reiniciar clases finalizadas después de 12 horas
 * - Limpiar estados obsoletos
 */
@Injectable()
export class ClaseEstadoCronService {
  private readonly logger = new Logger(ClaseEstadoCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cron job que se ejecuta cada hora
   * Reinicia a "Programada" las clases que finalizaron hace más de 12 horas
   */
  @Cron(CronExpression.EVERY_HOUR)
  async reiniciarClasesFinalizadas(): Promise<void> {
    const doceHorasAtras = new Date(Date.now() - 12 * 60 * 60 * 1000);

    this.logger.log(
      `Ejecutando cron de reinicio de clases (finalizadas antes de ${doceHorasAtras.toISOString()})`,
    );

    try {
      // Reiniciar comisiones finalizadas hace más de 12 horas
      const comisionesResult = await this.prisma.comision.updateMany({
        where: {
          estado_clase: 'Finalizada',
          finalizada_en: {
            lte: doceHorasAtras,
          },
        },
        data: {
          estado_clase: 'Programada',
          iniciada_en: null,
          finalizada_en: null,
        },
      });

      if (comisionesResult.count > 0) {
        this.logger.log(
          `Reiniciadas ${comisionesResult.count} comisiones a estado Programada`,
        );
      }

      // Reiniciar clases grupales finalizadas hace más de 12 horas
      const clasesGrupalesResult = await this.prisma.claseGrupo.updateMany({
        where: {
          estado_clase: 'Finalizada',
          finalizada_en: {
            lte: doceHorasAtras,
          },
        },
        data: {
          estado_clase: 'Programada',
          iniciada_en: null,
          finalizada_en: null,
        },
      });

      if (clasesGrupalesResult.count > 0) {
        this.logger.log(
          `Reiniciadas ${clasesGrupalesResult.count} clases grupales a estado Programada`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Error al reiniciar clases finalizadas:',
        error instanceof Error ? error.message : error,
      );
    }
  }
}
