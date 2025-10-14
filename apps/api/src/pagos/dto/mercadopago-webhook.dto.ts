import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

/**
 * DTO para validar webhooks de MercadoPago
 * Documentación: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
export class MercadoPagoWebhookDto {
  @IsString()
  @IsNotEmpty()
  action!: string; // payment.created, payment.updated, etc.

  @IsString()
  @IsNotEmpty()
  type!: string; // payment, merchant_order, etc.

  @IsObject()
  @IsNotEmpty()
  data!: {
    id: string; // ID del recurso (payment, merchant_order)
  };

  @IsString()
  @IsOptional()
  live_mode?: string; // true o false

  @IsString()
  @IsOptional()
  date_created?: string; // ISO timestamp

  @IsString()
  @IsOptional()
  user_id?: string; // ID del usuario de MercadoPago

  @IsString()
  @IsOptional()
  api_version?: string; // v1, v2, etc.
}

/**
 * DTO simplificado para webhooks (validación mínima)
 * Usado cuando no podemos validar firma pero queremos estructura básica
 */
export class WebhookSimpleDto {
  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsObject()
  @IsNotEmpty()
  data!: Record<string, any>;
}
