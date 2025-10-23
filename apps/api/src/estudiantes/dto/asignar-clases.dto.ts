import { IsArray, IsEmail, IsNotEmpty, IsString, Matches, ArrayMinSize } from 'class-validator';

/**
 * DTO para asignar una o múltiples clases a un estudiante
 */
export class AsignarClasesDto {
  @IsArray({ message: 'ClasesIds debe ser un array' })
  @ArrayMinSize(1, { message: 'Debe incluir al menos una clase' })
  @IsString({ each: true, message: 'Cada ID de clase debe ser un string' })
  @Matches(/^c[a-z0-9]{24}$/, {
    each: true,
    message: 'Cada ID de clase debe ser un CUID válido',
  })
  clasesIds!: string[];
}

/**
 * DTO para copiar estudiante a otro sector
 */
export class CopiarEstudianteDto {
  @IsNotEmpty({ message: 'El ID del sector destino es requerido' })
  @IsString({ message: 'El sectorId debe ser un string' })
  @Matches(/^c[a-z0-9]{24}$/, { message: 'El sectorId debe ser un CUID válido' })
  sectorId!: string;
}

/**
 * DTO para buscar estudiante por email
 */
export class BuscarEstudiantePorEmailDto {
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  email!: string;
}
