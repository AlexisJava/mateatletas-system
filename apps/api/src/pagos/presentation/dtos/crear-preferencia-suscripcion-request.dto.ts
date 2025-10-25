import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * DTO para crear una preferencia de pago de suscripción
 *
 * El frontend puede omitir el producto para usar la suscripción
 * predeterminada configurada en el catálogo.
 */
export class CrearPreferenciaSuscripcionRequestDto {
  @ApiPropertyOptional({
    description: 'ID del producto de suscripción a contratar',
    example: 'prod-subs-123',
  })
  @IsOptional()
  @IsString()
  producto_id?: string;
}
