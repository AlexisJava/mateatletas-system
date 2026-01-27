/**
 * GracePeriodEmailCronService - FASE 8.2
 *
 * Envía emails diarios durante el período de gracia:
 * - Día 1: Email 2 (quedan 2 días)
 * - Día 2: Email 3 (ÚLTIMO DÍA)
 *
 * Corre diariamente a las 09:00 AR.
 *
 * NOTA: Email 1 (día 0) se envía cuando falla el pago (webhook handler).
 */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { EstadoSuscripcionFamiliar, TipoNotificacion } from '@prisma/client';

import { PrismaService } from '../../core/database/prisma.service';
import { EmailService } from '../../email/email.service';
import { NotificacionesService } from '../../notificaciones/notificaciones.service';

/** Días de gracia antes de cancelación */
const GRACE_PERIOD_DIAS = 3;

/** Metadata keys para rastrear emails enviados */
const GRACE_EMAIL_DAY_KEY = 'gracePeriodEmailDay';

@Injectable()
export class GracePeriodEmailCronService {
  private readonly logger = new Logger(GracePeriodEmailCronService.name);
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
   * Cron: Enviar emails de grace period
   * Corre todos los días a las 09:00 (hora Argentina, UTC-3)
   *
   * Cron: '0 9 * * *' = 09:00 todos los días
   * Para producción en UTC: '0 12 * * *' (12:00 UTC = 09:00 AR)
   */
  @Cron('0 12 * * *', { name: 'grace-period-emails' })
  async handleGracePeriodEmails(): Promise<void> {
    this.logger.log('📧 Iniciando envío de emails de grace period...');

    try {
      // Buscar suscripciones en PAUSED con fechaGracia activa
      const suscripcionesEnGracia = await this.findSuscripcionesEnGracia();

      if (suscripcionesEnGracia.length === 0) {
        this.logger.log('No hay suscripciones en grace period.');
        return;
      }

      this.logger.log(
        `Procesando ${suscripcionesEnGracia.length} suscripciones en grace period`,
      );

      let emailsEnviados = 0;

      for (const suscripcion of suscripcionesEnGracia) {
        const enviado = await this.procesarSuscripcion(suscripcion);
        if (enviado) emailsEnviados++;
      }

      this.logger.log(
        `✅ Grace period emails completado. Enviados: ${emailsEnviados}/${suscripcionesEnGracia.length}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error en grace period emails: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Busca suscripciones familiares en estado PAUSED con fechaGracia activa.
   * Solo incluye tutores con email (requerido para enviar notificaciones).
   */
  private async findSuscripcionesEnGracia() {
    const results = await this.prisma.suscripcionFamiliar.findMany({
      where: {
        estado: EstadoSuscripcionFamiliar.PAUSED,
        fechaGracia: { not: null },
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
   * Procesa una suscripción: determina qué email enviar basado en días restantes
   */
  private async procesarSuscripcion(
    suscripcion: Awaited<ReturnType<typeof this.findSuscripcionesEnGracia>>[0],
  ): Promise<boolean> {
    if (!suscripcion.fechaGracia) return false;

    const diasRestantes = this.calcularDiasRestantes(suscripcion.fechaGracia);
    const tutor = suscripcion.tutor;

    // Si ya pasó el grace period, no enviar email (el otro cron lo maneja)
    if (diasRestantes <= 0) {
      return false;
    }

    // Determinar qué día de email corresponde
    // Día 0 = 3 días restantes (email ya enviado por webhook)
    // Día 1 = 2 días restantes → Email 2
    // Día 2 = 1 día restante → Email 3
    const diaGracia = GRACE_PERIOD_DIAS - diasRestantes;

    // Solo enviamos emails para días 1 y 2 (emails 2 y 3)
    if (diaGracia < 1 || diaGracia > 2) {
      return false;
    }

    // Verificar si ya se envió email para este día
    const yaEnviado = await this.verificarEmailYaEnviado(
      tutor.id,
      suscripcion.id,
      diaGracia,
    );

    if (yaEnviado) {
      this.logger.debug(
        `Email día ${diaGracia} ya enviado para suscripción ${suscripcion.id}`,
      );
      return false;
    }

    const estudiantesNombres = tutor.estudiantes.map((e) => e.nombre);
    const tutorNombre = `${tutor.nombre} ${tutor.apellido}`;
    const actualizarPagoUrl = `${this.frontendUrl}/tutor/suscripcion/pago`;

    try {
      // Enviar email según el día
      if (diaGracia === 1) {
        // Día 1 → Email 2: "Te quedan 2 días"
        await this.emailService.sendGracePeriodDay2Email(
          tutor.email,
          tutorNombre,
          estudiantesNombres,
          actualizarPagoUrl,
        );
      } else if (diaGracia === 2) {
        // Día 2 → Email 3: "ÚLTIMO DÍA"
        await this.emailService.sendGracePeriodDay3Email(
          tutor.email,
          tutorNombre,
          estudiantesNombres,
          actualizarPagoUrl,
        );
      }

      // Crear notificación in-app para rastrear que se envió
      await this.crearNotificacionGracePeriod(
        tutor.id,
        suscripcion.id,
        diaGracia,
        diasRestantes,
      );

      this.logger.log(
        `📧 Email día ${diaGracia} enviado a ${tutor.email} (${diasRestantes} días restantes)`,
      );

      return true;
    } catch (error) {
      this.logger.error(
        `Error enviando email a ${tutor.email}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  /**
   * Calcula días restantes hasta fechaGracia
   */
  private calcularDiasRestantes(fechaGracia: Date): number {
    const ahora = new Date();
    const diffMs = fechaGracia.getTime() - ahora.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Verifica si ya se envió email para este día de gracia
   * Busca notificación con metadata específica
   */
  private async verificarEmailYaEnviado(
    tutorId: string,
    suscripcionId: string,
    diaGracia: number,
  ): Promise<boolean> {
    const notificacion = await this.prisma.notificacion.findFirst({
      where: {
        tutorId,
        tipo: TipoNotificacion.TUTOR_SUSCRIPCION_PROXIMA_VENCER,
        metadata: {
          path: [GRACE_EMAIL_DAY_KEY],
          equals: diaGracia,
        },
      },
    });

    return notificacion !== null;
  }

  /**
   * Crea notificación in-app para el tutor sobre grace period
   * También sirve para rastrear que el email fue enviado
   */
  private async crearNotificacionGracePeriod(
    tutorId: string,
    suscripcionId: string,
    diaGracia: number,
    diasRestantes: number,
  ): Promise<void> {
    const titulo =
      diaGracia === 2
        ? '🚨 ÚLTIMO DÍA - Regularizá tu pago'
        : `⚠️ Te quedan ${diasRestantes} días para regularizar`;

    const mensaje =
      diaGracia === 2
        ? 'Mañana se cancelará tu suscripción y se eliminará todo el progreso de tus hijos. Esta acción es IRREVERSIBLE.'
        : `Tu pago sigue pendiente. Regularizá antes de que se cancele tu suscripción y se elimine el progreso de tus hijos.`;

    await this.notificacionesService.createParaTutor(tutorId, {
      tipo: TipoNotificacion.TUTOR_SUSCRIPCION_PROXIMA_VENCER,
      titulo,
      mensaje,
      prioridad: diaGracia === 2 ? 'CRITICA' : 'ALTA',
      metadata: {
        suscripcionId,
        [GRACE_EMAIL_DAY_KEY]: diaGracia,
        diasRestantes,
        emailEnviado: true,
      },
    });
  }
}
