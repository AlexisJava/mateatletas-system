import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsDateString,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoClaseGrupo, DiaSemana } from '@prisma/client';

export class CrearClaseGrupoDto {
  @ApiProperty({
    description: 'ID del grupo pedagógico (B1, B2, B3, etc.)',
    example: 'b5ac168d-1b44-4357-8e73-4339db2fa77c',
  })
  @IsString()
  @IsNotEmpty()
  grupoId!: string;

  @ApiProperty({
    description: 'Código único del grupo (ej: B1, B2, OLIMP-2025)',
    example: 'B1',
  })
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @ApiProperty({
    description: 'Nombre descriptivo del grupo',
    example: 'GRUPO B1 - MATEMÁTICA - PERFIL BASE PROGRESIVO (6 y 7 años)',
  })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty({
    description: 'Tipo de clase grupo',
    enum: TipoClaseGrupo,
    example: TipoClaseGrupo.GRUPO_REGULAR,
  })
  @IsEnum(TipoClaseGrupo)
  tipo!: TipoClaseGrupo;

  @ApiProperty({
    description: 'Día de la semana en que se reúne',
    enum: DiaSemana,
    example: DiaSemana.LUNES,
  })
  @IsEnum(DiaSemana)
  diaSemana!: DiaSemana;

  @ApiProperty({
    description: 'Hora de inicio en formato HH:MM',
    example: '19:30',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'horaInicio debe tener formato HH:MM',
  })
  horaInicio!: string;

  @ApiProperty({
    description: 'Hora de fin en formato HH:MM',
    example: '21:00',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'horaFin debe tener formato HH:MM',
  })
  horaFin!: string;

  @ApiProperty({
    description: 'Fecha de inicio de vigencia del grupo',
    example: '2025-03-01',
  })
  @IsDateString()
  fechaInicio!: string;

  @ApiPropertyOptional({
    description:
      'Fecha de fin de vigencia. Si es GRUPO_REGULAR y no se especifica, se usa 15/dic del año lectivo',
    example: '2025-12-15',
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiProperty({
    description: 'Año lectivo al que pertenece',
    example: 2025,
  })
  @IsInt()
  @Min(2024)
  @Max(2100)
  anioLectivo!: number;

  @ApiProperty({
    description: 'Cupo máximo de estudiantes',
    example: 15,
  })
  @IsInt()
  @Min(1)
  @Max(50)
  cupoMaximo!: number;

  @ApiProperty({
    description: 'ID del docente asignado',
    example: 'clt1abc123',
  })
  @IsString()
  @IsNotEmpty()
  docenteId!: string;

  @ApiPropertyOptional({
    description: 'ID del sector (Matemática o Programación)',
    example: 'clt3abc789',
  })
  @IsOptional()
  @IsString()
  sectorId?: string;

  @ApiPropertyOptional({
    description: 'Nivel o descripción del grupo',
    example: '6 y 7 años',
  })
  @IsOptional()
  @IsString()
  nivel?: string;

  @ApiProperty({
    description: 'IDs de los estudiantes a inscribir en el grupo',
    example: ['clt4abc111', 'clt4abc222'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  estudiantesIds!: string[];
}
