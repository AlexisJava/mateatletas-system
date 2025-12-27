import { PartialType } from '@nestjs/mapped-types';
import { CreateContenidoDto } from './create-contenido.dto';
import { IsOptional, IsString, IsInt, Min, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '../../common/decorators/trim.decorator';

/**
 * DTO para actualizar un contenido educativo existente
 * Todos los campos son opcionales
 * Los nodos se gestionan con endpoints separados
 */
export class UpdateContenidoDto extends PartialType(CreateContenidoDto) {
  /**
   * URL de imagen de portada (opcional)
   * Debe ser HTTPS para seguridad
   */
  @ApiPropertyOptional({
    description: 'URL HTTPS de la imagen de portada',
    example:
      'https://storage.mateatletas.com/contenidos/portada-fracciones.jpg',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'La URL de la imagen debe ser un texto' })
  @IsUrl(
    { require_protocol: true, protocols: ['https'] },
    { message: 'La imagen de portada debe ser una URL HTTPS válida' },
  )
  @Trim()
  imagenPortada?: string;

  /**
   * Duración estimada en minutos
   */
  @ApiPropertyOptional({
    description: 'Duración estimada de la lección en minutos',
    example: 15,
    minimum: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La duración debe ser un número entero' })
  @Min(1, { message: 'La duración mínima es 1 minuto' })
  duracionMinutos?: number;

  /**
   * Orden de visualización dentro de casa/mundo
   */
  @ApiPropertyOptional({
    description: 'Orden de visualización',
    example: 1,
    minimum: 0,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(0, { message: 'El orden mínimo es 0' })
  orden?: number;
}
