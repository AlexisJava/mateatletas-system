import { IsString, IsNotEmpty, IsOptional, IsObject, IsBoolean, IsNumber } from 'class-validator';

/**
 * DTO para validar webhooks de MercadoPago
 * Documentación: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
export class MercadoPagoWebhookDto {
  @IsNumber()
  @IsNotEmpty()
  id!: number; // ID del webhook notification

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

  @IsBoolean()
  @IsNotEmpty()
  live_mode!: boolean; // true o false

  @IsString()
  @IsNotEmpty()
  date_created!: string; // ISO timestamp

  @IsString()
  @IsNotEmpty()
  user_id!: string; // ID del usuario de MercadoPago

  @IsString()
  @IsNotEmpty()
  api_version!: string; // v1, v2, etc.
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
  data!: {
    id: string;
    [key: string]: string | number | boolean | null;
  };
}
