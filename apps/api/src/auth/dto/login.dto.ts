import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para el login de tutores
 */
export class LoginDto {
  /**
   * Email del tutor registrado
   */
  @ApiProperty({
    description: 'Email del tutor registrado en el sistema',
    example: 'juan.perez@example.com',
    type: String,
  })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email!: string;

  /**
   * Contraseña del tutor
   */
  @ApiProperty({
    description: 'Contraseña del tutor',
    example: 'MiPassword123!',
    minLength: 8,
    maxLength: 128,
    type: String,
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(128, {
    message: 'La contraseña no puede tener más de 128 caracteres',
  })
  password!: string;
}
