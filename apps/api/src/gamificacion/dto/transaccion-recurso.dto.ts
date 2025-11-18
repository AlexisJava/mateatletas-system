import { IsString, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class AgregarRecursoDto {
  @IsNumber()
  @IsPositive()
  cantidad!: number;

  @IsString()
  razon!: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class GastarMonedasDto {
  @IsNumber()
  @IsPositive()
  cantidad!: number;

  @IsString()
  razon!: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
