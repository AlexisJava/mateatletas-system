import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';

/**
 * DTO para asignar una insignia a un estudiante durante clase en vivo
 * Las insignias son predefinidas en el frontend y se registran como puntos con contexto
 *
 * NOTA: claseId es opcional porque:
 * - El frontend de clases en vivo usa ClaseGrupo (grupos recurrentes), no Clase
 * - El modelo PuntoObtenido.claseId apunta a Clase (clases individuales con cupos)
 * - Son modelos diferentes, por lo que no siempre hay un claseId válido
 */
export class AsignarInsigniaDto {
  @IsString()
  @IsNotEmpty()
  estudianteId!: string;

  @IsString()
  @IsOptional()
  claseId?: string;

  @IsString()
  @IsNotEmpty()
  insigniaId!: string;

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @IsNumber()
  @Min(1)
  puntos!: number;
}
