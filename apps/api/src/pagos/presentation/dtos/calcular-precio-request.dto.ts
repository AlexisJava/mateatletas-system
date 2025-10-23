import { IsString, IsArray, IsBoolean, IsNotEmpty, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de Request para calcular precios
 * Presentation Layer - Validación HTTP con class-validator
 *
 * Diferencia con Application DTO:
 * - Este valida la entrada HTTP
 * - Se transforma al DTO de Application antes de llamar al Use Case
 */
export class CalcularPrecioRequestDto {
  @ApiProperty({
    description: 'ID del tutor que solicita el cálculo',
    example: 'clt1abc123',
  })
  @IsString()
  @IsNotEmpty()
  tutorId!: string;

  @ApiProperty({
    description: 'IDs de los estudiantes',
    example: ['clt2abc123', 'clt2abc456'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  estudiantesIds!: string[];

  @ApiProperty({
    description: 'Productos por estudiante (key: estudianteId, value: array de productoIds)',
    example: {
      'clt2abc123': ['clt3abc123', 'clt3abc456'],
      'clt2abc456': ['clt3abc123'],
    },
  })
  @IsObject()
  @IsNotEmpty()
  productosIdsPorEstudiante!: Record<string, string[]>;

  @ApiProperty({
    description: 'Indica si el grupo familiar tiene certificado AACREA',
    example: false,
  })
  @IsBoolean()
  tieneAACREA!: boolean;
}
