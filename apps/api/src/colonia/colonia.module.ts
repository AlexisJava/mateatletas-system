import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ColoniaController } from './colonia.controller';
import { ColoniaService } from './colonia.service';
import { MercadoPagoService } from '../pagos/mercadopago.service';
import { ConfigService } from '@nestjs/config';
import { PagosModule } from '../pagos/pagos.module';

@Module({
  imports: [PagosModule], // Importar PagosModule para MercadoPagoIpWhitelistService
  controllers: [ColoniaController],
  providers: [ColoniaService, MercadoPagoService, PrismaClient, ConfigService],
  exports: [ColoniaService],
})
export class ColoniaModule {}
