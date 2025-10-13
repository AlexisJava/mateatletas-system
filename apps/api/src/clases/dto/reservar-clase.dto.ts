import { IsString, IsOptional } from 'class-validator';

export class ReservarClaseDto {
  @IsString()
  estudianteId!: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
