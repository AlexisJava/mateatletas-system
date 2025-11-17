import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { EstadoAsistencia } from '@prisma/client';

export class FiltrarAsistenciaDto {
  @IsOptional()
  @IsString()
  claseId?: string;

  @IsOptional()
  @IsString()
  estudianteId?: string;

  @IsOptional()
  @IsEnum(EstadoAsistencia)
  estado?: EstadoAsistencia;

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;
}
