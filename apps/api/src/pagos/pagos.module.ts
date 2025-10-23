import { Module } from '@nestjs/common';
import { DatabaseModule } from '../core/database/database.module';
import { PagosController } from './presentation/controllers/pagos.controller';
import { PagosService } from './presentation/services/pagos.service';

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
  imports: [DatabaseModule],
  controllers: [PagosController],
  providers: [
    // Presentation Layer
    PagosService,

    // Infrastructure Layer - Repositories propios del módulo
    ConfiguracionPreciosRepository,
    InscripcionMensualRepository,

    // Infrastructure Layer - Adapters para repositorios externos
    EstudianteRepositoryAdapter,
    ProductoRepositoryAdapter,

    // Application Layer - Use Cases con inyección de implementaciones concretas
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
      inject: [ConfiguracionPreciosRepository, EstudianteRepositoryAdapter, ProductoRepositoryAdapter],
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
        return new CrearInscripcionMensualUseCase(calcularPrecioUseCase, inscripcionRepo);
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
    PagosService,
    ConfiguracionPreciosRepository,
    InscripcionMensualRepository,
  ],
})
export class PagosModule {}
