import { Module } from '@nestjs/common';
import { CasasService } from './casas.service';
import { CasasController } from './casas.controller';

/**
 * Módulo de Casas - Sistema Mateatletas 2026
 *
 * Gestiona las 3 casas del sistema:
 * - QUANTUM (6-9 años)
 * - VERTEX (10-12 años)
 * - PULSAR (13-17 años)
 *
 * NOTA: PrismaService se inyecta desde DatabaseModule que es @Global()
 */
@Module({
  controllers: [CasasController],
  providers: [CasasService],
  exports: [CasasService],
})
export class CasasModule {}
