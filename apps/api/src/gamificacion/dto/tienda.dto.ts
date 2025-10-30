import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para solicitar canje de curso (estudiante)
 */
export class CanjearCursoDto {
  @IsString()
  @IsNotEmpty({ message: 'El ID del curso es requerido' })
  cursoId!: string;
}

/**
 * DTO para aprobar solicitud de canje (tutor)
 */
export class AprobarCanjeDto {
  @IsEnum(['padre_paga_todo', 'hijo_paga_mitad', 'hijo_paga_todo'], {
    message: 'Opción de pago inválida. Debe ser: padre_paga_todo, hijo_paga_mitad o hijo_paga_todo',
  })
  opcionPago!: 'padre_paga_todo' | 'hijo_paga_mitad' | 'hijo_paga_todo';

  @IsString()
  @IsOptional()
  mensajePadre?: string;
}

/**
 * DTO para rechazar solicitud de canje (tutor)
 */
export class RechazarCanjeDto {
  @IsString()
  @IsOptional()
  mensajePadre?: string;
}

/**
 * DTO para actualizar progreso de curso (estudiante)
 */
export class ActualizarProgresoDto {
  @IsNumber()
  @Min(0, { message: 'El progreso no puede ser menor a 0%' })
  @Max(100, { message: 'El progreso no puede ser mayor a 100%' })
  @Type(() => Number)
  progreso!: number;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  completado?: boolean;
}

/**
 * DTO para filtros de catálogo (query params)
 */
export class FiltrosCatalogoDto {
  @IsString()
  @IsOptional()
  categoria?: string;

  @IsString()
  @IsOptional()
  destacados?: string; // 'true' | 'false' (viene como string desde query params)

  @IsString()
  @IsOptional()
  nuevos?: string; // 'true' | 'false'

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  nivelMaximo?: number;
}
