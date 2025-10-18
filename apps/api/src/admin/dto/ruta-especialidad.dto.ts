import { IsString, IsOptional, IsBoolean } from 'class-validator';

/**
 * DTO para crear una ruta de especialidad
 */
export class CreateRutaEspecialidadDto {
  @IsString()
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsString()
  sectorId!: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

/**
 * DTO para actualizar una ruta de especialidad
 */
export class UpdateRutaEspecialidadDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  sectorId?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

/**
 * DTO para asignar rutas a un docente
 */
export class AsignarRutasDocenteDto {
  @IsString({ each: true })
  rutaIds!: string[];
}
