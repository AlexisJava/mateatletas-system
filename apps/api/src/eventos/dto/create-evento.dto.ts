import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsInt,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { TipoEvento } from '@prisma/client';

export class CreateEventoDto {
  @IsString()
  titulo!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsDateString()
  fecha_inicio!: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @IsBoolean()
  todo_el_dia?: boolean;

  @IsEnum(TipoEvento)
  tipo!: TipoEvento;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsBoolean()
  recordatorio?: boolean;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(1440) // Máximo 24 horas
  minutos_antes?: number;
}
