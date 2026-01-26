import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '../../common/decorators/trim.decorator';
import { TipoAnuncio } from '@prisma/client';

/**
 * DTO para actualizar un anuncio existente
 * Todos los campos son opcionales
 */
export class ActualizarAnuncioDto {
  /**
   * Título del anuncio (máx 200 caracteres)
   */
  @ApiPropertyOptional({
    description: 'Nuevo título del anuncio',
    example: 'Cambio de horario - ACTUALIZADO',
    maxLength: 200,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'El título debe ser un texto' })
  @Trim()
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'El título no puede exceder 200 caracteres' })
  titulo?: string;

  /**
   * Contenido del anuncio
   */
  @ApiPropertyOptional({
    description: 'Nuevo contenido del anuncio',
    example: 'Se confirma el cambio de horario al jueves 30.',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'El contenido debe ser un texto' })
  @Trim()
  @MinLength(10, { message: 'El contenido debe tener al menos 10 caracteres' })
  contenido?: string;

  /**
   * Tipo/prioridad del anuncio
   */
  @ApiPropertyOptional({
    description: 'Nuevo tipo del anuncio',
    enum: TipoAnuncio,
    example: TipoAnuncio.URGENTE,
  })
  @IsOptional()
  @IsEnum(TipoAnuncio, {
    message: 'El tipo debe ser INFORMATIVO, IMPORTANTE o URGENTE',
  })
  tipo?: TipoAnuncio;

  /**
   * Fecha de expiración del anuncio (opcional)
   */
  @ApiPropertyOptional({
    description: 'Nueva fecha de expiración del anuncio',
    example: '2026-02-28T23:59:59Z',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de expiración debe ser una fecha válida (ISO 8601)' },
  )
  fechaExpiracion?: string;

  /**
   * Estado activo del anuncio
   */
  @ApiPropertyOptional({
    description: 'Indica si el anuncio está activo',
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser true o false' })
  activo?: boolean;
}
