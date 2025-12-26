import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Trim } from '../../common/decorators/trim.decorator';

/**
 * DTO para crear un nuevo slide dentro de un contenido
 * El slide contiene JSON que el frontend renderiza como componentes del Design System
 */
export class CreateSlideDto {
  /**
   * Título del slide
   */
  @ApiProperty({
    description: 'Título del slide',
    example: 'Introducción a las fracciones',
    type: String,
  })
  @IsString({ message: 'El título debe ser un texto' })
  @IsNotEmpty({ message: 'El título es requerido' })
  @Trim()
  titulo!: string;

  /**
   * Contenido JSON del slide
   * Estructura ContentBlock serializada que el frontend parsea y renderiza
   */
  @ApiProperty({
    description: 'Contenido JSON del slide (estructura ContentBlock)',
    example:
      '{"type":"Stage","props":{"pattern":"dots"},"children":[{"type":"LessonHeader","props":{"title":"Mi Lección"}}]}',
    type: String,
  })
  @IsString({ message: 'El contenido JSON debe ser un texto' })
  @IsNotEmpty({ message: 'El contenido JSON es requerido' })
  contenidoJson!: string;

  /**
   * Orden del slide dentro de la lección (0-based)
   * Si no se especifica, se asigna al final
   */
  @ApiPropertyOptional({
    description: 'Orden del slide (0-based)',
    example: 0,
    minimum: 0,
    default: 0,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(0, { message: 'El orden mínimo es 0' })
  orden?: number;
}
