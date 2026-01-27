import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

/**
 * EmailService - Servicio para envío de emails transaccionales
 *
 * Soporta:
 * - SMTP (producción con SendGrid, Mailgun, etc.)
 * - Ethereal (desarrollo - emails de prueba)
 * - Console (fallback sin SMTP configurado)
 *
 * Variables de entorno requeridas para producción:
 * - SMTP_HOST
 * - SMTP_PORT
 * - SMTP_USER
 * - SMTP_PASS
 * - SMTP_FROM (email remitente)
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter<SMTPTransport.SentMessageInfo> | null = null;
  private readonly fromEmail: string;
  private readonly isProduction: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
    this.fromEmail =
      this.configService.get<string>('SMTP_FROM') ||
      'Mateatletas <noreply@mateatletas.com>';

    void this.initializeTransporter();
  }

  private async initializeTransporter(): Promise<void> {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    if (smtpHost && smtpUser && smtpPass) {
      // Usar SMTP configurado
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort || 587,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.logger.log(`Email transporter configurado: ${smtpHost}`);
    } else if (!this.isProduction) {
      // En desarrollo sin SMTP, crear cuenta Ethereal
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        this.logger.log(
          `Email transporter Ethereal configurado (dev). Usuario: ${testAccount.user}`,
        );
      } catch {
        this.logger.warn(
          'No se pudo crear cuenta Ethereal. Emails se loguearán en consola.',
        );
      }
    } else {
      this.logger.warn(
        'SMTP no configurado. Emails no se enviarán en producción.',
      );
    }
  }

  /**
   * Envía un email
   *
   * @param to - Email destinatario
   * @param subject - Asunto del email
   * @param html - Contenido HTML del email
   * @param text - Contenido texto plano (opcional)
   * @returns true si se envió exitosamente
   */
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ): Promise<boolean> {
    if (!this.transporter) {
      // Fallback: loguear en consola
      this.logger.log(`[EMAIL SIMULADO] Para: ${to}`);
      this.logger.log(`[EMAIL SIMULADO] Asunto: ${subject}`);
      this.logger.log(`[EMAIL SIMULADO] Contenido: ${text || html}`);
      return true;
    }

    try {
      const info: SMTPTransport.SentMessageInfo =
        await this.transporter.sendMail({
          from: this.fromEmail,
          to,
          subject,
          text: text || this.htmlToText(html),
          html,
        });

      this.logger.log(`Email enviado a ${to}: ${info.messageId}`);

      // En desarrollo con Ethereal, mostrar URL de preview
      if (info.messageId && !this.isProduction) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          this.logger.log(`Preview URL: ${previewUrl}`);
        }
      }

      return true;
    } catch (error) {
      this.logger.error(
        `Error enviando email a ${to}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      );
      return false;
    }
  }

  /**
   * Envía email de recuperación de contraseña
   *
   * @param to - Email destinatario
   * @param resetUrl - URL completa para resetear contraseña
   * @param userName - Nombre del usuario (para personalizar)
   */
  async sendPasswordResetEmail(
    to: string,
    resetUrl: string,
    userName?: string,
  ): Promise<boolean> {
    const subject = 'Recupera tu contraseña - Mateatletas';
    const greeting = userName ? `Hola ${userName}` : 'Hola';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
    .warning { background: #fef3c7; padding: 10px; border-radius: 4px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mateatletas</h1>
    </div>
    <div class="content">
      <p>${greeting},</p>
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Mateatletas.</p>
      <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
      <p style="text-align: center;">
        <a href="${resetUrl}" class="button">Restablecer contraseña</a>
      </p>
      <p>O copia y pega este enlace en tu navegador:</p>
      <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
      <div class="warning">
        <strong>Importante:</strong> Este enlace expira en 1 hora. Si no solicitaste este cambio, puedes ignorar este email.
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
${greeting},

Recibimos una solicitud para restablecer la contraseña de tu cuenta en Mateatletas.

Para crear una nueva contraseña, visita el siguiente enlace:
${resetUrl}

Este enlace expira en 1 hora. Si no solicitaste este cambio, puedes ignorar este email.

---
Este es un email automático de Mateatletas.
    `;

    return this.sendEmail(to, subject, html, text);
  }

  // ============================================================================
  // GRACE PERIOD EMAILS - FASE 8.2
  // ============================================================================

  /**
   * Email Día 1: Pago falló, 3 días para regularizar
   */
  async sendGracePeriodDay1Email(
    to: string,
    tutorNombre: string,
    estudiantesNombres: string[],
    fechaLimite: Date,
    actualizarPagoUrl: string,
  ): Promise<boolean> {
    const subject = '⚠️ Tu pago falló - Tenés 3 días para regularizar';
    const fechaStr = fechaLimite.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    const nombresStr = estudiantesNombres.join(', ');

    const html = this.buildGracePeriodEmailHtml({
      tutorNombre,
      titulo: 'No pudimos procesar tu pago',
      mensaje: `
        <p>Hola ${tutorNombre},</p>
        <p>No pudimos procesar tu pago de Mateatletas.</p>
        <p><strong>Tenés hasta el ${fechaStr}</strong> para regularizar tu situación.</p>
      `,
      advertencia: `Si no regularizás, la suscripción se cancelará y se eliminará
        <strong>TODO el progreso</strong> de ${nombresStr} (XP, logros, historial).`,
      botonTexto: 'Actualizar medio de pago',
      botonUrl: actualizarPagoUrl,
      diasRestantes: 3,
    });

    const text = `
Hola ${tutorNombre},

No pudimos procesar tu pago de Mateatletas.

Tenés hasta el ${fechaStr} para regularizar tu situación.

Para actualizar tu medio de pago, visitá: ${actualizarPagoUrl}

Si no regularizás, la suscripción se cancelará y se eliminará TODO el progreso de ${nombresStr} (XP, logros, historial).

---
Mateatletas
    `;

    return this.sendEmail(to, subject, html, text);
  }

  /**
   * Email Día 2: Te quedan 2 días
   */
  async sendGracePeriodDay2Email(
    to: string,
    tutorNombre: string,
    estudiantesNombres: string[],
    actualizarPagoUrl: string,
  ): Promise<boolean> {
    const subject = '⚠️ Te quedan 2 días - Pago pendiente Mateatletas';
    const nombresStr = estudiantesNombres.join(', ');

    const html = this.buildGracePeriodEmailHtml({
      tutorNombre,
      titulo: 'Tu pago sigue pendiente',
      mensaje: `
        <p>Hola ${tutorNombre},</p>
        <p>Tu pago sigue pendiente. <strong>Te quedan 2 días.</strong></p>
      `,
      advertencia: `Recordá: si no regularizás, ${nombresStr} perderán todo su progreso.`,
      botonTexto: 'Regularizar ahora',
      botonUrl: actualizarPagoUrl,
      diasRestantes: 2,
    });

    const text = `
Hola ${tutorNombre},

Tu pago sigue pendiente. Te quedan 2 días.

Para regularizar, visitá: ${actualizarPagoUrl}

Recordá: si no regularizás, ${nombresStr} perderán todo su progreso.

---
Mateatletas
    `;

    return this.sendEmail(to, subject, html, text);
  }

  /**
   * Email Día 3: ÚLTIMO DÍA - Mañana se cancela
   */
  async sendGracePeriodDay3Email(
    to: string,
    tutorNombre: string,
    estudiantesNombres: string[],
    actualizarPagoUrl: string,
  ): Promise<boolean> {
    const subject = '🚨 ÚLTIMO DÍA - Mañana se cancela tu suscripción';
    const nombresStr = estudiantesNombres.join(', ');

    const html = this.buildGracePeriodEmailHtml({
      tutorNombre,
      titulo: 'ÚLTIMO DÍA para regularizar',
      mensaje: `
        <p>Hola ${tutorNombre},</p>
        <p><strong>Este es el último día para regularizar tu pago.</strong></p>
        <p>Mañana se cancelará tu suscripción y se <span style="color: #dc2626;">ELIMINARÁ PERMANENTEMENTE</span>:</p>
        <ul>
          <li>Todo el XP de ${nombresStr}</li>
          <li>Todos los logros desbloqueados</li>
          <li>Todo el historial de progreso</li>
        </ul>
      `,
      advertencia: 'Esta acción es IRREVERSIBLE.',
      botonTexto: 'Pagar ahora',
      botonUrl: actualizarPagoUrl,
      diasRestantes: 1,
      esUrgente: true,
    });

    const text = `
Hola ${tutorNombre},

🚨 ÚLTIMO DÍA para regularizar tu pago.

Mañana se cancelará tu suscripción y se ELIMINARÁ PERMANENTEMENTE:
- Todo el XP de ${nombresStr}
- Todos los logros desbloqueados
- Todo el historial de progreso

Esta acción es IRREVERSIBLE.

Para pagar ahora, visitá: ${actualizarPagoUrl}

---
Mateatletas
    `;

    return this.sendEmail(to, subject, html, text);
  }

  /**
   * Email de cancelación confirmada (después de grace period + 24hs arrepentimiento)
   */
  async sendCancelacionConfirmadaEmail(
    to: string,
    tutorNombre: string,
    estudiantesNombres: string[],
    verPlanesUrl: string,
  ): Promise<boolean> {
    const subject = 'Tu suscripción de Mateatletas fue cancelada';
    const nombresStr = estudiantesNombres.join(', ');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #6b7280; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mateatletas</h1>
    </div>
    <div class="content">
      <p>Hola ${tutorNombre},</p>
      <p>Tu suscripción ha sido cancelada por falta de pago.</p>
      <p>El progreso de <strong>${nombresStr}</strong> ha sido eliminado de nuestra plataforma.</p>
      <p>Si querés volver, podés crear una nueva suscripción (sujeto a disponibilidad de cupos).</p>
      <p style="text-align: center;">
        <a href="${verPlanesUrl}" class="button">Ver planes</a>
      </p>
      <p>Gracias por haber sido parte de Mateatletas.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Mateatletas. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Hola ${tutorNombre},

Tu suscripción ha sido cancelada por falta de pago.

El progreso de ${nombresStr} ha sido eliminado de nuestra plataforma.

Si querés volver, podés crear una nueva suscripción (sujeto a disponibilidad de cupos).

Ver planes: ${verPlanesUrl}

Gracias por haber sido parte de Mateatletas.

---
Mateatletas
    `;

    return this.sendEmail(to, subject, html, text);
  }

  /**
   * Helper para construir HTML de emails de grace period
   */
  private buildGracePeriodEmailHtml(params: {
    tutorNombre: string;
    titulo: string;
    mensaje: string;
    advertencia: string;
    botonTexto: string;
    botonUrl: string;
    diasRestantes: number;
    esUrgente?: boolean;
  }): string {
    const headerColor = params.esUrgente ? '#dc2626' : '#f59e0b';
    const warningBg = params.esUrgente ? '#fef2f2' : '#fef3c7';
    const warningBorder = params.esUrgente ? '#fecaca' : '#fde68a';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${headerColor}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
    .warning { background: ${warningBg}; border: 1px solid ${warningBorder}; padding: 15px; border-radius: 4px; margin-top: 20px; }
    .dias-badge { display: inline-block; background: ${headerColor}; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mateatletas</h1>
      <p class="dias-badge">${params.diasRestantes} día${params.diasRestantes > 1 ? 's' : ''} restante${params.diasRestantes > 1 ? 's' : ''}</p>
    </div>
    <div class="content">
      <h2>${params.titulo}</h2>
      ${params.mensaje}
      <p style="text-align: center;">
        <a href="${params.botonUrl}" class="button">${params.botonTexto}</a>
      </p>
      <div class="warning">
        <strong>⚠️ Importante:</strong> ${params.advertencia}
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
  }

  /**
   * Convierte HTML a texto plano básico
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>.*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
