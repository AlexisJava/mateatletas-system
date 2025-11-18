import { Module, Global } from '@nestjs/common';
import { PinGeneratorService } from './services/pin-generator.service';
import { TutorCreationService } from './services/tutor-creation.service';
import { PrismaService } from '../core/database/prisma.service';

/**
 * SharedModule - Módulo global con servicios reutilizables
 *
 * Este módulo proporciona servicios compartidos entre diferentes módulos
 * de la aplicación, eliminando duplicación de código y centralizando
 * funcionalidad común.
 *
 * Servicios incluidos:
 * - PinGeneratorService: Generación de PINs únicos de 4 dígitos
 * - TutorCreationService: Creación y gestión de tutores
 *
 * Al ser marcado como @Global(), este módulo está disponible en toda
 * la aplicación sin necesidad de importarlo explícitamente en cada módulo.
 *
 * @example
 * ```typescript
 * // En cualquier servicio de la aplicación
 * constructor(
 *   private readonly pinGenerator: PinGeneratorService,
 *   private readonly tutorCreation: TutorCreationService
 * ) {}
 * ```
 */
@Global()
@Module({
  providers: [
    PrismaService,
    PinGeneratorService,
    TutorCreationService,
  ],
  exports: [
    PinGeneratorService,
    TutorCreationService,
  ],
})
export class SharedModule {}
