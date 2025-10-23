import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PagosController } from './presentation/controllers/pagos.controller';
import { PagosService } from './presentation/services/pagos.service';

// Use Cases
import { CalcularPrecioUseCase } from './application/use-cases/calcular-precio.use-case';
import { ActualizarConfiguracionPreciosUseCase } from './application/use-cases/actualizar-configuracion-precios.use-case';
import { CrearInscripcionMensualUseCase } from './application/use-cases/crear-inscripcion-mensual.use-case';

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
  imports: [PrismaModule],
  controllers: [PagosController],
  providers: [
    // Presentation Layer
    PagosService,

    // Application Layer - Use Cases
    CalcularPrecioUseCase,
    ActualizarConfiguracionPreciosUseCase,
    CrearInscripcionMensualUseCase,

    // Infrastructure Layer - Repositories propios del módulo
    ConfiguracionPreciosRepository,
    InscripcionMensualRepository,

    // Infrastructure Layer - Adapters para repositorios externos
    EstudianteRepositoryAdapter,
    ProductoRepositoryAdapter,
  ],
  exports: [
    PagosService,
    ConfiguracionPreciosRepository,
    InscripcionMensualRepository,
  ],
})
export class PagosModule {}
