import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoRecursoStudio } from '@prisma/client';

/**
 * DTO para subir un recurso multimedia
 * El archivo se recibe como multipart/form-data
 */
export class SubirRecursoDto {
  @ApiProperty({
    description: 'ID del curso al que pertenece el recurso',
    example: 'clxyz123abc',
  })
  @IsString({ message: 'El ID del curso debe ser un texto' })
  @IsNotEmpty({ message: 'El ID del curso es requerido' })
  cursoId!: string;

  @ApiProperty({
    description: 'Tipo de recurso',
    enum: TipoRecursoStudio,
    example: 'IMAGEN',
  })
  @IsEnum(TipoRecursoStudio, {
    message: 'El tipo debe ser: IMAGEN, AUDIO, VIDEO o DOCUMENTO',
  })
  tipo!: TipoRecursoStudio;
}

/**
 * Respuesta al subir un recurso
 */
export class RecursoSubidoResponse {
  @ApiProperty({ description: 'ID del recurso creado' })
  id!: string;

  @ApiProperty({ description: 'Nombre del archivo' })
  nombre!: string;

  @ApiProperty({ description: 'Path del archivo en el servidor' })
  archivo!: string;

  @ApiProperty({ description: 'Tipo de recurso' })
  tipo!: TipoRecursoStudio;

  @ApiProperty({ description: 'Tamaño en bytes' })
  tamanioBytes!: number;
}
