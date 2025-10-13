import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { EstadoAsistencia } from '@prisma/client';

export class FiltrarAsistenciaDto {
  @IsOptional()
  @IsString()
  clase_id?: string;

  @IsOptional()
  @IsString()
  estudiante_id?: string;

  @IsOptional()
  @IsEnum(EstadoAsistencia)
  estado?: EstadoAsistencia;

  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;
}
