import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CasaTipo, MundoTipo } from '@prisma/client';
import { Trim } from '../../common/decorators/trim.decorator';
import { CreateSlideDto } from './create-slide.dto';

/**
 * DTO para crear un nuevo contenido educativo (lección)
 * El contenido se crea como BORRADOR y debe ser publicado explícitamente
 */
export class CreateContenidoDto {
  /**
   * Título de la lección
   */
  @ApiProperty({
    description: 'Título de la lección',
    example: 'Introducción a las Fracciones',
    maxLength: 200,
    type: String,
  })
  @IsString({ message: 'El título debe ser un texto' })
  @IsNotEmpty({ message: 'El título es requerido' })
  @MaxLength(200, { message: 'El título no puede superar los 200 caracteres' })
  @Trim()
  titulo!: string;

  /**
   * Casa objetivo del contenido
   * Define qué grupo de edad puede ver este contenido
   */
  @ApiProperty({
    description:
      'Casa objetivo (QUANTUM: 6-9 años, VERTEX: 10-12 años, PULSAR: 13-17 años)',
    enum: CasaTipo,
    example: CasaTipo.QUANTUM,
  })
  @IsEnum(CasaTipo, {
    message: 'La casa debe ser: QUANTUM, VERTEX o PULSAR',
  })
  casaTipo!: CasaTipo;

  /**
   * Mundo/materia del contenido
   * Define el área de conocimiento
   */
  @ApiProperty({
    description: 'Mundo/materia (MATEMATICA, PROGRAMACION, CIENCIAS)',
    enum: MundoTipo,
    example: MundoTipo.MATEMATICA,
  })
  @IsEnum(MundoTipo, {
    message: 'El mundo debe ser: MATEMATICA, PROGRAMACION o CIENCIAS',
  })
  mundoTipo!: MundoTipo;

  /**
   * Descripción o resumen del contenido
   */
  @ApiPropertyOptional({
    description: 'Descripción o resumen de la lección',
    example:
      'En esta lección aprenderemos qué son las fracciones y cómo usarlas en la vida diaria.',
    maxLength: 1000,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(1000, {
    message: 'La descripción no puede superar los 1000 caracteres',
  })
  @Trim()
  descripcion?: string;

  /**
   * Slides iniciales (opcional)
   * Permite crear el contenido con slides ya definidos
   */
  @ApiPropertyOptional({
    description: 'Slides iniciales de la lección',
    type: [CreateSlideDto],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSlideDto)
  slides?: CreateSlideDto[];
}
