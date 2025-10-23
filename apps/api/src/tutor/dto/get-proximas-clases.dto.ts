import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Query DTO para obtener próximas clases del tutor
 */
export class GetProximasClasesDto {
  @ApiProperty({
    description: 'Límite de resultados (máximo 50)',
    example: 5,
    required: false,
    default: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite mínimo es 1' })
  @Max(50, { message: 'El límite máximo es 50' })
  limit?: number = 5;
}
