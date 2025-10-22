import { IsNotEmpty, IsString, Matches } from 'class-validator';

/**
 * DTO para reasignar clases de un docente a otro
 */
export class ReasignarClasesDto {
  @IsNotEmpty({ message: 'El ID del docente destino es requerido' })
  @IsString({ message: 'El ID del docente destino debe ser un string' })
  @Matches(/^c[a-z0-9]{24}$/, { message: 'El ID del docente destino debe ser un CUID válido' })
  toDocenteId!: string;
}
