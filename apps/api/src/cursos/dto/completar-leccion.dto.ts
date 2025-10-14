import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

/**
 * DTO para completar una lección (acción del estudiante)
 * Incluye calificación para quizzes y tiempo invertido
 */
export class CompletarLeccionDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  calificacion?: number; // Para quizzes (0-100)

  @IsOptional()
  @IsInt()
  @Min(1)
  tiempo_invertido_minutos?: number;

  @IsOptional()
  @IsString()
  notas_estudiante?: string;

  @IsOptional()
  @IsString()
  ultima_respuesta?: string; // JSON string con respuestas
}
