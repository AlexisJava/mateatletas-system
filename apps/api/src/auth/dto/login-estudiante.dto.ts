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
   * Contraseña/PIN del estudiante
   * Los estudiantes usan un PIN de 4 dígitos generado por el sistema
   */
  @ApiProperty({
    description: 'PIN del estudiante (4 dígitos)',
    example: '1234',
    minLength: 4,
    type: String,
  })
  @IsString()
  @MinLength(4, { message: 'El PIN debe tener al menos 4 caracteres' })
  password!: string;
}
