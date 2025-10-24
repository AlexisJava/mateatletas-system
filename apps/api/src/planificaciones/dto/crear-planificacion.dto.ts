import { IsString, IsInt, IsArray, IsOptional, IsEnum, IsBoolean, Min, Max, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoPlanificacion, NivelDificultad } from '@prisma/client';

export class CrearPlanificacionDto {
  @ApiProperty({ example: 'B1', description: 'Código del grupo (B1, B2, B3, B4, L1, L2, etc.)' })
  @IsString()
  codigo_grupo!: string;

  @ApiProperty({ example: 11, description: 'Mes (1-12)', minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  mes!: number;

  @ApiProperty({ example: 2025, description: 'Año' })
  @IsInt()
  @Min(2024)
  anio!: number;

  @ApiProperty({ example: 'El Reino de los Números Mágicos', description: 'Título de la planificación' })
  @IsString()
  titulo!: string;

  @ApiProperty({ example: 'Una aventura mágica donde los estudiantes descubren...', description: 'Descripción de la planificación' })
  @IsString()
  descripcion!: string;

  @ApiProperty({ example: 'Suma y resta con reagrupamiento', description: 'Temática principal de la planificación' })
  @IsString()
  tematica_principal!: string;

  @ApiProperty({
    example: ['Dominar suma con reagrupamiento hasta 100', 'Resolver problemas contextualizados'],
    description: 'Lista de objetivos de aprendizaje',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  objetivos_aprendizaje!: string[];

  @ApiProperty({
    example: 'BORRADOR',
    enum: EstadoPlanificacion,
    default: 'BORRADOR',
    required: false,
  })
  @IsOptional()
  @IsEnum(EstadoPlanificacion)
  estado?: EstadoPlanificacion;

  @ApiProperty({ example: 'Notas para los docentes...', required: false })
  @IsOptional()
  @IsString()
  notas_docentes?: string;
}
