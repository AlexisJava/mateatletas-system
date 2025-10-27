import {
  IsEnum,
  IsArray,
  ValidateNested,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Tipos de usuario válidos para reset de contraseña
 */
export enum TipoUsuarioReset {
  TUTOR = 'tutor',
  ESTUDIANTE = 'estudiante',
  DOCENTE = 'docente',
}

/**
 * DTO para resetear contraseña de un usuario individual
 */
export class ResetPasswordDto {
  @ApiProperty({
    description: 'Tipo de usuario',
    enum: TipoUsuarioReset,
    example: TipoUsuarioReset.TUTOR,
  })
  @IsEnum(TipoUsuarioReset)
  tipoUsuario!: TipoUsuarioReset;
}

/**
 * DTO para un usuario en reset masivo
 */
export class UsuarioResetMasivoDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: 'clxxx123',
  })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({
    description: 'Tipo de usuario',
    enum: TipoUsuarioReset,
    example: TipoUsuarioReset.ESTUDIANTE,
  })
  @IsEnum(TipoUsuarioReset)
  tipoUsuario!: TipoUsuarioReset;
}

/**
 * DTO para reset masivo de contraseñas
 */
export class ResetPasswordMasivoDto {
  @ApiProperty({
    description: 'Lista de usuarios a resetear',
    type: [UsuarioResetMasivoDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UsuarioResetMasivoDto)
  usuarios!: UsuarioResetMasivoDto[];
}
