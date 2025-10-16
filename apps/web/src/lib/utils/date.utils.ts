/**
 * Utilidades para manejo de fechas
 * Funciones reutilizables en todo el proyecto
 */

/**
 * Calcula la edad en años desde una fecha de nacimiento
 * @param fechaNacimiento - Fecha de nacimiento (Date o string)
 * @returns Edad en años
 */
export function calcularEdad(fechaNacimiento: Date | string): number {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);

  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  // Ajustar si aún no ha cumplido años este año
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  return edad;
}

/**
 * Formatea una fecha a formato legible en español
 * @param fecha - Fecha a formatear
 * @returns Fecha formateada (ej: "15 de Octubre, 2025")
 */
export function formatearFecha(fecha: Date | string): string {
  const date = new Date(fecha);

  const opciones: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };

  return date.toLocaleDateString('es-ES', opciones);
}

/**
 * Formatea una fecha y hora a formato legible en español
 * @param fecha - Fecha y hora a formatear
 * @returns Fecha y hora formateadas (ej: "15 de Octubre, 2025 a las 14:30")
 */
export function formatearFechaHora(fecha: Date | string): string {
  const date = new Date(fecha);

  const opciones: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return date.toLocaleDateString('es-ES', opciones);
}

/**
 * Formatea una fecha a formato corto (dd/mm/aaaa)
 * @param fecha - Fecha a formatear
 * @returns Fecha formateada (ej: "15/10/2025")
 */
export function formatearFechaCorta(fecha: Date | string): string {
  const date = new Date(fecha);

  const dia = date.getDate().toString().padStart(2, '0');
  const mes = (date.getMonth() + 1).toString().padStart(2, '0');
  const anio = date.getFullYear();

  return `${dia}/${mes}/${anio}`;
}

/**
 * Calcula la diferencia en días entre dos fechas
 * @param fecha1 - Primera fecha
 * @param fecha2 - Segunda fecha
 * @returns Diferencia en días
 */
export function diferenciaEnDias(fecha1: Date | string, fecha2: Date | string): number {
  const date1 = new Date(fecha1);
  const date2 = new Date(fecha2);

  const diff = Math.abs(date1.getTime() - date2.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Verifica si una fecha es hoy
 * @param fecha - Fecha a verificar
 * @returns true si es hoy, false si no
 */
export function esHoy(fecha: Date | string): boolean {
  const date = new Date(fecha);
  const hoy = new Date();

  return (
    date.getDate() === hoy.getDate() &&
    date.getMonth() === hoy.getMonth() &&
    date.getFullYear() === hoy.getFullYear()
  );
}

/**
 * Verifica si una fecha está en el pasado
 * @param fecha - Fecha a verificar
 * @returns true si es pasado, false si no
 */
export function esPasado(fecha: Date | string): boolean {
  const date = new Date(fecha);
  const hoy = new Date();

  return date < hoy;
}

/**
 * Verifica si una fecha está en el futuro
 * @param fecha - Fecha a verificar
 * @returns true si es futuro, false si no
 */
export function esFuturo(fecha: Date | string): boolean {
  const date = new Date(fecha);
  const hoy = new Date();

  return date > hoy;
}
