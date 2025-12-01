import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BloqueDto } from './bloque.dto';

export class MetadataSemanaDto {
  @IsString()
  titulo!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objetivos?: string[];
}

export class GuardarSemanaDto {
  @ValidateNested()
  @Type(() => MetadataSemanaDto)
  metadata!: MetadataSemanaDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BloqueDto)
  bloques!: BloqueDto[];
}
