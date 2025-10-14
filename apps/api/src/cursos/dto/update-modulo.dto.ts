import { PartialType } from '@nestjs/mapped-types';
import { CreateModuloDto } from './create-modulo.dto';

/**
 * DTO para actualizar un módulo existente
 * Todos los campos son opcionales
 */
export class UpdateModuloDto extends PartialType(CreateModuloDto) {}
