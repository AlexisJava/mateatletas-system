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
  userId: string;
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
 * 5. Calcular HMAC-SHA256 con secret (soporta múltiples secrets durante rotación)
 * 6. Comparación timing-safe con v1
 * 7. Validar campos obligatorios: type, userId, live_mode
 *
 * Seguridad:
 * - ✅ IP Whitelisting (solo IPs oficiales de MercadoPago)
 * - ✅ Validación de timestamp para prevenir replay attacks
 * - ✅ Comparación timing-safe para prevenir timing attacks
 * - ✅ Validación de estructura de body
 * - ✅ Modo estricto en producción
 * - ✅ Secret Rotation: Soporta CURRENT y PREVIOUS secrets durante rotación
 */
@Injectable()
export class MercadoPagoWebhookGuard implements CanActivate {
  private readonly logger = new Logger(MercadoPagoWebhookGuard.name);
  /**
   * Lista de secrets para validación (soporta rotación)
   * Orden: [current, previous] - intenta current primero
   */
  private readonly webhookSecrets: string[];
  private readonly strictMode: boolean;
  private readonly maxTimestampDiffSeconds = 300; // 5 minutos

  constructor(
    private configService: ConfigService,
    private ipWhitelistService: MercadoPagoIpWhitelistService,
  ) {
    // Cargar secrets para rotación
    // MERCADOPAGO_WEBHOOK_SECRET_CURRENT: Secret actual (prioridad 1)
    // MERCADOPAGO_WEBHOOK_SECRET_PREVIOUS: Secret anterior (prioridad 2, para rotación)
    // MERCADOPAGO_WEBHOOK_SECRET: Legacy fallback (backwards compatibility)
    const currentSecret = this.configService.get<string>(
      'MERCADOPAGO_WEBHOOK_SECRET_CURRENT',
    );
    const previousSecret = this.configService.get<string>(
      'MERCADOPAGO_WEBHOOK_SECRET_PREVIOUS',
    );
    const legacySecret = this.configService.get<string>(
      'MERCADOPAGO_WEBHOOK_SECRET',
    );

    // Construir lista de secrets (filtrar nulls/undefined/empty)
    this.webhookSecrets = [currentSecret, previousSecret, legacySecret].filter(
      (s): s is string => Boolean(s && s.length > 0),
    );

    // En modo estricto, rechazar si no hay secret configurado
    // En modo permisivo (desarrollo), permitir webhooks sin validación
    this.strictMode =
      this.configService.get<string>('NODE_ENV') === 'production';

    if (this.webhookSecrets.length === 0) {
      if (this.strictMode) {
        this.logger.error(
          '🚨 PRODUCCIÓN SIN WEBHOOK SECRET: Configure MERCADOPAGO_WEBHOOK_SECRET_CURRENT',
        );
      } else {
        this.logger.warn(
          '⚠️  DESARROLLO: Webhooks sin validación de firma (configure MERCADOPAGO_WEBHOOK_SECRET_CURRENT)',
        );
      }
    } else {
      const secretCount = this.webhookSecrets.length;
      this.logger.log(
        `✅ Validación de firma habilitada (${secretCount} secret${secretCount > 1 ? 's - rotation mode' : ''})`,
      );
    }
  }

