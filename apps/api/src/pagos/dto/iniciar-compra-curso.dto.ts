import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO para iniciar el proceso de compra de un curso
 */
export class IniciarCompraCursoDto {
  @IsString({ message: 'El ID del producto debe ser un texto' })
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  productoId!: string;

  @IsString({ message: 'El ID del estudiante debe ser un texto' })
  @IsNotEmpty({ message: 'El ID del estudiante es requerido' })
  estudianteId!: string;
}
