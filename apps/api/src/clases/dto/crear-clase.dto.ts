import { IsString, IsDateString, IsInt, Min, IsOptional } from 'class-validator';

export class CrearClaseDto {
  @IsString()
  rutaCurricularId!: string;

  @IsString()
  docenteId!: string;

  @IsDateString()
  fechaHoraInicio!: string; // ISO 8601 format

  @IsInt()
  @Min(15)
  duracionMinutos!: number;

  @IsInt()
  @Min(1)
  cuposMaximo!: number;

  @IsString()
  @IsOptional()
  productoId?: string; // Opcional - si se especifica, es una clase de curso específico
}
