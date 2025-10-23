import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Query DTO para obtener resumen del dashboard del tutor
 * Sin parámetros por ahora - puede extenderse en el futuro
 */
export class GetDashboardResumenDto {
  @ApiProperty({
    description: 'Opcional: obtener solo alertas críticas',
    example: false,
    required: false,
  })
  @IsOptional()
  soloAlertas?: boolean;
}
