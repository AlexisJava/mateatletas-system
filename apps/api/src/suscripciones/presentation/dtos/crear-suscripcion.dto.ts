import {
  IsString,
  IsArray,
  ArrayMinSize,
  IsOptional,
  IsEmail,
  Matches,
  Length,
  ValidateIf,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Regex para validar CUID (formato usado por Prisma)
 * CUID v1: 25 caracteres alfanuméricos que empiezan con 'c'
 */
const CUID_REGEX = /^c[a-z0-9]{24}$/;

/**
 * Validador personalizado para CUIDs (inline para evitar dependencias circulares)
 */
function IsCuidLocal(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCuid',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: `${propertyName} debe ser un CUID válido`,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown, _args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }
          return CUID_REGEX.test(value);
        },
      },
    });
  };
}

/**
 * Validador para arrays de CUIDs
 */
function IsCuidArray(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCuidArray',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: `${propertyName} debe contener CUIDs válidos`,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown, _args: ValidationArguments) {
          if (!Array.isArray(value)) {
            return false;
          }
          return value.every(
            (item) => typeof item === 'string' && CUID_REGEX.test(item),
          );
        },
      },
    });
  };
}

/**
 * DTO para crear una nueva suscripción
 *
 * Validaciones:
 * - planId: CUID requerido del plan de suscripción (formato Prisma)
 * - estudianteIds: Array de CUIDs, mínimo 1 estudiante
 * - claseGrupoId: Opcional, requerido solo si el plan es ASYNC o SYNC
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
  @IsCuidLocal({ message: 'planId debe ser un CUID válido' })
  @IsString()
  planId: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Debe seleccionar al menos un estudiante' })
  @IsCuidArray({ message: 'estudianteIds debe contener CUIDs válidos' })
  estudianteIds: string[];

  @IsOptional()
  @IsCuidLocal({ message: 'claseGrupoId debe ser un CUID válido' })
  claseGrupoId?: string;

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
