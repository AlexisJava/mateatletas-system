import {
  IsString,
  IsNumber,
  IsObject,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class BloqueDto {
  @IsString()
  id!: string;

  @IsNumber()
  @Min(0)
  orden!: number;

  @IsString()
  componente!: string;

  @IsString()
  titulo!: string;

  @IsObject()
  contenido!: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minimoParaAprobar?: number;
}
