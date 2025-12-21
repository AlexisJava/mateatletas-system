import { Module } from '@nestjs/common';
import { DatabaseModule } from '../core/database/database.module';
import { CatalogoModule } from '../catalogo/catalogo.module';
import { PagosController } from './presentation/controllers/pagos.controller';
import { PagosService } from './presentation/services/pagos.service';
import { VerificacionMorosidadService } from './services/verificacion-morosidad.service';

// CQRS Services (NEW)
import { PagosManagementFacadeService } from './services/pagos-management-facade.service';
import { PaymentQueryService } from './services/payment-query.service';
import { PaymentCommandService } from './services/payment-command.service';
import { PaymentWebhookService } from './services/payment-webhook.service';
import { PaymentStateMapperService } from './services/payment-state-mapper.service';
import { PaymentExpirationService } from './services/payment-expiration.service';
import { PaymentAlertService } from './services/payment-alert.service';

// Security Services (CRITICAL)
import { WebhookIdempotencyService } from './services/webhook-idempotency.service';
import { PaymentAmountValidatorService } from './services/payment-amount-validator.service';
import { MercadoPagoIpWhitelistService } from './services/mercadopago-ip-whitelist.service';
import { MercadoPagoWebhookGuard } from './guards/mercadopago-webhook.guard';

// Use Cases
import { CalcularPrecioUseCase } from './application/use-cases/calcular-precio.use-case';
import { ActualizarConfiguracionPreciosUseCase } from './application/use-cases/actualizar-configuracion-precios.use-case';
import { CrearInscripcionMensualUseCase } from './application/use-cases/crear-inscripcion-mensual.use-case';
import { ObtenerMetricasDashboardUseCase } from './application/use-cases/obtener-metricas-dashboard.use-case';

// Repositories
import { ConfiguracionPreciosRepository } from './infrastructure/repositories/configuracion-precios.repository';
import { InscripcionMensualRepository } from './infrastructure/repositories/inscripcion-mensual.repository';

// Adapters para repositorios externos
import { EstudianteRepositoryAdapter } from './infrastructure/adapters/estudiante-repository.adapter';
import { ProductoRepositoryAdapter } from './infrastructure/adapters/producto-repository.adapter';
import { MercadoPagoService } from './mercadopago.service';

/**
 * PagosModule - Módulo completo del sistema de pagos
 *
 * Clean Architecture con Inyección de Dependencias:
 *
 * Presentation Layer:
 *  - Controller: Define endpoints REST
 *  - Service: Adaptador entre HTTP y Application
 *
 * Application Layer:
 *  - Use Cases: Orquestación de lógica de negocio
 *
 * Infrastructure Layer:
 *  - Repositories: Implementan interfaces del Domain
 *  - Adapters: Conectan con repositorios de otros módulos
 *
 * Domain Layer:
 *  - Rules: Funciones puras de negocio (importadas directamente)
 *  - Types: Tipos compartidos
 *  - Interfaces: Contratos para repositorios
 */
@Module({
  imports: [DatabaseModule, CatalogoModule],
  controllers: [PagosController],
  providers: [
    // === SECURITY SERVICES (CRITICAL) ===
    // Protección contra webhooks duplicados (idempotencia)
    WebhookIdempotencyService,

    // Validación de montos de pagos (prevención de fraude)
    PaymentAmountValidatorService,

    // IP Whitelisting para webhooks de MercadoPago (solo IPs oficiales)
    MercadoPagoIpWhitelistService,

    // Guard de seguridad para validar firmas de webhooks
    MercadoPagoWebhookGuard,

    // === CQRS Services (NEW) ===
    // Facade - Punto de entrada único
    PagosManagementFacadeService,

    // Query Service - Solo lecturas
    PaymentQueryService,

    // Command Service - Solo escrituras
    PaymentCommandService,

    // Webhook Service - Procesamiento de webhooks
    PaymentWebhookService,

    // State Mapper - Mapeo de estados centralizado
    PaymentStateMapperService,

    // Expiration Service - Expirar inscripciones pendientes (cron job)
    PaymentExpirationService,

    // Alert Service - Alertas para eventos críticos (refunds, chargebacks, fraude)
    PaymentAlertService,

    // === Legacy Presentation Layer (mantener temporalmente) ===
    PagosService,
    MercadoPagoService,
    VerificacionMorosidadService,

    // === Infrastructure Layer - Repositories ===
    ConfiguracionPreciosRepository,
    InscripcionMensualRepository,

    // === Infrastructure Layer - Adapters ===
    EstudianteRepositoryAdapter,
    ProductoRepositoryAdapter,

    // === Application Layer - Use Cases ===
    {
      provide: CalcularPrecioUseCase,
      useFactory: (
        configuracionRepo: ConfiguracionPreciosRepository,
        estudianteAdapter: EstudianteRepositoryAdapter,
        productoAdapter: ProductoRepositoryAdapter,
      ) => {
        return new CalcularPrecioUseCase(
          configuracionRepo,
          estudianteAdapter,
          productoAdapter,
        );
      },
      inject: [
        ConfiguracionPreciosRepository,
        EstudianteRepositoryAdapter,
        ProductoRepositoryAdapter,
      ],
    },
    {
      provide: ActualizarConfiguracionPreciosUseCase,
      useFactory: (configuracionRepo: ConfiguracionPreciosRepository) => {
        return new ActualizarConfiguracionPreciosUseCase(configuracionRepo);
      },
      inject: [ConfiguracionPreciosRepository],
    },
    {
      provide: CrearInscripcionMensualUseCase,
      useFactory: (
        calcularPrecioUseCase: CalcularPrecioUseCase,
        inscripcionRepo: InscripcionMensualRepository,
      ) => {
        return new CrearInscripcionMensualUseCase(
          calcularPrecioUseCase,
          inscripcionRepo,
        );
      },
      inject: [CalcularPrecioUseCase, InscripcionMensualRepository],
    },
    {
      provide: ObtenerMetricasDashboardUseCase,
      useFactory: (inscripcionRepo: InscripcionMensualRepository) => {
        return new ObtenerMetricasDashboardUseCase(inscripcionRepo);
      },
      inject: [InscripcionMensualRepository],
    },
  ],
  exports: [
    // Export security services for external modules
    WebhookIdempotencyService,
    PaymentAmountValidatorService,
    MercadoPagoIpWhitelistService,
    MercadoPagoWebhookGuard,

    // Export new facade as main interface
    PagosManagementFacadeService,

    // Export legacy services for backwards compatibility
    PagosService,
    MercadoPagoService,
    ConfiguracionPreciosRepository,
    InscripcionMensualRepository,
    VerificacionMorosidadService,
  ],
})
export class PagosModule {}
