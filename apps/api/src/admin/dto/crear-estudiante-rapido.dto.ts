import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsCuid } from '../../common/validators/is-cuid.validator';

/**
 * DTO para crear estudiante de forma rápida
 *
 * Permite:
 * - Usar un tutor existente (tutorExistenteId)
 * - O crear un tutor nuevo automáticamente (tutorNombre, tutorApellido, etc.)
 */
export class CrearEstudianteRapidoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre!: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido!: string;

  @Type(() => Number)
  @IsInt({ message: 'La edad debe ser un número entero' })
  @Min(3, { message: 'La edad mínima es 3 años' })
  @Max(99, { message: 'La edad máxima es 99 años' })
  @IsNotEmpty({ message: 'La edad es obligatoria' })
  edad!: number;

  @IsEnum(['Primaria', 'Secundaria', 'Universidad'])
  @IsNotEmpty({ message: 'El nivel escolar es obligatorio' })
  nivelEscolar!: 'Primaria' | 'Secundaria' | 'Universidad';

  /**
   * ID del tutor existente (si se quiere asignar a un tutor ya registrado)
   * Si no se provee, se creará un tutor nuevo con los datos de tutorNombre, etc.
   */
  @IsOptional()
  @IsCuid()
  tutorExistenteId?: string;

  @IsString()
  @IsOptional()
  tutorNombre?: string;

  @IsString()
  @IsOptional()
  tutorApellido?: string;

  @IsString()
  @IsOptional()
  tutorEmail?: string;

  @IsString()
  @IsOptional()
  tutorTelefono?: string;
}
