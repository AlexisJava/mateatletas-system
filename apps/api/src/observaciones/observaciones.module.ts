import { Module } from '@nestjs/common';
import { ObservacionesController } from './observaciones.controller';
import { ObservacionesService } from './observaciones.service';
import { PrismaService } from '../core/database/prisma.service';

/**
 * Módulo de Observaciones Docente
 *
 * Provee funcionalidad para que docentes registren observaciones
 * sobre estudiantes con seguimiento y estados.
 *
 * Features:
 * - Observaciones individuales y grupales
 * - Clasificación por tipo y prioridad
 * - Sistema de seguimientos
 * - Ciclo de vida con estados
 * - Inmutable (no delete, no edit)
 */
@Module({
  controllers: [ObservacionesController],
  providers: [ObservacionesService, PrismaService],
  exports: [ObservacionesService],
})
export class ObservacionesModule {}
