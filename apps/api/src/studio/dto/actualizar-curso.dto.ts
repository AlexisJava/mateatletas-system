import { PartialType, OmitType } from '@nestjs/swagger';
import { CrearCursoDto } from './crear-curso.dto';

/**
 * DTO para actualizar un curso existente
 * Todos los campos son opcionales excepto los de clasificación (categoria, mundo, casa)
 * que no se pueden cambiar una vez creado el curso
 */
export class ActualizarCursoDto extends PartialType(
  OmitType(CrearCursoDto, ['categoria', 'mundo', 'casa'] as const),
) {}
