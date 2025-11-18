/**
 * Interfaces para estandarizar el formato de respuestas de la API
 *
 * Todas las respuestas de la API deben seguir este formato consistente
 * para facilitar el manejo en el frontend y evitar validaciones defensivas.
 *
 * @see docs/API-RESPONSE-FORMAT.md para documentación completa
 */

/**
 * Formato estándar de respuesta de la API
 *
 * @template T - Tipo del dato retornado
 *
 * @example
 * ```typescript
 * // Respuesta con objeto
 * {
 *   data: { id: '123', nombre: 'Juan' },
 *   metadata: {
 *     timestamp: '2025-11-12T10:30:00.000Z'
 *   },
 *   message: 'Usuario obtenido exitosamente'
 * }
 *
 * // Respuesta con array
 * {
 *   data: [{ id: '1' }, { id: '2' }],
 *   metadata: {
 *     timestamp: '2025-11-12T10:30:00.000Z'
 *   }
 * }
 * ```
 */
export interface ApiResponse<T> {
  /** Datos de la respuesta (objeto, array, primitivo, etc.) */
  data: T;

  /** Metadata adicional de la respuesta */
  metadata?: {
    /** Timestamp ISO 8601 de cuándo se generó la respuesta */
    timestamp: string;
    /** Cualquier otro metadato adicional */
    [key: string]: unknown;
  };

  /** Mensaje descriptivo opcional */
  message?: string;
}

/**
 * Formato estándar para respuestas paginadas
 *
 * @template T - Tipo del dato retornado (debe ser array)
 *
 * @example
 * ```typescript
 * {
 *   data: [{ id: '1' }, { id: '2' }],
 *   metadata: {
 *     total: 100,
 *     page: 1,
 *     limit: 10,
 *     totalPages: 10,
 *     timestamp: '2025-11-12T10:30:00.000Z'
 *   }
 * }
 * ```
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  /** Metadata de paginación (siempre presente en respuestas paginadas) */
  metadata: {
    /** Total de elementos disponibles */
    total: number;
    /** Página actual (1-indexed) */
    page: number;
    /** Límite de elementos por página */
    limit: number;
    /** Total de páginas disponibles */
    totalPages: number;
    /** Timestamp ISO 8601 */
    timestamp: string;
    /** Cualquier otro metadato adicional */
    [key: string]: unknown;
  };
}

/**
 * Helper type para respuestas que pueden estar paginadas o no
 */
export type MaybePagedResponse<T> = ApiResponse<T[]> | PaginatedResponse<T>;
