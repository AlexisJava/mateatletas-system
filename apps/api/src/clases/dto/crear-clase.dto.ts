import {
  IsString,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Trim } from '../../common/decorators/trim.decorator';
import { IsFutureDate } from '../../common/validators/is-future-date.validator';
import { IsBusinessHours } from '../../common/validators/is-business-hours.validator';

/**
 * DTO para crear/programar una nueva clase
 * Incluye validación avanzada de reglas de negocio
 */
export class CrearClaseDto {
  /**
   * ID de la ruta curricular (Álgebra, Geometría, etc.)
   */
  @IsString({ message: 'El ID de la ruta curricular debe ser un texto' })
  @IsUUID('4', { message: 'El ID de la ruta curricular debe ser un UUID válido' })
  @Trim()
  rutaCurricularId!: string;

  /**
   * ID del docente que impartirá la clase
   */
  @IsString({ message: 'El ID del docente debe ser un texto' })
  @IsUUID('4', { message: 'El ID del docente debe ser un UUID válido' })
  @Trim()
  docenteId!: string;

  /**
   * Fecha y hora de inicio de la clase
   * Debe ser en el futuro (al menos 30 minutos)
   * Debe estar en horario laboral (8:00 - 20:00)
   */
  @IsDateString({}, { message: 'La fecha y hora de inicio debe ser una fecha válida (ISO 8601)' })
  @IsFutureDate(30, { message: 'La clase debe programarse con al menos 30 minutos de anticipación' })
  @IsBusinessHours(8, 20, { message: 'Las clases deben programarse entre las 8:00 y las 20:00 horas' })
  fechaHoraInicio!: string; // ISO 8601 format

  /**
   * Duración de la clase en minutos
   * Debe ser múltiplo de 15 (15, 30, 45, 60, 90, 120)
   */
  @IsInt({ message: 'La duración debe ser un número entero' })
  @Min(15, { message: 'La duración mínima es 15 minutos' })
  @Max(180, { message: 'La duración máxima es 180 minutos (3 horas)' })
  duracionMinutos!: number;

  /**
   * Cupos máximos para la clase
   * Límite de plataforma: 30 estudiantes por clase
   */
  @IsInt({ message: 'Los cupos deben ser un número entero' })
  @Min(1, { message: 'Debe haber al menos 1 cupo disponible' })
  @Max(30, { message: 'El máximo de cupos por clase es 30 estudiantes' })
  cuposMaximo!: number;

  /**
   * ID del producto/curso asociado (opcional)
   * Si se especifica, es una clase de curso específico
   * Si es null, es una clase de suscripción general
   */
  @IsOptional()
  @IsString({ message: 'El ID del producto debe ser un texto' })
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido' })
  @Trim()
  productoId?: string;
}
