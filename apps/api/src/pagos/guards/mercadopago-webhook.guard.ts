import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as crypto from 'crypto';
import { MercadoPagoIpWhitelistService } from '../services/mercadopago-ip-whitelist.service';

/**
 * Extended Express Request interface with rawBody property
 * CRITICAL: Este tipo DEBE coincidir con el definido en main.ts
 */
interface RequestWithRawBody extends Request {
  rawBody?: string;
}

/**
 * Tipos seguros para la estructura de webhook de MercadoPago
 */
interface MercadoPagoWebhookBody {
  action: string;
  api_version: string;
  data: {
    id: string;
  };
  date_created: string;
  id: string;
  live_mode: boolean;
  type: string;
  user_id: string;
}

/**
 * Resultado de la validación de firma
 */
interface SignatureValidationResult {
  isValid: boolean;
  timestamp: number;
  signature: string;
  reason?: string;
}

/**
 * Guard para validar webhooks de MercadoPago usando formato oficial 2025
 *
 * Documentación oficial:
 * https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 *
 * Formato de firma (2025):
 * Header x-signature: "ts=1234567890,v1=abcdef123456..."
 *
 * Algoritmo de validación:
 * 1. Validar IP del cliente (solo IPs de MercadoPago permitidas)
 * 2. Extraer timestamp (ts) y firma (v1) del header x-signature
 * 3. Validar que timestamp no esté expirado (max 5 minutos)
 * 4. Construir payload: `${timestamp}.${JSON.stringify(body)}`
 * 5. Calcular HMAC-SHA256 con secret
 * 6. Comparación timing-safe con v1
 * 7. Validar campos obligatorios: type, user_id, live_mode
 *
 * Seguridad:
 * - ✅ IP Whitelisting (solo IPs oficiales de MercadoPago)
 * - ✅ Validación de timestamp para prevenir replay attacks
 * - ✅ Comparación timing-safe para prevenir timing attacks
 * - ✅ Validación de estructura de body
 * - ✅ Modo estricto en producción
 */
@Injectable()
export class MercadoPagoWebhookGuard implements CanActivate {
  private readonly logger = new Logger(MercadoPagoWebhookGuard.name);
  private readonly webhookSecret: string | null;
  private readonly strictMode: boolean;
  private readonly maxTimestampDiffSeconds = 300; // 5 minutos

