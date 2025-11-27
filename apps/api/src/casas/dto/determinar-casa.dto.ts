import { IsInt, Min, Max } from 'class-validator';

/**
 * DTO para determinar la casa de un estudiante según su edad
 */
export class DeterminarCasaDto {
  /**
   * Edad del estudiante (6-17 años)
   */
  @IsInt({ message: 'La edad debe ser un número entero' })
  @Min(6, { message: 'La edad mínima es 6 años' })
  @Max(17, { message: 'La edad máxima es 17 años' })
  edad!: number;
}
