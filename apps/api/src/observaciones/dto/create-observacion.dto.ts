import {
  IsArray,
  ArrayMinSize,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsDateString,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { TipoObservacion, PrioridadObservacion } from '@prisma/client';

/**
 * DTO para crear una observación docente
 *
 * Reglas de negocio:
 * - RN-002: Debe incluir al menos 1 estudiante
 * - RN-003: fecha_evento no puede ser futura
 * - RN-004: contenido mínimo 10 caracteres, máximo 2000
 * - RN-005: Si prioridad=Urgente, auto-setear notificar_admin=true (en service)
 * - RN-006: Si tipo=Incidente, auto-setear requiere_seguimiento=true (en service)
 */
export class CreateObservacionDto {
  @IsArray({ message: 'estudianteIds debe ser un array' })
  @ArrayMinSize(1, { message: 'Debe incluir al menos un estudiante' })
  @IsString({ each: true, message: 'Cada estudianteId debe ser un string' })
  estudianteIds: string[];

  @IsOptional()
  @IsString({ message: 'comisionId debe ser un string' })
  comisionId?: string;

  @IsString({ message: 'contenido debe ser un string' })
  @MinLength(10, { message: 'Contenido debe tener al menos 10 caracteres' })
  @MaxLength(2000, { message: 'Contenido no puede exceder 2000 caracteres' })
  contenido: string;

  @IsDateString({}, { message: 'fechaEvento debe ser una fecha válida ISO' })
  fechaEvento: string;

  @IsEnum(TipoObservacion, {
    message: `tipo debe ser uno de: ${Object.values(TipoObservacion).join(', ')}`,
  })
  tipo: TipoObservacion;

  @IsOptional()
  @IsEnum(PrioridadObservacion, {
    message: `prioridad debe ser uno de: ${Object.values(PrioridadObservacion).join(', ')}`,
  })
  prioridad?: PrioridadObservacion;

  @IsOptional()
  @IsBoolean({ message: 'requiereSeguimiento debe ser un booleano' })
  requiereSeguimiento?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'notificarAdmin debe ser un booleano' })
  notificarAdmin?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'notificarPedagogia debe ser un booleano' })
  notificarPedagogia?: boolean;
}
