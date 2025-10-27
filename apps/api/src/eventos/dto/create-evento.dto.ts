import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsInt,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoEvento, EstadoTarea, PrioridadTarea } from '@prisma/client';

/**
 * DTO base para crear un evento
 */
export class CreateEventoBaseDto {
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsEnum(TipoEvento)
  @IsNotEmpty()
  tipo!: TipoEvento;

  @IsDateString()
  @IsNotEmpty()
  fecha_inicio!: string;

  @IsDateString()
  @IsNotEmpty()
  fecha_fin!: string;

  @IsBoolean()
  @IsOptional()
  es_todo_el_dia?: boolean;

  @IsString()
  @IsOptional()
  clase_id?: string;
}

/**
 * Subtarea para el sistema de tareas
 */
export class SubtareaDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @IsBoolean()
  completada!: boolean;

  @IsInt()
  @Min(0)
  orden!: number;
}

/**
 * Archivo adjunto para tareas
 */
export class ArchivoDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsString()
  @IsNotEmpty()
  tipo!: string;

  @IsInt()
  @Min(0)
  tamaño!: number;
}

/**
 * Configuración de recurrencia
 */
export class RecurrenciaDto {
  @IsEnum(['DIARIA', 'SEMANAL', 'MENSUAL'])
  @IsNotEmpty()
  tipo!: 'DIARIA' | 'SEMANAL' | 'MENSUAL';

  @IsInt()
  @Min(1)
  intervalo!: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  dias_semana?: number[];

  @IsDateString()
  @IsOptional()
  fecha_fin?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  excepciones?: string[];
}

/**
 * Recordatorio de tarea
 */
export class RecordatorioTareaDto {
  @IsInt()
  @Min(0)
  minutos_antes!: number;

  @IsBoolean()
  enviado!: boolean;
}

/**
 * DTO específico para crear una Tarea
 */
export class CreateTareaDto extends CreateEventoBaseDto {
  @IsEnum(EstadoTarea)
  @IsOptional()
  estado?: EstadoTarea;

  @IsEnum(PrioridadTarea)
  @IsOptional()
  prioridad?: PrioridadTarea;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  porcentaje_completado?: number;

  @IsString()
  @IsOptional()
  categoria?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  etiquetas?: string[];

  @ValidateNested({ each: true })
  @Type(() => SubtareaDto)
  @IsOptional()
  subtareas?: SubtareaDto[];

  @ValidateNested({ each: true })
  @Type(() => ArchivoDto)
  @IsOptional()
  archivos?: ArchivoDto[];

  @IsString()
  @IsOptional()
  clase_relacionada_id?: string;

  @IsString()
  @IsOptional()
  estudiante_relacionado_id?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  tiempo_estimado_minutos?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  tiempo_real_minutos?: number;

  @ValidateNested()
  @Type(() => RecurrenciaDto)
  @IsOptional()
  recurrencia?: RecurrenciaDto;

  @ValidateNested({ each: true })
  @Type(() => RecordatorioTareaDto)
  @IsOptional()
  recordatorios?: RecordatorioTareaDto[];
}

/**
 * DTO específico para crear un Recordatorio
 */
export class CreateRecordatorioDto extends CreateEventoBaseDto {
  @IsBoolean()
  @IsOptional()
  completado?: boolean;

  @IsString()
  @IsOptional()
  color?: string;
}

/**
 * DTO específico para crear una Nota
 */
export class CreateNotaDto extends CreateEventoBaseDto {
  @IsString()
  @IsNotEmpty()
  contenido!: string;

  @IsString()
  @IsOptional()
  categoria?: string;

  @IsString()
  @IsOptional()
  color?: string;
}

/**
 * DTO unificado que acepta cualquier tipo de evento
 */
export type CreateEventoDto =
  | CreateTareaDto
  | CreateRecordatorioDto
  | CreateNotaDto;
