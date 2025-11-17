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
  MEMBRESIA = 'MEMBRESIA', // Legacy: membresia-{id}-tutor-{id}-producto-{id}
  INSCRIPCION_MENSUAL = 'INSCRIPCION_MENSUAL', // Legacy: inscripcion-{id}-estudiante-{id}-producto-{id}
  INSCRIPCION_2026 = 'INSCRIPCION_2026', // inscripcion2026-{id}-tutor-{id}-tipo-{tipo}
  PAGO_COLONIA = 'PAGO_COLONIA', // Colonia enero
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

  /**
   * Crear external_reference para membresía (Legacy)
   * Format: "membresia-{membresiaId}-tutor-{tutorId}-producto-{productoId}"
   */
  membresia(membresiaId: string, tutorId: string, productoId: string): string {
    return `membresia-${membresiaId}-tutor-${tutorId}-producto-${productoId}`;
  },

  /**
   * Crear external_reference para inscripción mensual (Legacy)
   * Format: "inscripcion-{inscripcionId}-estudiante-{estudianteId}-producto-{productoId}"
   */
  inscripcionMensual(inscripcionId: string, estudianteId: string, productoId: string): string {
    return `inscripcion-${inscripcionId}-estudiante-${estudianteId}-producto-${productoId}`;
  },

  /**
   * Crear external_reference para inscripción 2026
   * Format: "inscripcion2026-{inscripcionId}-tutor-{tutorId}-tipo-{tipoInscripcion}"
   */
  inscripcion2026(inscripcionId: string, tutorId: string, tipoInscripcion: string): string {
    return `inscripcion2026-${inscripcionId}-tutor-${tutorId}-tipo-${tipoInscripcion}`;
  },
};

/**
 * Resultado de parsear external_reference legacy
 */
export interface LegacyExternalReferenceResult {
  tipo: TipoExternalReference;
  ids: Record<string, string>;
}

/**
 * Parser de external_reference (formatos nuevos con ':')
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
 * Parser de external_reference legacy (formatos con '-')
 * @param externalReference - String en formato legacy
 * @returns Objeto parseado o null si formato inválido
 *
 * Formatos soportados:
 * - "membresia-{id}-tutor-{id}-producto-{id}"
 * - "inscripcion-{id}-estudiante-{id}-producto-{id}"
 * - "inscripcion2026-{id}-tutor-{id}-tipo-{tipo}"
 * - ID directo (colonia)
 */
export function parseLegacyExternalReference(
  externalReference: string,
): LegacyExternalReferenceResult | null {
  // Caso 1: Membresía
  if (externalReference.startsWith('membresia-')) {
    const match = externalReference.match(
      /^membresia-(.+?)-tutor-(.+?)-producto-(.+)$/,
    );
    if (!match) return null;
    return {
      tipo: TipoExternalReference.MEMBRESIA,
      ids: {
        membresiaId: match[1],
        tutorId: match[2],
        productoId: match[3],
      },
    };
  }

  // Caso 2: Inscripción mensual
  if (externalReference.startsWith('inscripcion-')) {
    const match = externalReference.match(
      /^inscripcion-(.+?)-estudiante-(.+?)-producto-(.+)$/,
    );
    if (!match) return null;
    return {
      tipo: TipoExternalReference.INSCRIPCION_MENSUAL,
      ids: {
        inscripcionId: match[1],
        estudianteId: match[2],
        productoId: match[3],
      },
    };
  }

  // Caso 3: Inscripción 2026
  if (externalReference.startsWith('inscripcion2026-')) {
    const match = externalReference.match(
      /^inscripcion2026-(.+?)-tutor-(.+?)-tipo-(.+)$/,
    );
    if (!match) return null;
    return {
      tipo: TipoExternalReference.INSCRIPCION_2026,
      ids: {
        inscripcionId: match[1],
        tutorId: match[2],
        tipoInscripcion: match[3],
      },
    };
  }

  // Caso 4: ID directo (colonia, etc.)
  // Asumimos que es un ID si es solo dígitos
  if (/^\d+$/.test(externalReference)) {
    return {
      tipo: TipoExternalReference.PAGO_COLONIA,
      ids: {
        pagoId: externalReference,
      },
    };
  }

  return null;
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
