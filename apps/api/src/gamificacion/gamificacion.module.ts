import { Module } from '@nestjs/common';
import { GamificacionController } from './gamificacion.controller';
import { GamificacionService } from './gamificacion.service';
import { PrismaModule } from '../core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GamificacionController],
  providers: [GamificacionService],
  exports: [GamificacionService],
})
export class GamificacionModule {}
