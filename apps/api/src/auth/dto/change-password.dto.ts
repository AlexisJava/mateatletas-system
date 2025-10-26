import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, Matches } from 'class-validator';

/**
 * DTO para cambio de contraseña del usuario autenticado
 */
export class ChangePasswordDto {
  @ApiProperty({
    description: 'Contraseña actual del usuario',
    example: 'TempPass123!',
  })
  @IsString({ message: 'La contraseña actual es requerida' })
  @MinLength(4, { message: 'La contraseña actual es demasiado corta' })
  passwordActual!: string;

  @ApiProperty({
    description:
      'Nueva contraseña segura (mínimo 8 caracteres, incluir mayúscula, minúscula, número y símbolo)',
    example: 'NuevaClaveSegura123!',
  })
  @IsString({ message: 'La nueva contraseña es requerida' })
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message:
      'La nueva contraseña debe incluir mayúscula, minúscula, número y un caracter especial',
  })
  nuevaPassword!: string;
}

