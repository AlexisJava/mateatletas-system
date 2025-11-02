import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para el login de estudiantes
 * Los estudiantes usan username en lugar de email
 */
export class LoginEstudianteDto {
  /**
   * Username del estudiante
   */
  @ApiProperty({
    description: 'Username del estudiante registrado en el sistema',
    example: 'juan123',
    type: String,
  })
  @IsString({ message: 'Debe proporcionar un username válido' })
  @MinLength(3, { message: 'El username debe tener al menos 3 caracteres' })
  username!: string;

  /**
   * Contraseña del estudiante
   */
  @ApiProperty({
    description: 'Contraseña del estudiante',
    example: 'MiPassword123!',
    minLength: 8,
    type: String,
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;
}
