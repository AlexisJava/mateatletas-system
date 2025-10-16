import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * DTO para el login de tutores
 */
export class LoginDto {
  /**
   * Email del tutor registrado
   */
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email!: string;

  /**
   * Contraseña del tutor
   */
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;
}
