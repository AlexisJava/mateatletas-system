import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

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

  @IsString()
  @IsOptional()
  @IsUUID('4', { message: 'El ID del sector debe ser un UUID válido' })
  sectorId?: string;

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
