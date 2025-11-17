import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * DTO para crear una preferencia de pago de curso individual
 */
export class CrearPreferenciaCursoRequestDto {
  @ApiProperty({
    description: 'ID del producto tipo Curso',
    example: 'prod-curso-001',
  })
  @IsString()
  productoId!: string;

  @ApiProperty({
    description: 'ID del estudiante que se desea inscribir',
    example: 'est-123',
  })
  @IsString()
  estudianteId!: string;
}
