/**
 * Constantes de dominio para el sistema de pagos
 *
 * Centraliza:
 * - Estados de pago (internos y MercadoPago)
 * - Mapeo de estados externos a internos
 * - Formatos de external_reference
 * - Parsers y formateadores
 */

/**
 * Estados de pago internos del sistema
 */
export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  PAGADO = 'PAGADO',
  CANCELADO = 'CANCELADO',
  RECHAZADO = 'RECHAZADO',
  EXPIRADO = 'EXPIRADO',
  REEMBOLSADO = 'REEMBOLSADO',
}

/**
 * Estados de MercadoPago (externos)
 */
export enum EstadoMercadoPago {
  PENDING = 'pending',
  APPROVED = 'approved',
  AUTHORIZED = 'authorized',
  IN_PROCESS = 'in_process',
  IN_MEDIATION = 'in_mediation',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  CHARGED_BACK = 'charged_back',
}

/**
 * Mapeo de estados MercadoPago → Estados internos
 */
export const MERCADOPAGO_TO_ESTADO_PAGO: Record<EstadoMercadoPago, EstadoPago> = {
  [EstadoMercadoPago.PENDING]: EstadoPago.PENDIENTE,
  [EstadoMercadoPago.APPROVED]: EstadoPago.PAGADO,
  [EstadoMercadoPago.AUTHORIZED]: EstadoPago.PAGADO,
  [EstadoMercadoPago.IN_PROCESS]: EstadoPago.PENDIENTE,
  [EstadoMercadoPago.IN_MEDIATION]: EstadoPago.PENDIENTE,
  [EstadoMercadoPago.REJECTED]: EstadoPago.RECHAZADO,
  [EstadoMercadoPago.CANCELLED]: EstadoPago.CANCELADO,
  [EstadoMercadoPago.REFUNDED]: EstadoPago.REEMBOLSADO,
  [EstadoMercadoPago.CHARGED_BACK]: EstadoPago.REEMBOLSADO,
};

/**
 * Mapear estado de MercadoPago a estado interno
 * @param estadoMercadoPago - Estado de MercadoPago
 * @returns Estado interno del sistema
 */
export function mapearEstadoMercadoPago(estadoMercadoPago: string): EstadoPago {
  const estadoEnum = estadoMercadoPago as EstadoMercadoPago;
  return MERCADOPAGO_TO_ESTADO_PAGO[estadoEnum] || EstadoPago.PENDIENTE;
}

/**
 * Tipos de external_reference
 */
export enum TipoExternalReference {
  CLASE_INSCRIPCION = 'CLASE_INSCRIPCION',
  CURSO_INSCRIPCION = 'CURSO_INSCRIPCION',
  ESTUDIANTE_RECARGA = 'ESTUDIANTE_RECARGA',
}

/**
 * Formato: "CLASE_INSCRIPCION:{claseId}:{estudianteId}:{fecha}"
 */
export interface ClaseInscripcionReference {
  tipo: TipoExternalReference.CLASE_INSCRIPCION;
  claseId: string;
  estudianteId: string;
  fecha: string; // ISO date
}

/**
 * Formato: "CURSO_INSCRIPCION:{cursoId}:{estudianteId}"
 */
export interface CursoInscripcionReference {
  tipo: TipoExternalReference.CURSO_INSCRIPCION;
  cursoId: string;
  estudianteId: string;
}

/**
 * Formato: "ESTUDIANTE_RECARGA:{estudianteId}:{monto}"
 */
export interface EstudianteRecargaReference {
  tipo: TipoExternalReference.ESTUDIANTE_RECARGA;
  estudianteId: string;
  monto: number;
}

/**
 * Union type de todas las referencias
 */
export type ExternalReference =
  | ClaseInscripcionReference
  | CursoInscripcionReference
  | EstudianteRecargaReference;

/**
 * Builders para generar external_reference
 */
export const EXTERNAL_REFERENCE_FORMATS = {
  /**
   * Crear external_reference para inscripción a clase
   */
  claseInscripcion(claseId: string, estudianteId: string, fechaInicio: string): string {
    return `${TipoExternalReference.CLASE_INSCRIPCION}:${claseId}:${estudianteId}:${fechaInicio}`;
  },

  /**
   * Crear external_reference para inscripción a curso
   */
  cursoInscripcion(cursoId: string, estudianteId: string): string {
    return `${TipoExternalReference.CURSO_INSCRIPCION}:${cursoId}:${estudianteId}`;
  },

  /**
   * Crear external_reference para recarga de saldo
   */
  estudianteRecarga(estudianteId: string, monto: number): string {
    return `${TipoExternalReference.ESTUDIANTE_RECARGA}:${estudianteId}:${monto}`;
  },
};

/**
 * Parser de external_reference
 * @param externalReference - String en formato "TIPO:param1:param2:..."
 * @returns Objeto parseado o null si formato inválido
 */
export function parseExternalReference(externalReference: string): ExternalReference | null {
  const parts = externalReference.split(':');
  const tipo = parts[0] as TipoExternalReference;

  switch (tipo) {
    case TipoExternalReference.CLASE_INSCRIPCION:
      if (parts.length !== 4) return null;
      return {
        tipo: TipoExternalReference.CLASE_INSCRIPCION,
        claseId: parts[1],
        estudianteId: parts[2],
        fecha: parts[3],
      };

    case TipoExternalReference.CURSO_INSCRIPCION:
      if (parts.length !== 3) return null;
      return {
        tipo: TipoExternalReference.CURSO_INSCRIPCION,
        cursoId: parts[1],
        estudianteId: parts[2],
      };

    case TipoExternalReference.ESTUDIANTE_RECARGA:
      if (parts.length !== 3) return null;
      return {
        tipo: TipoExternalReference.ESTUDIANTE_RECARGA,
        estudianteId: parts[1],
        monto: parseFloat(parts[2]),
      };

    default:
      return null;
  }
}

/**
 * Validar formato de external_reference
 * @param externalReference - String a validar
 * @returns true si es válido
 */
export function esExternalReferenceValido(externalReference: string): boolean {
  return parseExternalReference(externalReference) !== null;
}

/**
 * Extraer tipo de external_reference sin parsear completo
 * @param externalReference - String en formato "TIPO:..."
 * @returns Tipo o null si inválido
 */
export function getTipoExternalReference(externalReference: string): TipoExternalReference | null {
  const tipo = externalReference.split(':')[0] as TipoExternalReference;
  return Object.values(TipoExternalReference).includes(tipo) ? tipo : null;
}
