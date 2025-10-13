import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoAsistencia } from '@prisma/client';

export class AsistenciaEstudianteDto {
  @IsString()
  estudianteId!: string;

  @IsEnum(EstadoAsistencia)
  estado!: EstadoAsistencia;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  puntosOtorgados?: number;
}

export class RegistrarAsistenciaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AsistenciaEstudianteDto)
  asistencias!: AsistenciaEstudianteDto[];
}
