import { Module } from '@nestjs/common';
import { TiersService } from './tiers.service';
import { TiersController } from './tiers.controller';

/**
 * Módulo de Tiers - Sistema Mateatletas 2026
 *
 * Gestiona los 3 tiers de suscripción STEAM:
 * - STEAM_LIBROS: $40k - Plataforma completa (todos los mundos)
 * - STEAM_ASINCRONICO: $65k - Incluye clases grabadas
 * - STEAM_SINCRONICO: $95k - Incluye clases en vivo con docente
 */
@Module({
  controllers: [TiersController],
  providers: [TiersService],
  exports: [TiersService],
})
export class TiersModule {}
