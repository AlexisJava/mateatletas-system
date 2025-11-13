import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '../../common/decorators/trim.decorator';

/**
 * DTO para reservar una clase para un estudiante
 */
export class ReservarClaseDto {
  @ApiProperty({
    description: 'ID del estudiante que se inscribirá a la clase',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
    format: 'uuid',
  })
  @IsString({ message: 'El ID del estudiante debe ser un texto' })
  @IsUUID('4', { message: 'El ID del estudiante debe ser un UUID válido' })
  @Trim()
  estudianteId!: string;

  @ApiPropertyOptional({
    description: 'Observaciones o notas sobre la reserva',
    example: 'El estudiante necesita asistencia especial',
    maxLength: 500,
    type: String,
  })
  @IsString({ message: 'Las observaciones deben ser un texto' })
  @IsOptional()
  @MaxLength(500, {
    message: 'Las observaciones no pueden superar los 500 caracteres',
  })
  @Trim()
  observaciones?: string;
}
