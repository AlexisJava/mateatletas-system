import { Module } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { TiersModule } from '../tiers/tiers.module';
import { CasasModule } from '../casas/casas.module';
import { OnboardingOwnershipGuard } from './guards/onboarding-ownership.guard';

/**
 * Módulo de Onboarding - Sistema Mateatletas 2026
 *
 * Gestiona el flujo de primera vez del estudiante:
 * 1. Selección de mundos (según tier)
 * 2. Test de ubicación (determina nivel por mundo)
 * 3. Confirmación de casa (puede bajar si puntaje muy bajo)
 * 4. Creación de avatar 2D
 *
 * SEGURIDAD:
 * - OnboardingOwnershipGuard previene acceso IDOR
 * - Solo tutor, estudiante propio, o admin/docente pueden acceder
 */
@Module({
  imports: [TiersModule, CasasModule],
  controllers: [OnboardingController],
  providers: [OnboardingService, OnboardingOwnershipGuard],
  exports: [OnboardingService],
})
export class OnboardingModule {}
