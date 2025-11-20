import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, Length, Matches } from 'class-validator';

/**
 * DTO para completar login con MFA
 *
 * El usuario debe proporcionar:
 * - mfa_token: Token temporal (válido 5 minutos) recibido al hacer login inicial
 * - Código TOTP (6 dígitos) O Código de backup
 */
export class CompleteMfaLoginDto {
  @ApiProperty({
    description: 'Token temporal MFA recibido durante el login inicial',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  mfa_token: string;

  @ApiProperty({
    description: 'Código TOTP de 6 dígitos de la app authenticator',
    example: '123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos' })
  @Matches(/^\d{6}$/, { message: 'El código debe contener solo dígitos' })
  totp_code?: string;

  @ApiProperty({
    description: 'Código de backup alternativo (formato: XXXX-XXXX-XXXX-XXXX)',
    example: 'ABCD-1234-EFGH-5678',
    required: false,
  })
  @IsString()
  @IsOptional()
  backup_code?: string;
}