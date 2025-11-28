import {
  IsString,
  IsNotEmpty,
  IsArray,
  Length,
  Matches,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para habilitar MFA
 */
export class EnableMfaDto {
  @ApiProperty({
    description: 'Secret TOTP generado en el setup',
    example: 'JBSWY3DPEHPK3PXP',
  })
  @IsString()
  @IsNotEmpty()
  secret: string;

  @ApiProperty({
    description: 'Código de 6 dígitos de la app authenticator',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos' })
  @Matches(/^\d{6}$/, { message: 'El código debe contener solo dígitos' })
  token: string;

  @ApiProperty({
    description: 'Códigos de backup en texto plano (serán hasheados)',
    example: ['ABCD-1234-EFGH-5678', 'IJKL-9012-MNOP-3456'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  backupCodes: string[];
}

/**
 * DTO para verificar código MFA
 */
export class VerifyMfaDto {
  @ApiProperty({
    description: 'Código de 6 dígitos de la app authenticator',
    example: '123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos' })
  @Matches(/^\d{6}$/, { message: 'El código debe contener solo dígitos' })
  token?: string;

  @ApiProperty({
    description: 'Código de backup (alternativa al token)',
    example: 'ABCD-1234-EFGH-5678',
    required: false,
  })
  @IsString()
  @IsOptional()
  backupCode?: string;
}
