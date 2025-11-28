/**
 * Utilidades para validación de códigos de planificación
 */

import type {
  CodigoPlanificacionValido,
  ValidacionCodigo,
} from '../types/planificacion-loader.types';
import { CIENCIAS_ORDENADAS } from '../../gimnasio/views/constants/ciencias.constants';

/**
 * Valida si un código es una planificación válida del Mes de la Ciencia
 */
export function validarCodigoPlanificacion(codigo: string): ValidacionCodigo {
  // Verificar que el código esté en la lista de ciencias válidas
  const esValido = CIENCIAS_ORDENADAS.includes(codigo as CodigoPlanificacionValido);

  if (!esValido) {
    return {
      valido: false,
      codigo: null,
      error: `Código de planificación inválido: "${codigo}". Códigos válidos: ${CIENCIAS_ORDENADAS.join(', ')}`,
    };
  }

  return {
    valido: true,
    codigo: codigo as CodigoPlanificacionValido,
    error: null,
  };
}

/**
 * Obtiene la ruta del módulo de planificación
 */
export function obtenerRutaModulo(codigo: CodigoPlanificacionValido): string {
  return `@/planificaciones/${codigo}/index`;
}

/**
 * Verifica si un estudiante puede acceder a una planificación según su nivel
 */
export function puedeAccederPorNivel(
  nivelEstudiante: number,
  _codigo: CodigoPlanificacionValido,
): boolean {
  // Por ahora todas las ciencias son accesibles para todos los niveles
  // TODO: usar codigo para agregar lógica específica si alguna ciencia requiere nivel mínimo
  return nivelEstudiante >= 1 && nivelEstudiante <= 10;
}
