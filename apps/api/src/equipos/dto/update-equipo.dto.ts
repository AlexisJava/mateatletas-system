import { PartialType } from '@nestjs/mapped-types';
import { CreateEquipoDto } from './create-equipo.dto';

/**
 * DTO para actualizar un equipo existente
 * Hereda de CreateEquipoDto pero hace todos los campos opcionales
 * Permite actualizaciones parciales (solo cambiar el nombre, solo el color, etc.)
 */
export class UpdateEquipoDto extends PartialType(CreateEquipoDto) {}
