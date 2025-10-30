/**
 * Tipos para la vista de Entrenamientos del Mes de la Ciencia
 * Noviembre 2025
 */

/**
 * Código único de cada ciencia del mes
 */
export type CodigoCiencia =
  | '2025-11-mes-ciencia-astronomia'
  | '2025-11-mes-ciencia-fisica'
  | '2025-11-mes-ciencia-informatica'
  | '2025-11-mes-ciencia-quimica';

/**
 * Metadatos estáticos de cada ciencia
 */
export interface MetadatosCiencia {
  readonly codigo: CodigoCiencia;
  readonly titulo: string;
  readonly descripcion: string;
  readonly emoji: string;
  readonly gradient: string;
  readonly orden: number;
}

/**
 * Progreso del estudiante en una ciencia específica
 */
export interface ProgresoCiencia {
  codigo: CodigoCiencia;
  progresoPorcentaje: number; // 0-100
  actividadesCompletadas: number;
  actividadesTotales: number;
  puntosGanados: number;
  tiempoInvertidoMinutos: number;
  estrellas: number; // 0-4
  ultimaActividad: string | null; // ISO date string
}

/**
 * Ciencia completa con metadatos + progreso
 */
export interface CienciaCompleta {
  metadatos: MetadatosCiencia;
  progreso: ProgresoCiencia;
}

/**
 * Respuesta del endpoint GET /estudiante/mes-ciencia/progreso
 */
export interface MesCienciaProgresoResponse {
  ciencias: ProgresoCiencia[];
  estadisticas: EstadisticasMesCiencia;
}

/**
 * Estadísticas globales del Mes de la Ciencia
 */
export interface EstadisticasMesCiencia {
  progresoGlobalPorcentaje: number; // 0-100
  totalActividadesCompletadas: number;
  totalActividades: number;
  totalPuntosGanados: number;
  totalTiempoInvertidoMinutos: number;
  estrellasGanadas: number; // Suma de todas las estrellas
  cienciasCompletadas: number; // Cuántas tienen 100%
}

/**
 * Props para el componente CienciaCard
 */
export interface CienciaCardProps {
  ciencia: CienciaCompleta;
  onClick: () => void;
  className?: string;
}

/**
 * Props para el componente EntrenamientosView
 */
export interface EntrenamientosViewProps {
  estudiante: {
    id: string;
    nombre: string;
    nivel_actual: number;
  };
}

/**
 * Estado del hook useEntrenamientos
 */
export interface UseEntrenamientosReturn {
  ciencias: CienciaCompleta[];
  estadisticas: EstadisticasMesCiencia;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
