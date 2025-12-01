import { IsBoolean } from 'class-validator';

export class ToggleComponenteDto {
  @IsBoolean()
  habilitado!: boolean;
}
