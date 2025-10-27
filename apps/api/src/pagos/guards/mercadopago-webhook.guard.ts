import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as crypto from 'crypto';

/**
 * Guard para validar webhooks de MercadoPago usando firma HMAC
 *
 * Documentación oficial:
 * https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks#validar-origen
 *
 * MercadoPago envía headers especiales:
 * - x-signature: Firma HMAC-SHA256
 * - x-request-id: ID único de la petición
 *
 * Algoritmo de validación:
 * 1. Extraer data_id y x-request-id del request
 * 2. Construir string: data_id + x-request-id
 * 3. Calcular HMAC-SHA256 con secret
 * 4. Comparar con x-signature header
 */
@Injectable()
export class MercadoPagoWebhookGuard implements CanActivate {
  private readonly logger = new Logger(MercadoPagoWebhookGuard.name);
  private readonly webhookSecret: string | null;
  private readonly strictMode: boolean;

  constructor(private configService: ConfigService) {
    this.webhookSecret =
      this.configService.get<string>('MERCADOPAGO_WEBHOOK_SECRET') || null;

    // En modo estricto, rechazar si no hay secret configurado
    // En modo permisivo (desarrollo), permitir webhooks sin validación
    this.strictMode =
      this.configService.get<string>('NODE_ENV') === 'production';

    if (!this.webhookSecret) {
      if (this.strictMode) {
        this.logger.error(
          '🚨 PRODUCCIÓN SIN WEBHOOK SECRET: Configure MERCADOPAGO_WEBHOOK_SECRET',
        );
      } else {
        this.logger.warn(
          '⚠️  DESARROLLO: Webhooks sin validación de firma (configure MERCADOPAGO_WEBHOOK_SECRET)',
        );
      }
    } else {
      this.logger.log('✅ Validación de firma de webhook habilitada');
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Si no hay secret configurado
    if (!this.webhookSecret) {
      if (this.strictMode) {
        // En producción, rechazar
        throw new UnauthorizedException('Webhook secret not configured');
      } else {
        // En desarrollo, permitir sin validación
        this.logger.warn('⚠️  Webhook sin validar (modo desarrollo)');
        return true;
      }
    }

    try {
      // Extraer headers de MercadoPago
      const signature = request.headers['x-signature'] as string;
      const requestId = request.headers['x-request-id'] as string;

      if (!signature || !requestId) {
        this.logger.error(
          'Headers de validación faltantes (x-signature, x-request-id)',
        );
        throw new UnauthorizedException('Invalid webhook headers');
      }

      // Extraer data.id del body
      const dataId = request.body?.data?.id;
      if (!dataId) {
        this.logger.error('Webhook body sin data.id');
        throw new UnauthorizedException('Invalid webhook body');
      }

      // Construir manifest (string a firmar)
      const manifest = `id:${dataId};request-id:${requestId};`;

      // Calcular HMAC-SHA256
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(manifest)
        .digest('hex');

      // Comparación segura (timing-safe)
      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      );

      if (!isValid) {
        this.logger.error(
          `Firma inválida: esperada=${expectedSignature.substring(0, 10)}..., recibida=${signature.substring(0, 10)}...`,
        );
        throw new UnauthorizedException('Invalid webhook signature');
      }

      this.logger.log(
        `✅ Webhook validado: data_id=${dataId}, request_id=${requestId}`,
      );
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error validando webhook: ${errorMessage}`);
      throw new UnauthorizedException('Webhook validation failed');
    }
  }
}
