import { IsOptional, IsNumberString, IsString } from 'class-validator';

/**
 * DTO para filtrar y paginar equipos
 * Todos los campos son opcionales para permitir diferentes combinaciones de filtros
 */
export class QueryEquiposDto {
  /**
   * Número de página (para paginación)
   * Por defecto: 1
   */
  @IsNumberString()
  @IsOptional()
  page?: string;

  /**
   * Cantidad de resultados por página
   * Por defecto: 10
   */
  @IsNumberString()
  @IsOptional()
  limit?: string;

  /**
   * Búsqueda por nombre de equipo (búsqueda parcial case-insensitive)
   * Ejemplo: "quan" encontrará "Quantum"
   */
  @IsString()
  @IsOptional()
  search?: string;

  /**
   * Ordenar por campo
   * Opciones: nombre, puntos_totales, createdAt
   * Por defecto: nombre
   */
  @IsString()
  @IsOptional()
  sortBy?: 'nombre' | 'puntos_totales' | 'createdAt';

  /**
   * Orden de clasificación
   * Opciones: asc, desc
   * Por defecto: asc
   */
  @IsString()
  @IsOptional()
  order?: 'asc' | 'desc';
}
