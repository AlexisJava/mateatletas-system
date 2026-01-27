/**
 * GracePeriodExpiredCronService - FASE 8.2
 *
 * Procesa suscripciones cuyo período de gracia ha expirado:
 * - Transiciona de PAUSED → PENDIENTE_CANCELACION
 * - Envía email informando inicio de ventana de arrepentimiento (24hs)
 * - Crea notificación in-app
 *
 * Corre diariamente a las 00:05 AR.
 *
 * El flujo de 24hs de arrepentimiento es manejado por CancelacionPendienteCronService (FASE 8.1)
 */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import {
  EstadoSuscripcionFamiliar,
  TipoNotificacion,
  PrioridadNotificacion,
} from '@prisma/client';

import { PrismaService } from '../../core/database/prisma.service';
import { EmailService } from '../../email/email.service';
import { NotificacionesService } from '../../notificaciones/notificaciones.service';

@Injectable()
export class GracePeriodExpiredCronService {
  private readonly logger = new Logger(GracePeriodExpiredCronService.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly notificacionesService: NotificacionesService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
  }

  /**
   * Cron: Procesar grace periods expirados
   * Corre todos los días a las 00:05 (hora Argentina, UTC-3)
   *
   * Cron: '5 0 * * *' = 00:05 todos los días
   * Para producción en UTC: '5 3 * * *' (03:05 UTC = 00:05 AR)
   */
  @Cron('5 3 * * *', { name: 'grace-period-expired' })
  async handleGracePeriodExpired(): Promise<void> {
    this.logger.log('⏰ Procesando grace periods expirados...');

    try {
      // Buscar suscripciones cuyo grace period expiró
      const expiradas = await this.findSuscripcionesExpiradas();

      if (expiradas.length === 0) {
        this.logger.log('No hay grace periods expirados.');
        return;
      }

      this.logger.log(
        `Procesando ${expiradas.length} suscripciones con grace period expirado`,
      );

      let procesadas = 0;

      for (const suscripcion of expiradas) {
        const ok = await this.procesarExpiracion(suscripcion);
        if (ok) procesadas++;
      }

      this.logger.log(
        `✅ Grace periods expirados procesados: ${procesadas}/${expiradas.length}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error procesando grace periods expirados: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Busca suscripciones en PAUSED cuya fechaGracia ya pasó.
   * Solo incluye tutores con email (requerido para enviar notificaciones).
   */
  private async findSuscripcionesExpiradas() {
    const ahora = new Date();

    const results = await this.prisma.suscripcionFamiliar.findMany({
      where: {
        estado: EstadoSuscripcionFamiliar.PAUSED,
        fechaGracia: {
          not: null,
          lt: ahora, // fechaGracia < ahora = expiró
        },
        // Solo procesar si el tutor tiene email configurado
        tutor: { email: { not: null } },
      },
      include: {
        tutor: {
          select: {
            id: true,
            email: true,
            nombre: true,
            apellido: true,
            estudiantes: {
              select: { nombre: true },
            },
          },
        },
      },
    });

    // Cast seguro: el filtro `tutor: { email: { not: null } }` garantiza email no-null
    return results as Array<(typeof results)[0] & { tutor: { email: string } }>;
  }

  /**
   * Procesa una suscripción expirada:
   * 1. Transiciona a PENDIENTE_CANCELACION
   * 2. Setea fechaSolicitudCancelacion para ventana de 24hs
   * 3. Envía email + notificación
   */
  private async procesarExpiracion(
    suscripcion: Awaited<ReturnType<typeof this.findSuscripcionesExpiradas>>[0],
  ): Promise<boolean> {
    const tutor = suscripcion.tutor;
    const fechaSolicitudCancelacion = new Date();
    const fechaLimiteArrepentimiento = new Date(
      fechaSolicitudCancelacion.getTime() + 24 * 60 * 60 * 1000,
    );

    try {
      // 1. Transicionar a PENDIENTE_CANCELACION
      await this.prisma.suscripcionFamiliar.update({
        where: { id: suscripcion.id },
        data: {
          estado: EstadoSuscripcionFamiliar.PENDIENTE_CANCELACION,
          fechaSolicitudCancelacion,
          motivoCancelacion: 'Grace period expirado - falta de pago',
          fechaGracia: null, // Limpiar fecha gracia
        },
      });

      this.logger.log(
        `Suscripción ${suscripcion.id} transicionada a PENDIENTE_CANCELACION`,
      );

      // 2. Enviar email informando inicio de 24hs arrepentimiento
      const estudiantesNombres = tutor.estudiantes.map((e) => e.nombre);
      const tutorNombre = `${tutor.nombre} ${tutor.apellido}`;
      const pagarUrl = `${this.frontendUrl}/tutor/suscripcion/pago`;

      await this.enviarEmailGracePeriodExpirado(
        tutor.email,
        tutorNombre,
        estudiantesNombres,
        fechaLimiteArrepentimiento,
        pagarUrl,
      );

      // 3. Crear notificación in-app
      await this.notificacionesService.createParaTutor(tutor.id, {
        tipo: TipoNotificacion.TUTOR_SUSCRIPCION_CANCELADA,
        titulo: '⏰ Grace period expirado - 24hs para pagar',
        mensaje: `El período de gracia ha terminado. Tenés 24 horas para regularizar tu pago. Después de ese plazo, se eliminará TODO el progreso de ${estudiantesNombres.join(', ')}.`,
        prioridad: PrioridadNotificacion.CRITICA,
        metadata: {
          suscripcionId: suscripcion.id,
          fechaLimiteArrepentimiento: fechaLimiteArrepentimiento.toISOString(),
          motivo: 'grace_period_expirado',
        },
      });

      return true;
    } catch (error) {
      this.logger.error(
        `Error procesando suscripción ${suscripcion.id}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  /**
   * Email cuando expira el grace period:
   * "Tu período de gracia expiró. Tenés 24hs para pagar antes de que se cancele."
   */
  private async enviarEmailGracePeriodExpirado(
    to: string,
    tutorNombre: string,
    estudiantesNombres: string[],
    fechaLimite: Date,
    pagarUrl: string,
  ): Promise<boolean> {
    const subject =
      '⏰ Tu período de gracia expiró - 24 horas para evitar cancelación';
    const nombresStr = estudiantesNombres.join(', ');
    const fechaStr = fechaLimite.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-size: 18px; font-weight: bold; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
    .warning { background: #fef2f2; border: 2px solid #dc2626; padding: 20px; border-radius: 4px; margin-top: 20px; }
    .countdown { font-size: 24px; font-weight: bold; color: #dc2626; text-align: center; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Período de Gracia Expirado</h1>
    </div>
    <div class="content">
      <p>Hola ${tutorNombre},</p>

      <p>El período de gracia de 3 días ha terminado y tu pago sigue pendiente.</p>

      <div class="countdown">
        Tenés hasta el ${fechaStr}
      </div>

      <p>Esta es tu <strong>última oportunidad</strong> para regularizar tu situación y evitar la cancelación.</p>

      <p style="text-align: center;">
        <a href="${pagarUrl}" class="button">💳 PAGAR AHORA</a>
      </p>

      <div class="warning">
        <strong>🚨 ATENCIÓN:</strong> Si no regularizás en las próximas 24 horas, se cancelará
        tu suscripción y se <strong>ELIMINARÁ PERMANENTEMENTE</strong> todo el progreso de
        <strong>${nombresStr}</strong>:
        <ul>
          <li>Todo el XP acumulado</li>
          <li>Todos los logros desbloqueados</li>
          <li>Todo el historial de progreso</li>
          <li>Posición en el ranking de la casa</li>
        </ul>
        <p style="color: #dc2626; font-weight: bold;">Esta acción es IRREVERSIBLE.</p>
      </div>
    </div>
    <div class="footer">
      <p>Este es un email automático de Mateatletas. Por favor no respondas a este mensaje.</p>
      <p>&copy; ${new Date().getFullYear()} Mateatletas. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Hola ${tutorNombre},

⏰ TU PERÍODO DE GRACIA EXPIRÓ

El período de gracia de 3 días ha terminado y tu pago sigue pendiente.

Tenés hasta el ${fechaStr} para regularizar tu situación.

Esta es tu ÚLTIMA OPORTUNIDAD para evitar la cancelación.

Para pagar ahora, visitá: ${pagarUrl}

🚨 ATENCIÓN: Si no regularizás en las próximas 24 horas, se cancelará tu suscripción
y se ELIMINARÁ PERMANENTEMENTE todo el progreso de ${nombresStr}:
- Todo el XP acumulado
- Todos los logros desbloqueados
- Todo el historial de progreso
- Posición en el ranking de la casa

Esta acción es IRREVERSIBLE.

---
Mateatletas
    `;

    return this.emailService.sendEmail(to, subject, html, text);
  }
}
