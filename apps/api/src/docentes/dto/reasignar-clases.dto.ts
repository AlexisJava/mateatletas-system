import { IsNotEmpty, IsUUID } from 'class-validator';

/**
 * DTO para reasignar clases de un docente a otro
 */
export class ReasignarClasesDto {
  @IsNotEmpty({ message: 'El ID del docente destino es requerido' })
  @IsUUID('4', { message: 'El ID del docente destino debe ser un UUID válido' })
  toDocenteId!: string;
}
