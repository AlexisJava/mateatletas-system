import { Module } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { MercadoPagoService } from './mercadopago.service';
import { MockPagosService } from './mock-pagos.service';
import { PagosController } from './pagos.controller';
import { PrismaService } from '../core/database/prisma.service';
import { CatalogoModule } from '../catalogo/catalogo.module';

/**
 * Módulo de Pagos y Membresías
 * Gestiona la integración con MercadoPago y el estado de suscripciones
 */
@Module({
  imports: [CatalogoModule], // Importar para usar ProductosService
  controllers: [PagosController],
  providers: [
    PagosService,
    MercadoPagoService,
    MockPagosService,
    PrismaService,
  ],
  exports: [PagosService], // Exportar para uso en otros módulos
})
export class PagosModule {}
