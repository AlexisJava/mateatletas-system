import { Module } from '@nestjs/common';
import { TiersService } from './tiers.service';
import { TiersController } from './tiers.controller';

/**
 * Módulo de Tiers - Sistema Mateatletas 2026
 *
 * Gestiona los 3 tiers de suscripción:
 * - ARCADE: $30k - 1 mundo async, sin docente
 * - ARCADE_PLUS: $60k - 3 mundos async, sin docente
 * - PRO: $75k - 1 mundo async + 1 mundo sync, con docente
 */
@Module({
  controllers: [TiersController],
  providers: [TiersService],
  exports: [TiersService],
})
export class TiersModule {}
