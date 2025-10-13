import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { EstadoAsistencia } from '@prisma/client';

export class MarcarAsistenciaDto {
  @IsEnum(EstadoAsistencia)
  estado!: EstadoAsistencia;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  puntos_otorgados?: number;
}
