import {
  IsString,
  IsInt,
  IsEnum,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  MaxLength,
  IsJSON,
} from 'class-validator';
import { TipoContenido } from '@prisma/client';

/**
 * DTO para crear una nueva lección dentro de un módulo
 * Implementa validaciones según mejores prácticas de Ed-Tech:
 * - Microlearning: Lecciones cortas (5-15 min)
 * - Gamificación: Puntos balanceados (5-20 pts)
 * - Multi-modal: Diferentes tipos de contenido
 */
export class CreateLeccionDto {
  @IsString()
  @MaxLength(200, { message: 'El título no puede exceder 200 caracteres' })
  titulo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, {
    message: 'La descripción no puede exceder 2000 caracteres',
  })
  descripcion?: string;

  @IsEnum(TipoContenido, { message: 'Tipo de contenido inválido' })
  tipoContenido!: TipoContenido;

  @IsString()
  contenido!: string; // Puede ser URL, Markdown, JSON según tipo

  @IsInt()
  @Min(1, { message: 'El orden debe ser mayor a 0' })
  orden!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50, { message: 'Los puntos no pueden exceder 50 por lección' })
  puntosPorCompletar?: number;

  @IsOptional()
  @IsString()
  logroDesbloqueableId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30, {
    message: 'La duración debe estar entre 1 y 30 minutos (Microlearning)',
  })
  duracionEstimadaMinutos?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsJSON()
  recursosAdicionales?: string; // JSON string

  @IsOptional()
  @IsString()
  leccionPrerequisitoId?: string;
}
