import { Module } from '@nestjs/common';
import { DocentesController } from './docentes.controller';
import { DocentesPublicController } from './docentes-public.controller';
import { DocentesService } from './docentes.service';
import { PrismaService } from '../core/database/prisma.service';

@Module({
  controllers: [DocentesController, DocentesPublicController],
  providers: [DocentesService, PrismaService],
  exports: [DocentesService], // Exportar para uso en AuthService
})
export class DocentesModule {}
