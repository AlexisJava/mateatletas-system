import { IsString, IsOptional, IsBoolean } from 'class-validator';

/**
 * DTO para crear un sector
 */
export class CreateSectorDto {
  @IsString()
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  icono?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

/**
 * DTO para actualizar un sector
 */
export class UpdateSectorDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  icono?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
