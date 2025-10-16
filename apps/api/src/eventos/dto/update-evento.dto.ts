import { PartialType } from '@nestjs/mapped-types';
import {
  CreateEventoBaseDto,
  CreateTareaDto,
  CreateRecordatorioDto,
  CreateNotaDto
} from './create-evento.dto';

/**
 * DTO base para actualizar un evento
 */
export class UpdateEventoBaseDto extends PartialType(CreateEventoBaseDto) {}

/**
 * DTO para actualizar una Tarea
 */
export class UpdateTareaDto extends PartialType(CreateTareaDto) {}

/**
 * DTO para actualizar un Recordatorio
 */
export class UpdateRecordatorioDto extends PartialType(CreateRecordatorioDto) {}

/**
 * DTO para actualizar una Nota
 */
export class UpdateNotaDto extends PartialType(CreateNotaDto) {}

/**
 * DTO unificado para actualizaciones
 */
export type UpdateEventoDto = UpdateTareaDto | UpdateRecordatorioDto | UpdateNotaDto;
