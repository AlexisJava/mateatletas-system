import {
  IsOptional,
  IsString,
  MinLength,
  IsEnum,
  IsArray,
} from 'class-validator';
import { EstadoPlanificacion } from '@prisma/client';

export class UpdatePlanificacionDto {
  @IsOptional()
  @IsString({ message: 'titulo debe ser un texto' })
  @MinLength(3, { message: 'titulo debe tener al menos 3 caracteres' })
  titulo?: string;

  @IsOptional()
  @IsString({ message: 'descripcion debe ser un texto' })
  descripcion?: string;

  @IsOptional()
  @IsString({ message: 'tematica_principal debe ser un texto' })
  @MinLength(3, {
    message: 'tematica_principal debe tener al menos 3 caracteres',
  })
  tematica_principal?: string;

  @IsOptional()
  @IsArray({ message: 'objetivos_aprendizaje debe ser un array' })
  @IsString({ each: true, message: 'cada objetivo debe ser un texto' })
  objetivos_aprendizaje?: string[];

  @IsOptional()
  @IsEnum(EstadoPlanificacion, {
    message: 'estado debe ser uno de BORRADOR, PUBLICADA o ARCHIVADA',
  })
  estado?: EstadoPlanificacion;

  @IsOptional()
  @IsString({ message: 'notas_docentes debe ser un texto' })
  notas_docentes?: string;
}
