import { PartialType } from '@nestjs/mapped-types';
import { CrearProductoDto } from './crear-producto.dto';

/**
 * DTO para actualizar un producto existente
 * Todos los campos son opcionales (hereda de CrearProductoDto con PartialType)
 */
export class ActualizarProductoDto extends PartialType(CrearProductoDto) {}
