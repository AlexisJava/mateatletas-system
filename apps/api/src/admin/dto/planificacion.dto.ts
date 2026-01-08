import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  Min,
  Max,
  IsBoolean,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CasaTipo, MundoTipo, EstadoContenido } from '@prisma/client';

/**
 * DTOs para gestión de Planificaciones desde el Admin
 */

// ─────────────────────────────────────────────────────────────────────────────
// CREAR PLANIFICACIÓN
// ─────────────────────────────────────────────────────────────────────────────

export class CrearPlanificacionDto {
  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsInt()
  @Min(1)
  @Max(52)
  cantidad_clases: number;

  @IsEnum(CasaTipo)
  casa_tipo: CasaTipo;

  @IsEnum(MundoTipo)
  mundo_tipo: MundoTipo;
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTUALIZAR PLANIFICACIÓN
// ─────────────────────────────────────────────────────────────────────────────

export class ActualizarPlanificacionDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTUALIZAR CLASE DE PLANIFICACIÓN
// ─────────────────────────────────────────────────────────────────────────────

export class ActualizarClasePlanificacionDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsUUID()
  teoria_id?: string;

  @IsOptional()
  @IsUUID()
  practica_id?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AGREGAR TAREA A CLASE
// ─────────────────────────────────────────────────────────────────────────────

export class AgregarTareaDto {
  @IsUUID()
  contenido_id: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;

  @IsOptional()
  @IsBoolean()
  obligatoria?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// REORDENAR CLASES
// ─────────────────────────────────────────────────────────────────────────────

export class ReordenarClaseDto {
  @IsUUID()
  clase_id: string;

  @IsInt()
  @Min(1)
  numero: number;
}

export class ReordenarClasesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReordenarClaseDto)
  clases: ReordenarClaseDto[];
}

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE TYPES (para documentación)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Respuesta simplificada de ClasePlanificacion
 */
export interface ClasePlanificacionResponse {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string | null;
  teoria_id: string;
  practica_id: string;
  teoria?: {
    id: string;
    titulo: string;
    estado: EstadoContenido;
  };
  practica?: {
    id: string;
    titulo: string;
    estado: EstadoContenido;
  };
  tareas?: {
    id: string;
    contenido_id: string;
    orden: number;
    obligatoria: boolean;
    contenido: {
      id: string;
      titulo: string;
    };
  }[];
}

/**
 * Respuesta de Planificacion con clases
 */
export interface PlanificacionResponse {
  id: string;
  titulo: string;
  descripcion: string | null;
  cantidad_clases: number;
  casa_tipo: CasaTipo;
  mundo_tipo: MundoTipo;
  estado: EstadoContenido;
  created_at: Date;
  updated_at: Date;
  clases: ClasePlanificacionResponse[];
}

/**
 * Respuesta de lista de planificaciones
 */
export interface PlanificacionesListResponse {
  data: PlanificacionResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
