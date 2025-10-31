/**
 * Tipos para el sistema de planificaciones simplificado
 */

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Configuración que debe exportar cada planificación
 * Esta es la ÚNICA configuración que necesitás definir
 */
export interface PlanificacionConfig {
  /** Código único (debe coincidir con el nombre del archivo) */
  codigo: string;

  /** Título descriptivo */
  titulo: string;

  /** Grupo pedagógico (B1, B2, B3, A1, etc.) */
  grupo: string;

  /** Mes (1-12), null para cursos anuales */
  mes?: number | null;

  /** Año */
  anio: number;

  /** Total de semanas (4 para mensuales, 8-12 para cursos) */
  semanas: number;
}

/**
 * Estado del progreso del estudiante
 */
export interface ProgresoEstudiante {
  /** Semana actual (1-N) */
  semanaActual: number;

  /** Última actividad registrada */
  ultimaActividad: Date;

  /** Estado guardado (flexible, definido por tu componente) */
  estadoGuardado?: JsonValue;

  /** Tiempo total en minutos */
  tiempoTotalMinutos: number;

  /** Puntos totales obtenidos */
  puntosTotales: number;
}

/**
 * Información de qué semanas están activas
 */
export interface InfoSemanasActivas {
  /** Números de semanas activas [1, 2, 3] */
  semanasActivas: number[];

  /** Semana actual del estudiante */
  semanaActual: number;

  /** Puede acceder a una semana específica */
  puedeAcceder: (semana: number) => boolean;
}

/**
 * Hooks disponibles para tu componente
 */
export interface UsePlanificacionProgressReturn {
  /** Progreso actual del estudiante */
  progreso: ProgresoEstudiante | null;

  /** Info de semanas activas */
  semanasInfo: InfoSemanasActivas;

  /** Está cargando datos */
  isLoading: boolean;

  /** Hubo un error */
  error: string | null;

  /** Guardar estado personalizado del juego */
  guardarEstado: (estado: JsonValue) => Promise<void>;

  /** Avanzar a la siguiente semana */
  avanzarSemana: () => Promise<void>;

  /** Marcar semana como completada y asignar puntos */
  completarSemana: (puntos: number) => Promise<void>;

  /** Actualizar tiempo jugado (se llama automáticamente cada minuto) */
  registrarTiempo: (minutos: number) => Promise<void>;
}
