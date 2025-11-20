import { Module, Global } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { DatabaseModule } from '../core/database/database.module';

/**
 * Módulo Global de Audit Logs
 *
 * IMPORTANTE: Este módulo es @Global() para que AuditLogService esté
 * disponible en toda la aplicación sin necesidad de importar el módulo
 * en cada feature module.
 *
 * Permite loguear eventos de auditoría desde cualquier parte del código:
 * - AuthService: login, logout, cambios de password, MFA
 * - PaymentService: pagos creados, aprobados, rechazados
 * - AdminController: creación/modificación de usuarios
 * - WebhookGuard: validación de webhooks, detección de fraude
 * - ConfigService: cambios de configuración
 *
 * USO:
 * ```typescript
 * constructor(private readonly auditLog: AuditLogService) {}
 *
 * await this.auditLog.logLogin(userId, email, 'tutor', req.ip);
 * await this.auditLog.logPaymentApproved(paymentId, amount, 'membresia');
 * await this.auditLog.logFraudDetected('Monto incorrecto', EntityType.PAGO, paymentId);
 * ```
 *
 * @module AuditModule
 */
@Global() // ✅ Hace que el módulo esté disponible globalmente
@Module({
  imports: [DatabaseModule], // Para PrismaService
  providers: [AuditLogService],
  exports: [AuditLogService], // Exportar para uso en toda la app
})
export class AuditModule {}