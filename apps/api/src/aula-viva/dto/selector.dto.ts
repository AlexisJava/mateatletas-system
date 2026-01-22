import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO para seleccionar un estudiante aleatorio
 */
export class SeleccionarAleatorioDto {
  @IsString()
  @IsNotEmpty()
  salaId: string;
}

/**
 * DTO para resetear el selector
 */
export class ResetearSelectorDto {
  @IsString()
  @IsNotEmpty()
  salaId: string;
}
