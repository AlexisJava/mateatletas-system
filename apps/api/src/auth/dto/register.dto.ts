import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '../../common/decorators/trim.decorator';
import { Capitalize } from '../../common/decorators/capitalize.decorator';
import { Lowercase } from '../../common/decorators/lowercase.decorator';
import { IsPhoneNumberAR } from '../../common/validators/is-phone-number-ar.validator';

/**
 * DTO para el registro de nuevos tutores en la plataforma
 * Incluye validación avanzada y sanitización automática
 */
export class RegisterDto {
  /**
   * Email del tutor - debe ser único en el sistema
   * Se valida formato de email y será usado para login
   * Se convierte automáticamente a minúsculas para evitar duplicados
   */
  @ApiProperty({
    description: 'Email del tutor - debe ser único y será usado para login',
    example: 'juan.perez@example.com',
    maxLength: 255,
    type: String,
  })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @MaxLength(255, { message: 'El email no puede superar los 255 caracteres' })
  @Trim()
  @Lowercase()
  email!: string;

  /**
   * Contraseña del tutor
   * Mínimo 8 caracteres, debe contener al menos:
   * - Una letra mayúscula
   * - Una letra minúscula
   * - Un número
   * - Un carácter especial (@$!%*?&)
   */
  @ApiProperty({
    description:
      'Contraseña segura (min 8 caracteres, debe incluir mayúscula, minúscula, número y carácter especial)',
    example: 'MiPassword123!',
    minLength: 8,
    maxLength: 128,
    type: String,
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(128, {
    message: 'La contraseña no puede superar los 128 caracteres',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)',
  })
  password!: string;

  /**
   * Nombre del tutor
   * Se capitaliza automáticamente (primera letra en mayúscula)
   */
  @ApiProperty({
    description: 'Nombre del tutor (solo letras y espacios)',
    example: 'Juan Carlos',
    minLength: 2,
    maxLength: 100,
    type: String,
  })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El nombre solo puede contener letras y espacios',
  })
  @Trim()
  @Capitalize()
  nombre!: string;

  /**
   * Apellido del tutor
   * Se capitaliza automáticamente (primera letra en mayúscula)
   */
  @ApiProperty({
    description: 'Apellido del tutor (solo letras y espacios)',
    example: 'Pérez García',
    minLength: 2,
    maxLength: 100,
    type: String,
  })
  @IsString({ message: 'El apellido debe ser un texto' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, {
    message: 'El apellido no puede superar los 100 caracteres',
  })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El apellido solo puede contener letras y espacios',
  })
  @Trim()
  @Capitalize()
  apellido!: string;

  /**
   * Documento Nacional de Identidad (opcional)
   * Formato: 8 dígitos sin puntos ni guiones
   */
  @ApiPropertyOptional({
    description: 'DNI argentino (7 u 8 dígitos sin puntos ni guiones)',
    example: '12345678',
    pattern: '^\\d{7,8}$',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'El DNI debe ser un texto' })
  @Matches(/^\d{7,8}$/, {
    message: 'El DNI debe tener 7 u 8 dígitos sin puntos ni guiones',
  })
  @Trim()
  dni?: string;

  /**
   * Teléfono de contacto (opcional)
   * Formato argentino: +54 9 11 1234-5678 o similar
   */
  @ApiPropertyOptional({
    description: 'Teléfono argentino en formato internacional o local',
    example: '+54 9 11 1234-5678',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un texto' })
  @IsPhoneNumberAR({
    message: 'Debe proporcionar un número de teléfono válido para Argentina',
  })
  @Trim()
  telefono?: string;
}
