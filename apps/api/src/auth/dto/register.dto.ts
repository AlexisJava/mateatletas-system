import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  Matches,
} from 'class-validator';

/**
 * DTO para el registro de nuevos tutores en la plataforma
 */
export class RegisterDto {
  /**
   * Email del tutor - debe ser único en el sistema
   * Se valida formato de email y será usado para login
   */
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email!: string;

  /**
   * Contraseña del tutor
   * Mínimo 8 caracteres, debe contener al menos:
   * - Una letra mayúscula
   * - Una letra minúscula
   * - Un número
   * - Un carácter especial
   */
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
  })
  password!: string;

  /**
   * Nombre del tutor
   */
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre!: string;

  /**
   * Apellido del tutor
   */
  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  apellido!: string;

  /**
   * Documento Nacional de Identidad (opcional)
   */
  @IsOptional()
  @IsString()
  dni?: string;

  /**
   * Teléfono de contacto (opcional)
   */
  @IsOptional()
  @IsString()
  telefono?: string;
}
