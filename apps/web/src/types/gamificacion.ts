import type { JsonValue } from '@/types/common';

export interface Logro {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  monedas_recompensa: number;
  xp_recompensa: number;
  criterio_tipo: string;
  criterio_valor: string;
  icono: string;
  rareza: 'comun' | 'raro' | 'epico' | 'legendario';
  secreto: boolean;
  animacion?: string;
  titulo?: string;
  badge?: string;
  mensaje_desbloqueo?: string;
  extras?: string[];
  orden: number;
  activo: boolean;
}

export interface LogroEstudiante {
  id: string;
  estudiante_id: string;
  logro_id: string;
  fecha_desbloqueo: Date;
  visto: boolean;
  logro: Logro;
}

export interface RecursosEstudiante {
  id: string;
  estudiante_id: string;
  monedas_total: number;
  xp_total: number;
  nivel: number;
  xp_progreso: number;
  xp_necesario: number;
  porcentaje_nivel: number;
}

export interface RachaEstudiante {
  id: string;
  estudiante_id: string;
  racha_actual: number;
  racha_maxima: number;
  ultima_actividad: Date | null;
  inicio_racha_actual: Date | null;
  total_dias_activos: number;
}

export interface TransaccionRecurso {
  id: string;
  tipo_recurso: 'MONEDAS' | 'XP';
  cantidad: number;
  razon: string;
  metadata: Record<string, JsonValue> | null;
  fecha: Date;
}

export interface ProgresoLogros {
  total_logros: number;
  logros_desbloqueados: number;
  porcentaje: number;
  por_categoria: {
    [key: string]: {
      total: number;
      desbloqueados: number;
      logros: (Logro & { desbloqueado: boolean; fecha_desbloqueo: Date | null })[];
    };
  };
}

export interface NotificacionLogro {
  logro: Logro;
  recompensas: {
    monedas: number;
    xp: number;
  };
  nuevo_nivel?: number;
}
