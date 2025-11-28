/**
 * Utilidades de tiempo para parsing y cálculo de horarios
 *
 * Proporciona funciones robustas para:
 * - Parsear horarios en formato HH:MM
 * - Convertir horarios a minutos desde medianoche
 * - Calcular duraciones entre horarios
 */

export interface HorarioParsed {
  horas: number;
  minutos: number;
}

/**
 * Parsea un horario en formato HH:MM
 *
 * @param horario - String en formato "HH:MM" (ej: "14:30")
 * @returns Objeto con horas y minutos como números
 * @throws Error si el formato es inválido o los valores están fuera de rango
 *
 * @example
 * parseHorario("14:30") // { horas: 14, minutos: 30 }
 * parseHorario("09:05") // { horas: 9, minutos: 5 }
 */
export function parseHorario(horario: string): HorarioParsed {
  if (!horario || typeof horario !== 'string') {
    throw new Error(`Horario inválido: valor vacío o no es string`);
  }

  const regex = /^(\d{1,2}):(\d{2})$/;
  const match = horario.match(regex);

  if (!match) {
    throw new Error(
      `Horario inválido: "${horario}" no tiene formato HH:MM válido`,
    );
  }

  const [, horasStr, minutosStr] = match;
  if (!horasStr || !minutosStr) {
    throw new Error(
      `Horario inválido: "${horario}" no tiene formato HH:MM válido`,
    );
  }

  const horas = parseInt(horasStr, 10);
  const minutos = parseInt(minutosStr, 10);

  if (horas < 0 || horas > 23) {
    throw new Error(
      `Horario inválido: horas ${horas} fuera de rango (0-23) en "${horario}"`,
    );
  }

  if (minutos < 0 || minutos > 59) {
    throw new Error(
      `Horario inválido: minutos ${minutos} fuera de rango (0-59) en "${horario}"`,
    );
  }

  return { horas, minutos };
}

/**
 * Convierte un horario a minutos desde medianoche
 *
 * @param horario - String en formato "HH:MM"
 * @returns Total de minutos desde las 00:00
 *
 * @example
 * horarioToMinutos("00:00") // 0
 * horarioToMinutos("01:30") // 90
 * horarioToMinutos("14:30") // 870
 */
export function horarioToMinutos(horario: string): number {
  const { horas, minutos } = parseHorario(horario);
  return horas * 60 + minutos;
}

/**
 * Calcula la duración en minutos entre dos horarios
 *
 * @param horaInicio - Horario de inicio en formato "HH:MM"
 * @param horaFin - Horario de fin en formato "HH:MM"
 * @returns Duración en minutos
 * @throws Error si horaFin es anterior a horaInicio (no soporta cruce de medianoche)
 *
 * @example
 * calcularDuracionMinutos("09:00", "10:30") // 90
 * calcularDuracionMinutos("14:00", "15:00") // 60
 */
export function calcularDuracionMinutos(
  horaInicio: string,
  horaFin: string,
): number {
  const minutosInicio = horarioToMinutos(horaInicio);
  const minutosFin = horarioToMinutos(horaFin);

  if (minutosFin < minutosInicio) {
    throw new Error(
      `Horario inválido: hora fin "${horaFin}" es anterior a hora inicio "${horaInicio}" (no se soporta cruce de medianoche)`,
    );
  }

  return minutosFin - minutosInicio;
}
