import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { TipoNotificacion } from '@prisma/client';

export class CreateNotificacionDto {
  @IsEnum(TipoNotificacion)
  tipo!: TipoNotificacion;

  @IsString()
  titulo!: string;

  @IsString()
  mensaje!: string;

  @IsString()
  docente_id!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
