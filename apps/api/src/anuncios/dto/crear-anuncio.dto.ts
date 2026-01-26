import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '../../common/decorators/trim.decorator';
import { TipoAnuncio } from '@prisma/client';

/**
 * DTO para crear un nuevo anuncio de docente
 */
export class CrearAnuncioDto {
  /**
   * Título del anuncio (máx 200 caracteres)
   */
  @ApiProperty({
    description: 'Título del anuncio',
    example: 'Cambio de horario clase del viernes',
    maxLength: 200,
    type: String,
  })
  @IsString({ message: 'El título debe ser un texto' })
  @Trim()
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'El título no puede exceder 200 caracteres' })
  titulo!: string;

  /**
   * Contenido del anuncio
   */
  @ApiProperty({
    description: 'Contenido completo del anuncio',
    example:
      'Les informo que la clase del viernes 31 se adelanta al jueves 30 a las 16:00hs.',
    type: String,
  })
  @IsString({ message: 'El contenido debe ser un texto' })
  @Trim()
  @MinLength(10, { message: 'El contenido debe tener al menos 10 caracteres' })
  contenido!: string;

  /**
   * Tipo/prioridad del anuncio
   */
  @ApiPropertyOptional({
    description: 'Tipo del anuncio (define prioridad)',
    enum: TipoAnuncio,
    default: TipoAnuncio.INFORMATIVO,
    example: TipoAnuncio.IMPORTANTE,
  })
  @IsOptional()
  @IsEnum(TipoAnuncio, {
    message: 'El tipo debe ser INFORMATIVO, IMPORTANTE o URGENTE',
  })
  tipo?: TipoAnuncio;

  /**
   * ID de la comisión destinataria (opcional)
   * Si es null, el anuncio va a todas las comisiones del docente
   */
  @ApiPropertyOptional({
    description:
      'ID de la comisión destinataria (si no se especifica, va a todas las comisiones del docente)',
    example: 'clrwx7890123456789012345',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'El ID de comisión debe ser un texto' })
  @Trim()
  comisionId?: string;

  /**
   * Fecha de expiración del anuncio (opcional)
   */
  @ApiPropertyOptional({
    description:
      'Fecha de expiración del anuncio (después de esta fecha no se mostrará)',
    example: '2026-02-15T23:59:59Z',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de expiración debe ser una fecha válida (ISO 8601)' },
  )
  fechaExpiracion?: string;
}
