import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsIn,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '../../common/decorators/trim.decorator';

/**
 * DTO para filtrar y paginar la lista de estudiantes
 */
export class QueryEstudiantesDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de casa',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsString({ message: 'El ID de la casa debe ser un texto' })
  @IsUUID('4', { message: 'El ID de la casa debe ser un UUID válido' })
  @Trim()
  casaId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por nivel escolar',
    example: 'Primaria',
    enum: ['Primaria', 'Secundaria', 'Universidad'],
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'El nivel escolar debe ser un texto' })
  @IsIn(['Primaria', 'Secundaria', 'Universidad'], {
    message: 'El nivel escolar debe ser: Primaria, Secundaria o Universidad',
  })
  @Trim()
  nivelEscolar?: string;

  @ApiPropertyOptional({
    description: 'Número de página (paginación)',
    example: 1,
    minimum: 1,
    default: 1,
    type: Number,
  })
  @IsOptional()
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página mínima es 1' })
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de elementos por página',
    example: 10,
    minimum: 1,
    maximum: 50,
    default: 10,
    type: Number,
  })
  @IsOptional()
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite mínimo es 1' })
  @Max(50, { message: 'El límite máximo es 50 elementos por página' })
  @Type(() => Number)
  limit?: number = 10;
}
