import { Module } from '@nestjs/common';
import { TutorController } from './tutor.controller';
import { TutorService } from './tutor.service';
import { PagosModule } from '../pagos/pagos.module';
import { PrismaService } from '../core/database/prisma.service';

/**
 * TutorModule
 *
 * Módulo dedicado para funcionalidad de tutores
 * - Dashboard de tutores
 * - Gestión de inscripciones
 * - Perfil de tutor
 *
 * Imports:
 * - PagosModule: Para acceder a InscripcionMensualRepository
 */
@Module({
  imports: [PagosModule],
  controllers: [TutorController],
  providers: [TutorService, PrismaService],
  exports: [TutorService],
})
export class TutorModule {}
