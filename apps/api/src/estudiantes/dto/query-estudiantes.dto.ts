import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para filtrar y paginar la lista de estudiantes
 */
export class QueryEstudiantesDto {
  @IsOptional()
  @IsString()
  equipo_id?: string;

  @IsOptional()
  @IsString()
  nivel_escolar?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 10;
}
