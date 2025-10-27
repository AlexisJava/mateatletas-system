import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsUUID,
} from 'class-validator';

/**
 * DTO para crear una alerta manualmente
 * POST /api/admin/alertas
 */
export class CrearAlertaDto {
  @IsUUID('4', { message: 'El ID del estudiante debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del estudiante es requerido' })
  estudianteId!: string;

  @IsUUID('4', { message: 'El ID de la clase debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID de la clase es requerido' })
  claseId!: string;

  @IsString({ message: 'La descripción debe ser un texto' })
  @IsNotEmpty({ message: 'La descripción es requerida' })
  @MinLength(10, {
    message: 'La descripción debe tener al menos 10 caracteres',
  })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  descripcion!: string;
}