  canActivate(context: ExecutionContext): boolean {
    // Early exit para entorno de test
    if (this.isTestEnvironment(context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithRawBody>();
    const clientIp = this.extractAndValidateClientIp(request);

    // Early exit si se puede omitir validación
    const skipResult = this.shouldSkipSignatureValidation(clientIp);
    if (skipResult.skip) {
      return true;
    }

    return this.performFullValidation(request, clientIp);
  }

  /**
   * Verifica si estamos en contexto de test (supertest no tiene switchToHttp)
   */
  private isTestEnvironment(context: ExecutionContext): boolean {
    try {
      if (typeof context.switchToHttp !== 'function') {
        this.logger.debug(
          '⚠️ Webhook guard en test environment - skipping validation',
        );
        return true;
      }
      return false;
    } catch (error) {
      if (error instanceof TypeError) {
        this.logger.debug(
          '⚠️ Webhook guard en test environment - skipping validation',
        );
        return true;
      }
      throw error;
    }
  }

  /**
   * Extrae y valida la IP del cliente
   * @throws ForbiddenException si la IP no está en whitelist
   */
  private extractAndValidateClientIp(request: RequestWithRawBody): string {
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

    return clientIp;
  }

  /**
   * Determina si se puede omitir la validación de firma
   */
  private shouldSkipSignatureValidation(clientIp: string): { skip: boolean } {
    // Sin secrets configurados
    if (this.webhookSecrets.length === 0) {
      if (this.strictMode) {
        throw new UnauthorizedException('Webhook secret not configured');
      }
      this.logger.warn('⚠️  Webhook sin validar (modo desarrollo)');
      return { skip: true };
    }

    // Validación deshabilitada para tests
    const disableValidation =
      this.configService.get<string>('DISABLE_WEBHOOK_SIGNATURE_VALIDATION') ===
      'true';
    if (disableValidation && !this.strictMode) {
      this.logger.warn(
        `⚠️ Webhook signature validation DISABLED (test mode): IP=${clientIp}`,
      );
      return { skip: true };
    }

    return { skip: false };
  }

  /**
   * Ejecuta la validación completa del webhook
   */
  private performFullValidation(
    request: RequestWithRawBody,
    clientIp: string,
  ): boolean {
    try {
      this.validateWebhookBody(request.body as MercadoPagoWebhookBody);
      const webhookBody = request.body as MercadoPagoWebhookBody;

      this.validateLiveMode(webhookBody.live_mode);

      const validationResult = this.validateSignature(
        request.headers['x-signature'] as string,
        webhookBody,
        request.rawBody,
      );

      if (!validationResult.isValid) {
        this.logger.error(`❌ Firma inválida: ${validationResult.reason}`);
        throw new UnauthorizedException('Invalid webhook signature');
      }

      this.validateTimestamp(validationResult.timestamp);

      this.logger.log(
        `✅ Webhook validado: IP=${clientIp}, type=${webhookBody.type}, data_id=${webhookBody.data?.id}, userId=${webhookBody.userId}`,
      );
      return true;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
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
    const requiredFields = [
      'action',
      'api_version',
      'data',
      'date_created',
      'id',
      'live_mode',
      'type',
      'userId',
    ];
    const missingFields = requiredFields.filter((field) => !(field in body));

    if (missingFields.length > 0) {
      throw new UnauthorizedException(
        `Invalid webhook body: missing fields ${missingFields.join(', ')}`,
      );
    }

    // Validar estructura de data
    if (!body.data || typeof body.data !== 'object') {
      throw new UnauthorizedException(
        'Invalid webhook body: data must be an object',
      );
    }

    const data = body.data as Record<string, unknown>;
    if (!data.id || typeof data.id !== 'string') {
      throw new UnauthorizedException(
        'Invalid webhook body: data.id must be a string',
      );
    }

    // Validar tipos
    if (typeof body.type !== 'string' || body.type.length === 0) {
      throw new UnauthorizedException(
        'Invalid webhook body: type must be a non-empty string',
      );
    }

    if (typeof body.userId !== 'string' && typeof body.userId !== 'number') {
      throw new UnauthorizedException(
        'Invalid webhook body: userId must be a string or number',
      );
    }

    if (typeof body.live_mode !== 'boolean') {
      throw new UnauthorizedException(
        'Invalid webhook body: live_mode must be a boolean',
      );
    }
  }

  /**
   * Valida que el webhook sea de producción (live_mode=true)
   *
   * PROBLEMA QUE RESUELVE:
   * - MercadoPago envía webhooks con live_mode=false durante pruebas
   * - Sin validación: pago de prueba puede activar servicio real
   * - Atacante puede usar credenciales sandbox para "pagar" gratis
   *
   * SOLUCIÓN:
   * - En producción: rechazar webhooks con live_mode=false
   * - En desarrollo: permitir live_mode=false (facilita testing local)
   * - Logging de seguridad para auditoría
   *
   * @param liveMode - Indica si el webhook es de producción (true) o prueba (false)
   * @throws UnauthorizedException si live_mode=false en producción
   */
  private validateLiveMode(liveMode: boolean): void {
    // En modo desarrollo, permitir webhooks de prueba
    if (!this.strictMode) {
      if (!liveMode) {
        this.logger.warn(
          '⚠️  Webhook de prueba (live_mode=false) permitido en modo desarrollo',
        );
      }
      return;
    }

    // En producción, rechazar webhooks de prueba
    if (!liveMode) {
      this.logger.error(
        '🚨 WEBHOOK DE PRUEBA RECHAZADO - live_mode=false en producción. ' +
          'Posible intento de fraude usando credenciales sandbox.',
      );
      throw new UnauthorizedException(
        'Test mode webhooks (live_mode=false) are not allowed in production',
      );
    }
  }

  /**
   * Valida la firma del webhook (formato 2025: ts=...,v1=...)
   * Soporta múltiples secrets para rotación segura
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
    const parts = signatureHeader.split(',').map((part) => part.trim());
    const tsPart = parts.find((p) => p.startsWith('ts='));
    const v1Part = parts.find((p) => p.startsWith('v1='));

    if (!tsPart || !v1Part) {
      return {
        isValid: false,
        timestamp: 0,
        signature: '',
        reason: 'Invalid x-signature format: expected ts=...,v1=...',
      };
    }

    const tsValue = tsPart.split('=')[1];
    const receivedSignature = v1Part.split('=')[1];

    if (!tsValue) {
      return {
        isValid: false,
        timestamp: 0,
        signature: '',
        reason: 'Invalid x-signature format: missing timestamp value',
      };
    }

    const timestamp = parseInt(tsValue, 10);

    if (isNaN(timestamp) || timestamp <= 0) {
      return {
        isValid: false,
        timestamp: 0,
        signature: receivedSignature || '',
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
    this.logger.debug(
      `  - Using raw body: ${rawBody ? 'YES ✅' : 'NO ❌ (fallback to JSON.stringify)'}`,
    );
    this.logger.debug(
      `  - Body string (first 200 chars): ${bodyString.substring(0, 200)}...`,
    );
    this.logger.debug(`  - Payload: ${payload.substring(0, 200)}...`);
    this.logger.debug(`  - Received signature: ${receivedSignature}`);
    this.logger.debug(`  - Secrets to try: ${this.webhookSecrets.length}`);

    // Intentar validar con cada secret (soporta rotación)
    for (let i = 0; i < this.webhookSecrets.length; i++) {
      const secret = this.webhookSecrets[i] as string;
      const result = this.validateWithSecret(
        payload,
        receivedSignature,
        secret,
        timestamp,
      );

      if (result.isValid) {
        // Log si se usó un secret que no es el primero (rotación activa)
        if (i > 0) {
          this.logger.warn(
            `⚠️ Webhook validado con secret #${i + 1} (previous) - considera completar la rotación`,
          );
        }
        return result;
      }
    }

    // Ningún secret funcionó
    return {
      isValid: false,
      timestamp,
      signature: receivedSignature,
      reason: 'Signature mismatch with all configured secrets',
    };
  }

  /**
   * Valida firma con un secret específico
   *
   * @param payload - Payload construido (timestamp.body)
   * @param receivedSignature - Firma recibida en el header
   * @param secret - Secret a usar para validación
   * @param timestamp - Timestamp extraído del header
   * @returns Resultado de validación
   */
  private validateWithSecret(
    payload: string,
    receivedSignature: string,
    secret: string,
    timestamp: number,
  ): SignatureValidationResult {
    // Calcular HMAC-SHA256
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

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
    } catch {
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
        `Timestamp expired: diff=${diff}s, max=${this.maxTimestampDiffSeconds}s`,
      );
    }
  }
}
