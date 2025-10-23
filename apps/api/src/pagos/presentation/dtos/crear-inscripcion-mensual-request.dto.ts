import { IsString, IsArray, IsNumber, IsBoolean, IsNotEmpty, IsObject, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO de Request para crear inscripciones mensuales
 * Presentation Layer - Validación HTTP con class-validator
 */
export class CrearInscripcionMensualRequestDto {
  @ApiProperty({
    description: 'ID del tutor que realiza la inscripción',
    example: 'clt1abc123',
  })
  @IsString()
  @IsNotEmpty()
  tutorId!: string;

  @ApiProperty({
    description: 'IDs de los estudiantes a inscribir',
    example: ['clt2abc123', 'clt2abc456'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  estudiantesIds!: string[];

  @ApiProperty({
    description: 'Productos por estudiante',
    example: {
      'clt2abc123': ['clt3abc123', 'clt3abc456'],
      'clt2abc456': ['clt3abc123'],
    },
  })
  @IsObject()
  @IsNotEmpty()
  productosIdsPorEstudiante!: Record<string, string[]>;

  @ApiProperty({
    description: 'Año de facturación',
    example: 2025,
  })
  @IsNumber()
  @Min(2024)
  @Max(2100)
  @Type(() => Number)
  anio!: number;

  @ApiProperty({
    description: 'Mes de facturación (1-12)',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  mes!: number;

  @ApiProperty({
    description: 'Indica si el grupo tiene AACREA',
    example: false,
  })
  @IsBoolean()
  tieneAACREA!: boolean;
}
