import { PartialType } from '@nestjs/mapped-types';
import { CreateLeccionDto } from './create-leccion.dto';

/**
 * DTO para actualizar una lección existente
 * Todos los campos son opcionales
 */
export class UpdateLeccionDto extends PartialType(CreateLeccionDto) {}
