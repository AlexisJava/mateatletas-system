/**
 * Helper module for parsing schedule strings (horarios)
 *
 * Extracts days and times from Spanish schedule strings like:
 * - "Lunes 14:00 - 15:00"
 * - "Martes y Jueves 10:30"
 * - "Sáb 9:00"
 *
 * Pure functions - no side effects, no dependencies
 */

/** Mapeo de días en español a número (0=Domingo, 1=Lunes, etc.) */
export const DIAS_SEMANA_MAP: Record<string, number> = {
  domingo: 0,
  dom: 0,
  lunes: 1,
  lun: 1,
  martes: 2,
  mar: 2,
  miercoles: 3,
  miércoles: 3,
  mie: 3,
  jueves: 4,
  jue: 4,
  viernes: 5,
  vie: 5,
  sabado: 6,
  sábado: 6,
  sab: 6,
};

/** Regex para extraer hora en formato HH:MM */
export const HORA_REGEX = /(\d{1,2}):(\d{2})/;

/** Mapea prefijos de días a su key normalizada */
export const DIA_NORMALIZADO: Record<string, string> = {
  lun: 'lun',
  lunes: 'lun',
  mar: 'mar',
  martes: 'mar',
  mi: 'mie',
  mie: 'mie',
  mié: 'mie',
  miercoles: 'mie',
  miércoles: 'mie',
  jue: 'jue',
  jueves: 'jue',
  vie: 'vie',
  viernes: 'vie',
  sa: 'sab',
  sab: 'sab',
  sá: 'sab',
  sáb: 'sab',
  sabado: 'sab',
  sábado: 'sab',
  dom: 'dom',
  domingo: 'dom',
};

/**
 * Extrae los días de la semana mencionados en un string de horario
 * @param horario - String como "Lunes y Miércoles 14:00"
 * @returns Array de números de día (0=Domingo, 1=Lunes, etc.)
 */
export function extraerDiasDeHorario(horario: string): number[] {
  const horarioLower = horario.toLowerCase();
  const diasEncontrados: number[] = [];

  for (const [dia, num] of Object.entries(DIAS_SEMANA_MAP)) {
    if (horarioLower.includes(dia) && !diasEncontrados.includes(num)) {
      diasEncontrados.push(num);
    }
  }

  return diasEncontrados;
}

/**
 * Extrae hora y minutos de un string de horario
 * @param horario - String como "Lunes 14:30 - 15:30"
 * @returns Objeto con hora y minutos, o null si no se encuentra
 */
export function extraerHoraDeHorario(
  horario: string,
): { hora: number; minutos: number } | null {
  const match = HORA_REGEX.exec(horario);
  if (!match?.[1] || !match[2]) return null;
  return {
    hora: parseInt(match[1], 10),
    minutos: parseInt(match[2], 10),
  };
}

/**
 * Calcula días hasta la próxima ocurrencia de un día de la semana
 * @param diaClase - Día de la clase (0-6)
 * @param diaActual - Día actual (0-6)
 * @param horaActual - Hora actual en minutos desde medianoche
 * @param horaClase - Hora de la clase en minutos desde medianoche
 * @returns Número de días hasta la próxima ocurrencia
 */
export function calcularDiasHastaDia(
  diaClase: number,
  diaActual: number,
  horaActual: number,
  horaClase: number,
): number {
  let diasHasta = diaClase - diaActual;

  if (diasHasta === 0 && horaActual >= horaClase) {
    diasHasta = 7;
  } else if (diasHasta < 0) {
    diasHasta += 7;
  }

  return diasHasta;
}

/**
 * Calcula la próxima ocurrencia de una clase basado en el horario
 * @param horario - String de horario como "Lunes 14:00"
 * @param fechaFin - Fecha límite opcional
 * @param now - Fecha actual (opcional, para testing)
 * @returns Date de la próxima clase, o null si no se puede calcular
 */
export function calcularProximaClase(
  horario: string | null,
  fechaFin: Date | null,
  now: Date = new Date(),
): Date | null {
  if (!horario) return null;

  if (fechaFin && fechaFin < now) return null;

  const diasEncontrados = extraerDiasDeHorario(horario);
  const tiempo = extraerHoraDeHorario(horario);

  if (diasEncontrados.length === 0 || !tiempo) return null;

  const { hora, minutos } = tiempo;
  const diaActual = now.getDay();
  const horaActual = now.getHours() * 60 + now.getMinutes();
  const horaClase = hora * 60 + minutos;

  let diasHastaProxima = Infinity;
  for (const diaClase of diasEncontrados) {
    const diasHasta = calcularDiasHastaDia(
      diaClase,
      diaActual,
      horaActual,
      horaClase,
    );
    if (diasHasta < diasHastaProxima) {
      diasHastaProxima = diasHasta;
    }
  }

  if (diasHastaProxima === Infinity) return null;

  const proximaClase = new Date(now);
  proximaClase.setDate(now.getDate() + diasHastaProxima);
  proximaClase.setHours(hora, minutos, 0, 0);

  if (fechaFin && proximaClase > fechaFin) return null;

  return proximaClase;
}

/**
 * Cuenta clases por día para un horario dado
 * @param horario - String de horario
 * @param contadores - Objeto mutable con contadores por día normalizado
 */
export function contarClasesPorDia(
  horario: string,
  contadores: Record<string, number>,
): void {
  const horarioLower = horario.toLowerCase();

  for (const [patron, diaNormalizado] of Object.entries(DIA_NORMALIZADO)) {
    if (horarioLower.includes(patron)) {
      contadores[diaNormalizado] = (contadores[diaNormalizado] ?? 0) + 1;
      return; // Solo contar una vez por comisión
    }
  }
}

/**
 * Cuenta cuántos días por semana tiene un horario
 * @param horario - String de horario
 * @returns Número de días únicos (mínimo 1)
 */
export function contarDiasPorSemana(horario: string): number {
  const horarioLower = horario.toLowerCase();
  const dias = ['lun', 'mar', 'mié', 'mie', 'jue', 'vie', 'sáb', 'sab', 'dom'];
  let count = 0;
  const diasEncontrados = new Set<string>();

  for (const dia of dias) {
    if (horarioLower.includes(dia) && !diasEncontrados.has(dia.slice(0, 2))) {
      diasEncontrados.add(dia.slice(0, 2));
      count++;
    }
  }

  return count || 1; // Mínimo 1 día
}
