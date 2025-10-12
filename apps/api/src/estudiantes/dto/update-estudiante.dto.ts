import { PartialType } from '@nestjs/mapped-types';
import { CreateEstudianteDto } from './create-estudiante.dto';

/**
 * DTO para actualizar un estudiante existente
 * Hereda de CreateEstudianteDto haciendo todos los campos opcionales
 */
export class UpdateEstudianteDto extends PartialType(CreateEstudianteDto) {}