  constructor(
    private configService: ConfigService,
    private ipWhitelistService: MercadoPagoIpWhitelistService,
  ) {
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
      this.logger.log('✅ Validación de firma de webhook habilitada (formato 2025)');
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithRawBody>();

    // 0. Validar IP del cliente (primera línea de defensa)
    const clientIp = this.ipWhitelistService.extractRealIp(
      request.headers as Record<string, string | string[] | undefined>,
      request.socket.remoteAddress,
    );

    const isDevelopment = !this.strictMode;
    const isIpAllowed = this.ipWhitelistService.isIpAllowed(
      clientIp,
      isDevelopment,
    );

    if (!isIpAllowed) {
      this.logger.error(
        `🚨 INTENTO DE WEBHOOK DESDE IP NO AUTORIZADA: ${clientIp}`,
      );
      throw new ForbiddenException(
        `Access denied: IP ${clientIp} is not authorized to send webhooks`,
      );
    }

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
      // 1. Validar estructura del body
      this.validateWebhookBody(request.body);

      // 2. Validar firma (formato 2025) usando raw body
      const validationResult = this.validateSignature(
        request.headers['x-signature'] as string,
        request.body,
        request.rawBody,
      );

      if (!validationResult.isValid) {
        this.logger.error(
          `❌ Firma inválida: ${validationResult.reason}`,
        );
        throw new UnauthorizedException('Invalid webhook signature');
      }

      // 3. Validar timestamp (prevenir replay attacks)
      this.validateTimestamp(validationResult.timestamp);

      this.logger.log(
        `✅ Webhook validado: IP=${clientIp}, type=${request.body.type}, data_id=${request.body.data?.id}, user_id=${request.body.user_id}`,
      );
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Error validando webhook: ${errorMessage}`);
      throw new UnauthorizedException('Webhook validation failed');
    }
  }

  /**
   * Valida la estructura del body del webhook
   * @throws UnauthorizedException si la estructura es inválida
   */
  private validateWebhookBody(body: MercadoPagoWebhookBody): void {
    if (!body || typeof body !== 'object') {
      throw new UnauthorizedException('Invalid webhook body: not an object');
    }

    // Validar campos obligatorios
    const requiredFields = ['action', 'api_version', 'data', 'date_created', 'id', 'live_mode', 'type', 'user_id'];
    const missingFields = requiredFields.filter(field => !(field in body));

    if (missingFields.length > 0) {
      throw new UnauthorizedException(
        `Invalid webhook body: missing fields ${missingFields.join(', ')}`
      );
    }

    // Validar estructura de data
    if (!body.data || typeof body.data !== 'object') {
      throw new UnauthorizedException('Invalid webhook body: data must be an object');
    }

    const data = body.data as Record<string, unknown>;
    if (!data.id || typeof data.id !== 'string') {
      throw new UnauthorizedException('Invalid webhook body: data.id must be a string');
    }

    // Validar tipos
    if (typeof body.type !== 'string' || body.type.length === 0) {
      throw new UnauthorizedException('Invalid webhook body: type must be a non-empty string');
    }

    if (typeof body.user_id !== 'string' && typeof body.user_id !== 'number') {
      throw new UnauthorizedException('Invalid webhook body: user_id must be a string or number');
    }

    if (typeof body.live_mode !== 'boolean') {
      throw new UnauthorizedException('Invalid webhook body: live_mode must be a boolean');
    }
  }

  /**
   * Valida la firma del webhook (formato 2025: ts=...,v1=...)
   *
   * @param signatureHeader - Header x-signature con formato "ts=1234567890,v1=abcdef..."
   * @param body - Body del webhook (parseado)
   * @param rawBody - Raw body string (sin parsear, para validar firma)
   * @returns Resultado de validación con timestamp y firma
   */
  private validateSignature(
    signatureHeader: string | undefined,
    body: MercadoPagoWebhookBody,
    rawBody?: string,
  ): SignatureValidationResult {
    if (!signatureHeader || typeof signatureHeader !== 'string') {
      return {
        isValid: false,
        timestamp: 0,
        signature: '',
        reason: 'Missing or invalid x-signature header',
      };
    }

    // Parsear header: "ts=1234567890,v1=abcdef..."
    const parts = signatureHeader.split(',').map(part => part.trim());
    const tsPart = parts.find(p => p.startsWith('ts='));
    const v1Part = parts.find(p => p.startsWith('v1='));

    if (!tsPart || !v1Part) {
      return {
        isValid: false,
        timestamp: 0,
        signature: '',
        reason: 'Invalid x-signature format: expected ts=...,v1=...',
      };
    }

    const timestamp = parseInt(tsPart.split('=')[1], 10);
    const receivedSignature = v1Part.split('=')[1];

    if (isNaN(timestamp) || timestamp <= 0) {
      return {
        isValid: false,
        timestamp: 0,
        signature: receivedSignature,
        reason: 'Invalid timestamp in signature',
      };
    }

    if (!receivedSignature || receivedSignature.length === 0) {
      return {
        isValid: false,
        timestamp,
        signature: '',
        reason: 'Empty signature (v1)',
      };
    }

    // Construir payload según spec oficial: timestamp + '.' + raw body (sin parsear)
    // CRITICAL: Usar rawBody en lugar de JSON.stringify(body) para evitar cambios en el orden de claves
    const bodyString = rawBody || JSON.stringify(body);
    const payload = `${timestamp}.${bodyString}`;

    // DEBUG: Log para ver qué estamos calculando
    this.logger.debug(`🔍 DEBUG Webhook Signature Validation:`);
    this.logger.debug(`  - Timestamp: ${timestamp}`);
    this.logger.debug(`  - Using raw body: ${rawBody ? 'YES ✅' : 'NO ❌ (fallback to JSON.stringify)'}`);
    this.logger.debug(`  - Body string (first 200 chars): ${bodyString.substring(0, 200)}...`);
    this.logger.debug(`  - Payload: ${payload.substring(0, 200)}...`);
    this.logger.debug(`  - Secret (primeros 10 chars): ${(this.webhookSecret as string).substring(0, 10)}...`);
    this.logger.debug(`  - Received signature: ${receivedSignature}`);

    // Calcular HMAC-SHA256
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret as string)
      .update(payload)
      .digest('hex');

    this.logger.debug(`  - Expected signature: ${expectedSignature}`);

    // Comparación timing-safe
    try {
      const isValid = crypto.timingSafeEqual(
        Buffer.from(receivedSignature, 'hex'),
        Buffer.from(expectedSignature, 'hex'),
      );

      return {
        isValid,
        timestamp,
        signature: receivedSignature,
        reason: isValid ? undefined : 'Signature mismatch',
      };
    } catch (error) {
      // timingSafeEqual lanza si los buffers tienen diferente longitud
      return {
        isValid: false,
        timestamp,
        signature: receivedSignature,
        reason: 'Signature length mismatch',
      };
    }
  }

  /**
   * Valida que el timestamp no esté expirado (prevenir replay attacks)
   *
   * @param timestamp - Timestamp Unix en segundos
   * @throws UnauthorizedException si el timestamp está expirado
   */
  private validateTimestamp(timestamp: number): void {
    const now = Math.floor(Date.now() / 1000);
    const diff = Math.abs(now - timestamp);

    if (diff > this.maxTimestampDiffSeconds) {
      throw new UnauthorizedException(
        `Timestamp expired: diff=${diff}s, max=${this.maxTimestampDiffSeconds}s`
      );
    }
  }
}