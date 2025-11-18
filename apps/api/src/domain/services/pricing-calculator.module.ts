import { Module, Global } from '@nestjs/common';
import { PricingCalculatorService } from './pricing-calculator.service';

/**
 * Módulo global para el servicio de cálculo de precios
 *
 * Este módulo es @Global() para que PricingCalculatorService esté disponible
 * en toda la aplicación sin necesidad de importar el módulo en cada lugar.
 *
 * @module domain/services/pricing-calculator
 */
@Global()
@Module({
  providers: [PricingCalculatorService],
  exports: [PricingCalculatorService],
})
export class PricingCalculatorModule {}
