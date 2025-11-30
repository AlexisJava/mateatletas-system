import {
  IsObject,
  IsNotEmpty,
  ValidateNested,
  IsString,
  IsInt,
  IsArray,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO para guardar el contenido de una semana
 * El contenido es un JSON que sigue el schema de docs/MATEATLETAS_STUDIO.md
 */
export class GuardarSemanaDto {
  @ApiProperty({
    description: 'Contenido completo de la semana en formato JSON',
    example: {
      numero: 1,
      nombre: 'Tu Primera Poción',
      descripcion: 'Introducción al mundo de las pociones',
      objetivosAprendizaje: ['Identificar estados de la materia'],
      actividades: [],
      recursos: [],
      resumenGamificacion: {
        xpTotalSemana: 300,
        xpBonusPosible: 100,
        badgesPosibles: ['PrimeraPocion'],
      },
    },
  })
  @IsObject({ message: 'El contenido debe ser un objeto JSON válido' })
  @IsNotEmpty({ message: 'El contenido es requerido' })
  contenido!: Record<string, unknown>;
}

/**
 * DTO para validar semana sin guardar
 * Útil para preview antes de confirmar
 */
export class ValidarSemanaDto extends GuardarSemanaDto {}

/**
 * DTO interno para la estructura de gamificación de semana
 */
export class ResumenGamificacionDto {
  @IsInt()
  @Min(0)
  xpTotalSemana!: number;

  @IsInt()
  @Min(0)
  xpBonusPosible!: number;

  @IsArray()
  @IsString({ each: true })
  badgesPosibles!: string[];
}

/**
 * DTO interno para prerrequisitos
 */
export class PrerequisitoDto {
  @IsString()
  tipo!: 'actividad';

  @IsString()
  id!: string;
}

/**
 * DTO interno para gamificación de actividad
 */
export class GamificacionActividadDto {
  @IsInt()
  @Min(0)
  xpCompletar!: number;

  @IsInt()
  @Min(0)
  xpBonusSinErrores!: number;

  @IsOptional()
  @IsString()
  badge?: string | null;
}

/**
 * DTO interno para bloque
 */
export class BloqueDto {
  @IsInt()
  @Min(1)
  orden!: number;

  @IsString()
  @IsNotEmpty()
  componente!: string;

  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @IsObject()
  contenido!: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(70)
  @Max(100)
  minimoParaAprobar?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => BloqueDto)
  repasoSiFalla?: BloqueDto;

  @IsOptional()
  @IsInt()
  desbloquea?: number | null;
}

/**
 * DTO interno para actividad
 */
export class ActividadDto {
  @IsInt()
  @Min(1)
  numero!: number;

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  descripcion!: string;

  @IsInt()
  @Min(5)
  @Max(60)
  duracionMinutos!: number;

  @IsArray()
  @IsString({ each: true })
  objetivos!: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrerequisitoDto)
  prerrequisitos?: PrerequisitoDto[] | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BloqueDto)
  bloques!: BloqueDto[];

  @ValidateNested()
  @Type(() => GamificacionActividadDto)
  gamificacion!: GamificacionActividadDto;

  @IsOptional()
  @IsString()
  notasDocente?: string | null;
}

/**
 * DTO interno para recurso referenciado
 */
export class RecursoReferenciaDto {
  @IsString()
  id!: string;

  @IsString()
  tipo!: 'imagen' | 'audio' | 'video' | 'documento';

  @IsString()
  nombre!: string;

  @IsString()
  archivo!: string;

  @IsInt()
  @Min(0)
  tamanioBytes!: number;

  @IsArray()
  @IsString({ each: true })
  usadoEn!: string[];
}

/**
 * DTO completo para contenido de semana (para validación estricta)
 */
export class SemanaContenidoDto {
  @IsInt()
  @Min(1)
  @Max(12)
  numero!: number;

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  descripcion!: string;

  @IsArray()
  @IsString({ each: true })
  objetivosAprendizaje!: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActividadDto)
  actividades!: ActividadDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecursoReferenciaDto)
  recursos!: RecursoReferenciaDto[];

  @ValidateNested()
  @Type(() => ResumenGamificacionDto)
  resumenGamificacion!: ResumenGamificacionDto;
}
