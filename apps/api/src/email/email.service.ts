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
