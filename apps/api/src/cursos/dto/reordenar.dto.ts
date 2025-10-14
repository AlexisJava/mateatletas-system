import { IsArray, IsUUID, ArrayMinSize, ArrayNotEmpty } from 'class-validator';

/**
 * DTO para reordenar módulos de un producto/curso
 * POST /cursos/productos/:productoId/modulos/reordenar
 */
export class ReordenarModulosDto {
  @IsArray({ message: 'El orden debe ser un array' })
  @ArrayNotEmpty({ message: 'El array de orden no puede estar vacío' })
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos un ID' })
  @IsUUID('4', {
    each: true,
    message: 'Cada ID en el array debe ser un UUID válido',
  })
  orden!: string[];
}

/**
 * DTO para reordenar lecciones de un módulo
 * POST /cursos/modulos/:moduloId/lecciones/reordenar
 */
export class ReordenarLeccionesDto {
  @IsArray({ message: 'El orden debe ser un array' })
  @ArrayNotEmpty({ message: 'El array de orden no puede estar vacío' })
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos un ID' })
  @IsUUID('4', {
    each: true,
    message: 'Cada ID en el array debe ser un UUID válido',
  })
  orden!: string[];
}
