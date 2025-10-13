import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * DTO para iniciar el proceso de compra de una suscripción
 */
export class IniciarSuscripcionDto {
  @IsString({ message: 'El ID del producto debe ser un texto' })
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  @IsOptional() // Opcional si solo hay un producto de suscripción
  productoId?: string;
}
