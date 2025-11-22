import { Module, forwardRef } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { TokenBlacklistGuard } from '../auth/guards/token-blacklist.guard';
import { UserThrottlerGuard } from '../common/guards/user-throttler.guard';
import { SecretRotationService } from './services/secret-rotation.service';
import { FraudDetectionService } from './fraud-detection.service';
import { DatabaseModule } from '../core/database/database.module';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

/**
 * SecurityModule
 *
 * Módulo especializado en seguridad global de la aplicación.
 *
 * Responsabilidades:
 * - Rate Limiting (protección contra brute force, DDoS)
 * - Token Blacklist (validación de tokens invalidados)
 * - User Throttler (límites por usuario/IP)
 *
 * Patrón: Security Module
 * Beneficio: Centraliza toda la configuración de seguridad
 */
@Module({
  imports: [
    DatabaseModule, // Para PrismaService en SecretRotationService
    AuditModule, // Para AuditLogService en FraudDetectionService
    forwardRef(() => AuthModule), // Para TokenBlacklistService
    ScheduleModule.forRoot(), // Para cronjobs de SecretRotationService
    // Rate Limiting: Protege contra brute force, DDoS y abuso de API
    // - Configurable via variables de entorno RATE_LIMIT_TTL y RATE_LIMIT_MAX
    // - Default: 100 req/min en producción, 1000 req/min en desarrollo
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL || '60000', 10), // Default: 60 segundos
        limit: parseInt(
          process.env.RATE_LIMIT_MAX ||
            (process.env.NODE_ENV === 'production' ? '100' : '1000'),
          10,
        ),
      },
    ]),
  ],
  providers: [
    // Servicio de rotación automática de secrets críticos
    // Monitorea JWT_SECRET y WEBHOOK_SECRET cada 90 días
    SecretRotationService,
    // Servicio de detección de fraude (PASO 2.3)
    // Detecta patrones sospechosos en pagos e inscripciones
    FraudDetectionService,
    // ✅ SECURITY FIX: CSRF removido de guards globales
    // CSRF es ahora opt-in con @RequireCsrf() decorator
    // Esto permite webhooks, API calls, y Postman sin bloqueos
    // Ver: docs/CSRF-PROTECTION-STRATEGY.md

    // Aplicar Token Blacklist guard globalmente
    // Verifica que tokens no estén invalidados (logout, cambio contraseña, etc.)
    // Fix #6: Token Blacklist (P3 - Security Improvement)
    {
      provide: APP_GUARD,
      useClass: TokenBlacklistGuard,
    },
    // Aplicar rate limiting globalmente con UserThrottlerGuard
    // Limita por user.id (autenticados) o IP (anónimos)
    {
      provide: APP_GUARD,
      useClass: UserThrottlerGuard,
    },
  ],
  exports: [FraudDetectionService], // Exportar para uso en otros módulos (ej: Inscripciones2026Module)
})
export class SecurityModule {}
