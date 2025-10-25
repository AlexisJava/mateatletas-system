import {
  IsString,
  IsEnum,
  IsArray,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsDateString,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TipoClaseGrupo, DiaSemana } from '@prisma/client';

export class ActualizarClaseGrupoDto {
  @ApiPropertyOptional({
    description: 'Nombre descriptivo del grupo',
    example: 'GRUPO B1 - MATEMÁTICA - PERFIL BASE PROGRESIVO (6 y 7 años)',
  })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Tipo de clase grupo',
    enum: TipoClaseGrupo,
    example: TipoClaseGrupo.GRUPO_REGULAR,
  })
  @IsOptional()
  @IsEnum(TipoClaseGrupo)
  tipo?: TipoClaseGrupo;

  @ApiPropertyOptional({
    description: 'Día de la semana en que se reúne',
    enum: DiaSemana,
    example: DiaSemana.LUNES,
  })
  @IsOptional()
  @IsEnum(DiaSemana)
  dia_semana?: DiaSemana;

  @ApiPropertyOptional({
    description: 'Hora de inicio en formato HH:MM',
    example: '19:30',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'hora_inicio debe tener formato HH:MM',
  })
  hora_inicio?: string;

  @ApiPropertyOptional({
    description: 'Hora de fin en formato HH:MM',
    example: '21:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'hora_fin debe tener formato HH:MM',
  })
  hora_fin?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio de vigencia del grupo',
    example: '2025-03-01',
  })
  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin de vigencia',
    example: '2025-12-15',
  })
  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @ApiPropertyOptional({
    description: 'Año lectivo al que pertenece',
    example: 2025,
  })
  @IsOptional()
  @IsInt()
  @Min(2024)
  @Max(2100)
  anio_lectivo?: number;

  @ApiPropertyOptional({
    description: 'Cupo máximo de estudiantes',
    example: 15,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  cupo_maximo?: number;

  @ApiPropertyOptional({
    description: 'ID del docente asignado',
    example: 'clt1abc123',
  })
  @IsOptional()
  @IsString()
  docente_id?: string;

  @ApiPropertyOptional({
    description: 'ID de la ruta curricular (tema)',
    example: 'clt2abc456',
  })
  @IsOptional()
  @IsString()
  ruta_curricular_id?: string;

  @ApiPropertyOptional({
    description: 'ID del sector (Matemática o Programación)',
    example: 'clt3abc789',
  })
  @IsOptional()
  @IsString()
  sector_id?: string;

  @ApiPropertyOptional({
    description: 'Nivel o descripción del grupo',
    example: '6 y 7 años',
  })
  @IsOptional()
  @IsString()
  nivel?: string;

  @ApiPropertyOptional({
    description: 'IDs de los estudiantes inscritos (reemplaza la lista completa)',
    example: ['clt4abc111', 'clt4abc222'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  estudiantes_ids?: string[];
}
