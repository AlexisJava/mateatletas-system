import {
  IsString,
  IsUUID,
  IsArray,
  ArrayMinSize,
  IsOptional,
  IsEmail,
  Matches,
  Length,
  ValidateIf,
} from 'class-validator';

/**
 * DTO para crear una nueva suscripción
 *
 * Validaciones:
 * - plan_id: UUID requerido del plan de suscripción
 * - estudiante_ids: Array de UUIDs, mínimo 1 estudiante
 * - clase_grupo_id: Opcional, requerido solo si el plan es ASYNC o SYNC
 *
 * Campos opcionales para MercadoPago Bricks (cobro inmediato):
 * - card_token_id: Token generado por Bricks (uso único, no persistir)
 * - payer_email: Email del pagador (REQUERIDO si card_token_id presente)
 *
 * Flujos soportados:
 * 1. Sin card_token_id → Redirect a checkout de MercadoPago
 * 2. Con card_token_id + payer_email → Cobro inmediato con Bricks
 */
export class CrearSuscripcionDto {
  @IsUUID()
  @IsString()
  plan_id: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Debe seleccionar al menos un estudiante' })
  @IsUUID('4', { each: true })
  estudiante_ids: string[];

  @IsOptional()
  @IsUUID()
  clase_grupo_id?: string;

  /**
   * Token de tarjeta generado por MercadoPago Bricks
   *
   * SEGURIDAD:
   * - Es de uso único, NO persistir en DB
   * - Solo loguear últimos 4 caracteres
   * - Validar formato alfanumérico estricto
   */
  @IsOptional()
  @IsString()
  @Length(32, 64, {
    message: 'card_token_id debe tener entre 32 y 64 caracteres',
  })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'card_token_id solo permite caracteres alfanuméricos',
  })
  card_token_id?: string;

  /**
   * Email del pagador para MercadoPago
   *
   * REQUERIDO si card_token_id está presente.
   * Se valida condicionalmente con @ValidateIf.
   */
  @ValidateIf((o: CrearSuscripcionDto) => !!o.card_token_id)
  @IsEmail({}, { message: 'payer_email debe ser un email válido' })
  @IsString()
  payer_email?: string;
}
