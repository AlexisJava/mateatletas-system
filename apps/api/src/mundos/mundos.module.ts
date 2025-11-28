import { Module } from '@nestjs/common';
import { MundosService } from './mundos.service';
import { MundosController } from './mundos.controller';

/**
 * Modulo de Mundos STEAM - Sistema Mateatletas 2026
 *
 * Gestiona los 3 mundos del sistema:
 * - MATEMATICA (numeros, algebra, geometria)
 * - PROGRAMACION (codigo, algoritmos, logica)
 * - CIENCIAS (fisica, quimica, biologia)
 *
 * NOTA: PrismaService se inyecta desde DatabaseModule que es @Global()
 */
@Module({
  controllers: [MundosController],
  providers: [MundosService],
  exports: [MundosService],
})
export class MundosModule {}
