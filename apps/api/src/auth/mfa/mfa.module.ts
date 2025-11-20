import { Module } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { MfaController } from './mfa.controller';
import { DatabaseModule } from '../../core/database/database.module';

/**
 * Módulo de Multi-Factor Authentication (MFA)
 *
 * Provee autenticación de dos factores usando TOTP (Time-based One-Time Password)
 * compatible con aplicaciones como Google Authenticator, Microsoft Authenticator, Authy.
 *
 * Características:
 * - TOTP con ventana de 30 segundos
 * - Códigos de backup de un solo uso
 * - Rate limiting en todos los endpoints
 * - Acceso restringido a rol ADMIN
 *
 * @module MfaModule
 */
@Module({
  imports: [DatabaseModule],
  controllers: [MfaController],
  providers: [MfaService],
  exports: [MfaService], // Exportar para usar en AuthService
})
export class MfaModule {}