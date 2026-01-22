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
  cantidadClases: number;

  @IsEnum(CasaTipo)
  casaTipo: CasaTipo;

  @IsEnum(MundoTipo)
  mundoTipo: MundoTipo;
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
  teoriaId?: string;

  @IsOptional()
  @IsUUID()
  practicaId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AGREGAR TAREA A CLASE
// ─────────────────────────────────────────────────────────────────────────────

export class AgregarTareaDto {
  @IsUUID()
  contenidoId: string;

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
  claseId: string;

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
  teoriaId: string;
  practicaId: string;
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
    contenidoId: string;
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
  cantidadClases: number;
  casaTipo: CasaTipo;
  mundoTipo: MundoTipo;
  estado: EstadoContenido;
  createdAt: Date;
  updatedAt: Date;
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
