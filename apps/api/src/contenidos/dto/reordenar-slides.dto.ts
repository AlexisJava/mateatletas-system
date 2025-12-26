import {
  IsArray,
  IsString,
  IsInt,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para un item individual de reordenamiento
 */
export class SlideOrdenItemDto {
  @ApiProperty({
    description: 'ID del slide',
    example: 'clt1abc123',
  })
  @IsString({ message: 'El ID del slide debe ser un texto' })
  slideId!: string;

  @ApiProperty({
    description: 'Nueva posición del slide (0-based)',
    example: 0,
    minimum: 0,
  })
  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(0, { message: 'El orden mínimo es 0' })
  orden!: number;
}

/**
 * DTO para reordenar múltiples slides de un contenido
 * Se envía el array completo con las nuevas posiciones
 */
export class ReordenarSlidesDto {
  @ApiProperty({
    description: 'Array con las nuevas posiciones de cada slide',
    type: [SlideOrdenItemDto],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos un slide' })
  @ValidateNested({ each: true })
  @Type(() => SlideOrdenItemDto)
  orden!: SlideOrdenItemDto[];
}
