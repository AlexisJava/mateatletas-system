import type { Logro, LogroEstudiante } from '@/types/gamificacion';

/**
 * Utilidades para el sistema de gamificación
 */

const toValidDate = (valor: unknown): Date | null => {
  if (valor instanceof Date) return valor;
  if (typeof valor === 'string' || typeof valor === 'number') {
    const parsed = new Date(valor);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

/**
 * Normaliza un logro hacia el formato LogroEstudiante cuando cuenta con fecha válida.
 */
export function mapLogroToLogroEstudiante(
  estudianteId: string,
  logro: Logro,
): LogroEstudiante | null {
  if (!logro.desbloqueado) {
    return null;
  }

  const fecha = toValidDate(logro.fecha_desbloqueo);
  if (!fecha) {
    return null;
  }

  return {
    id: `${estudianteId}-${logro.id}`,
    estudiante_id: estudianteId,
    logro_id: logro.id,
    fecha_desbloqueo: fecha,
    visto: logro.desbloqueado,
    logro,
  };
}

/**
 * Convierte una lista de logros a LogroEstudiante filtrando los que no están desbloqueados.
 */
export function mapLogrosToEstudiante(estudianteId: string, logros: Logro[]): LogroEstudiante[] {
  return logros.reduce<LogroEstudiante[]>((acc, logroActual) => {
    const normalizado = mapLogroToLogroEstudiante(estudianteId, logroActual);
    if (normalizado) {
      acc.push(normalizado);
    }
    return acc;
  }, []);
}

/**
 * Calcular nivel basado en XP total
 * Formula: nivel = floor(sqrt(xp / 100)) + 1
 */
export function calcularNivel(xpTotal: number): number {
  return Math.floor(Math.sqrt(xpTotal / 100)) + 1;
}

/**
 * Calcular XP necesario para un nivel específico
 * Formula: xp = (nivel - 1)² × 100
 */
export function xpParaNivel(nivel: number): number {
  return Math.pow(nivel - 1, 2) * 100;
}

/**
 * Calcular progreso dentro del nivel actual
 * @returns { xpProgreso, xpNecesario, porcentaje }
 */
export function calcularProgresoNivel(xpTotal: number): {
  xpProgreso: number;
  xpNecesario: number;
  porcentaje: number;
} {
  const nivelActual = calcularNivel(xpTotal);
  const xpNivelActual = xpParaNivel(nivelActual);
  const xpNivelSiguiente = xpParaNivel(nivelActual + 1);

  const xpProgreso = xpTotal - xpNivelActual;
  const xpNecesario = xpNivelSiguiente - xpNivelActual;
  const porcentaje = Math.round((xpProgreso / xpNecesario) * 100);

  return { xpProgreso, xpNecesario, porcentaje };
}

/**
 * Formatear números grandes con K, M, B
 * Ejemplos: 1500 → "1.5K", 1000000 → "1M"
 */
export function formatearNumero(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

/**
 * Obtener color según rareza de logro
 */
export function colorRareza(rareza: 'comun' | 'raro' | 'epico' | 'legendario'): string {
  const colores = {
    comun: '#94a3b8', // slate-400
    raro: '#3b82f6', // blue-500
    epico: '#a855f7', // purple-500
    legendario: '#f59e0b', // amber-500
  };
  return colores[rareza];
}

/**
 * Obtener gradiente según rareza de logro (para fondos)
 */
export function gradienteRareza(rareza: 'comun' | 'raro' | 'epico' | 'legendario'): string {
  const gradientes = {
    comun: 'from-slate-400 to-slate-600',
    raro: 'from-blue-400 to-blue-600',
    epico: 'from-purple-400 to-purple-600',
    legendario: 'from-amber-400 to-amber-600',
  };
  return gradientes[rareza];
}

/**
 * Obtener emoji según categoría de logro
 */
export function emojiCategoria(categoria: string): string {
  const emojis: Record<string, string> = {
    consistencia: '🔥',
    maestria: '🎓',
    precision: '🎯',
    velocidad: '⚡',
    social: '👥',
    asistencia: '📚',
    desafios: '🏆',
    especializacion: '⭐',
    niveles: '📊',
    secretos: '🔒',
  };
  return emojis[categoria] || '🎮';
}

/**
 * Formatear tiempo restante para racha
 * Ejemplo: "23h 45m restantes" o "Rompiste tu racha hace 2 días"
 */
export function formatearTiempoRacha(ultimaActividad: Date | null): {
  texto: string;
  estado: 'activo' | 'riesgo' | 'perdido';
} {
  if (!ultimaActividad) {
    return { texto: 'Sin actividad reciente', estado: 'perdido' };
  }

  const ahora = new Date();
  const ultima = new Date(ultimaActividad);
  const diferenciaMs = ahora.getTime() - ultima.getTime();
  const diferenciaHoras = Math.floor(diferenciaMs / (1000 * 60 * 60));

  // Racha se pierde después de 24 horas
  if (diferenciaHoras >= 24) {
    const diasPerdidos = Math.floor(diferenciaHoras / 24);
    return {
      texto: `Rompiste tu racha hace ${diasPerdidos} día${diasPerdidos > 1 ? 's' : ''}`,
      estado: 'perdido',
    };
  }

  // Riesgo en las últimas 4 horas
  if (diferenciaHoras >= 20) {
    const horasRestantes = 24 - diferenciaHoras;
    return {
      texto: `${horasRestantes}h restantes para mantener racha`,
      estado: 'riesgo',
    };
  }

  // Activo
  return {
    texto: `Racha activa - Vuelve mañana`,
    estado: 'activo',
  };
}

/**
 * Calcular porcentaje de progreso de logros
 */
export function calcularProgresoLogros(totalLogros: number, logrosDesbloqueados: number): number {
  if (totalLogros === 0) return 0;
  return Math.round((logrosDesbloqueados / totalLogros) * 100);
}

/**
 * Obtener color y gradiente según rareza de logro
 */
export function getColorRareza(rareza: 'comun' | 'raro' | 'epico' | 'legendario') {
  const configs = {
    comun: {
      color: '#94a3b8',
      gradient: 'from-slate-400 to-slate-600',
      border: 'border-slate-400',
      text: 'text-slate-400',
    },
    raro: {
      color: '#3b82f6',
      gradient: 'from-blue-400 to-blue-600',
      border: 'border-blue-400',
      text: 'text-blue-400',
    },
    epico: {
      color: '#a855f7',
      gradient: 'from-purple-400 to-purple-600',
      border: 'border-purple-400',
      text: 'text-purple-400',
    },
    legendario: {
      color: '#f59e0b',
      gradient: 'from-amber-400 to-amber-600',
      border: 'border-amber-400',
      text: 'text-amber-400',
    },
  };
  return configs[rareza];
}

/**
 * Obtener emoji según categoría de logro (alias)
 */
export function getEmojiCategoria(categoria: string): string {
  return emojiCategoria(categoria);
}

/**
 * Verificar si la racha está en riesgo
 */
export function estaEnRiesgoRacha(ultimaActividad: Date | null): boolean {
  const { estado } = formatearTiempoRacha(ultimaActividad);
  return estado === 'riesgo';
}
